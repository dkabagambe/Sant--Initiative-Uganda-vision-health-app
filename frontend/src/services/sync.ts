/**
 * sync.ts  –  Neon ↔ SQLite sync engine
 *
 * Two directions:
 *
 *  PUSH  (SQLite → Neon)
 *    Reads every row in sync_queue where retries < 3.
 *    POSTs each payload to the backend /api/sync endpoint.
 *    On success: removes the queue row, marks local row synced.
 *    On failure: increments retry counter (max 3 → gives up).
 *
 *  PULL  (Neon → SQLite)
 *    Fetches latest records from each Neon API endpoint and
 *    upserts them into local tables so reads work offline.
 *
 * Called from:
 *  - AppBootstrap (pull on first online open)
 *  - NetInfo listener (push when connectivity is restored)
 *  - ScreeningComplete (push immediately after a screening is saved)
 */

import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getPendingQueue,
  dequeueSuccess,
  incrementRetry,
  markScreeningSynced,
  markReferralSynced,
  markPaymentSynced,
  upsertStockItem,
  insertScreening,
  insertReferral,
  insertPayment,
  newLocalId,
  getDb,
} from "./db";

const SYNC_RUNNING_KEY = "__sync_running";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getApiBase(): Promise<string> {
  // Reuse the same config service the rest of the app uses
  const { ConfigService } = await import("./configService");
  return ConfigService.getApiUrl();
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!(state.isConnected && state.isInternetReachable !== false);
}

// ─── PUSH: SQLite → Neon ─────────────────────────────────────────────────────

export async function pushPendingToNeon(): Promise<{
  pushed: number;
  failed: number;
  skipped: number;
}> {
  // Guard against concurrent runs
  const running = await AsyncStorage.getItem(SYNC_RUNNING_KEY);
  if (running === "1") return { pushed: 0, failed: 0, skipped: 0 };

  const online = await isOnline();
  if (!online) return { pushed: 0, failed: 0, skipped: 0 };

  await AsyncStorage.setItem(SYNC_RUNNING_KEY, "1");

  let pushed = 0;
  let failed = 0;
  let skipped = 0;

  try {
    const queue = getPendingQueue(3);
    if (queue.length === 0) return { pushed: 0, failed: 0, skipped: 0 };

    const base = await getApiBase();
    const headers = await getAuthHeaders();

    for (const item of queue) {
      const payload = JSON.parse(item.payload);

      try {
        let endpoint = "";
        let body: any = {};

        switch (item.table_name) {
          case "screenings":
            endpoint = `${base}/screenings`;
            body = payload;
            break;
          case "referrals":
            endpoint = `${base}/simple-referrals/create`;
            body = payload;
            break;
          case "payments":
            endpoint = `${base}/simple-payments/create`;
            body = payload;
            break;
          default:
            // Unknown table — use generic sync endpoint
            endpoint = `${base}/sync`;
            body = { operations: [{ ...payload, type: item.table_name }] };
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }

        const data = await res.json().catch(() => ({}));
        const serverId =
          data?.id ||
          data?.data?.id ||
          data?.results?.[0]?.id ||
          null;

        // Mark local row as synced
        if (item.table_name === "screenings") {
          markScreeningSynced(item.local_id, serverId);
        } else if (item.table_name === "referrals") {
          markReferralSynced(item.local_id, serverId);
        } else if (item.table_name === "payments") {
          markPaymentSynced(item.local_id, serverId);
        }

        dequeueSuccess(item.id);
        pushed++;
      } catch (err: any) {
        const msg = err?.message ?? "unknown error";
        console.warn(`[sync] push failed for queue#${item.id}:`, msg);
        incrementRetry(item.id, msg);
        failed++;
      }
    }
  } finally {
    await AsyncStorage.removeItem(SYNC_RUNNING_KEY);
  }

  console.log(`[sync] push complete – pushed:${pushed} failed:${failed} skipped:${skipped}`);
  return { pushed, failed, skipped };
}

// ─── PULL: Neon → SQLite ─────────────────────────────────────────────────────

export async function pullFromNeon(): Promise<void> {
  const online = await isOnline();
  if (!online) return;

  try {
    const base = await getApiBase();
    const headers = await getAuthHeaders();

    // Helper
    const fetchJson = async (path: string) => {
      const res = await fetch(`${base}${path}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };

    // ── Pull screenings ──────────────────────────────────────────────────────
    try {
      const { data: screenings = [] } = await fetchJson("/screenings");
      for (const s of screenings) {
        const localId = s.id ?? newLocalId();
        // Only upsert rows that don't already exist locally as pending
        const existing = getDb().getFirstSync(
          "SELECT local_id, sync_status FROM screenings WHERE server_id=? OR local_id=?",
          [s.id, localId]
        ) as any;
        if (existing?.sync_status === "pending") continue; // don't overwrite unsent work

        insertScreening({
          localId: existing?.local_id ?? `server_${s.id}`,
          healthWorkerId: s.health_worker_id ?? "",
          clientName:     s.client_name ?? "",
          clientPhone:    s.client_phone ?? "",
          clientAge:      s.client_age,
          clientGender:   s.client_gender,
          clientDistrict: s.client_district,
          distanceVisionLeft:  s.distance_vision_left,
          distanceVisionRight: s.distance_vision_right,
          nearVisionResult:    s.near_vision_result,
          torchTestPassed:     !!s.torch_test_passed,
          glassesDispensed:    !!s.glasses_dispensed,
          glassesPower:        s.glasses_power,
          glassesFrameType:    s.glasses_frame_type,
          needsReferral:       !!s.needs_referral,
          referralReason:      s.referral_reason,
          recommendedPower:    s.recommended_power ?? s.glasses_power,
          notes:               s.notes,
          screeningDate:       s.screening_date ?? s.created_at,
        });
        // Mark server-pulled rows as synced
        getDb().runSync(
          "UPDATE screenings SET sync_status='synced', server_id=? WHERE local_id=?",
          [s.id, existing?.local_id ?? `server_${s.id}`]
        );
      }
    } catch (e) {
      console.warn("[sync] pull screenings failed:", e);
    }

    // ── Pull referrals ───────────────────────────────────────────────────────
    try {
      const { data: referrals = [] } = await fetchJson("/simple-referrals/list");
      for (const r of referrals) {
        const existing = getDb().getFirstSync(
          "SELECT local_id, sync_status FROM referrals WHERE server_id=?",
          [r.id]
        ) as any;
        if (existing?.sync_status === "pending") continue;

        insertReferral({
          localId:          existing?.local_id ?? `server_${r.id}`,
          healthWorkerId:   r.health_worker_id ?? "",
          clientName:       r.client_name ?? "",
          clientPhone:      r.client_phone,
          clientAge:        r.client_age,
          clientGender:     r.client_gender,
          clientDistrict:   r.client_district,
          reason:           r.reason ?? "",
          urgency:          r.urgency,
          facilityName:     r.facility_name,
          facilityLocation: r.facility_location,
          notes:            r.notes,
        });
        getDb().runSync(
          "UPDATE referrals SET sync_status='synced', server_id=?, status=? WHERE local_id=?",
          [r.id, r.status ?? "pending", existing?.local_id ?? `server_${r.id}`]
        );
      }
    } catch (e) {
      console.warn("[sync] pull referrals failed:", e);
    }

    // ── Pull payments ────────────────────────────────────────────────────────
    try {
      const { data: payments = [] } = await fetchJson("/simple-payments/list");
      for (const p of payments) {
        const existing = getDb().getFirstSync(
          "SELECT local_id, sync_status FROM payments WHERE server_id=?",
          [p.id]
        ) as any;
        if (existing?.sync_status === "pending") continue;

        insertPayment({
          localId:        existing?.local_id ?? `server_${p.id}`,
          healthWorkerId: p.health_worker_id ?? "",
          clientName:     p.client_name ?? "",
          clientPhone:    p.client_phone ?? "",
          amount:         Number(p.amount ?? 0),
          paymentMethod:  p.payment_method,
          provider:       p.provider,
          status:         p.status,
          dueDate:        p.due_date,
          productName:    p.product_name,
          productPower:   p.product_power,
        });
        getDb().runSync(
          "UPDATE payments SET sync_status='synced', server_id=?, status=? WHERE local_id=?",
          [p.id, p.status ?? "pending", existing?.local_id ?? `server_${p.id}`]
        );
      }
    } catch (e) {
      console.warn("[sync] pull payments failed:", e);
    }

    // ── Pull stock ───────────────────────────────────────────────────────────
    try {
      const { data: inv } = await fetchJson("/simple-inventory/summary");
      const products = inv?.products ?? [];
      for (const p of products) {
        upsertStockItem({
          productId:     p.id,
          power:         p.power ?? "",
          stockQuantity: Number(p.stock_quantity ?? 0),
          stockStandard: Number(p.stock_standard ?? 0),
          stockMetal:    Number(p.stock_metal    ?? 0),
          stockFashion:  Number(p.stock_fashion  ?? 0),
          stockStatus:   p.stock_status ?? "normal",
          price:         Number(p.price ?? 0),
        });
      }
    } catch (e) {
      console.warn("[sync] pull stock failed:", e);
    }

    console.log("[sync] pull complete");
  } catch (err) {
    console.error("[sync] pullFromNeon error:", err);
  }
}

// ─── Full sync: push pending then pull fresh data ────────────────────────────

export async function fullSync(): Promise<void> {
  await pushPendingToNeon();
  await pullFromNeon();
}

// ─── NetInfo listener – auto-sync when connectivity restored ─────────────────
let _netInfoUnsubscribe: (() => void) | null = null;
let _wasOffline = false;

export function startSyncListener(): void {
  if (_netInfoUnsubscribe) return; // already listening

  _netInfoUnsubscribe = NetInfo.addEventListener(async (state) => {
    const online = !!(
      state.isConnected && state.isInternetReachable !== false
    );
    if (online && _wasOffline) {
      console.log("[sync] connection restored – starting push sync");
      await pushPendingToNeon();
    }
    _wasOffline = !online;
  });

  console.log("[sync] network listener started");
}

export function stopSyncListener(): void {
  _netInfoUnsubscribe?.();
  _netInfoUnsubscribe = null;
}
