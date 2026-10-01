/**
 * offlineApi.ts  –  SQLite-first read/write layer
 *
 * All screens import from here instead of calling apiService directly for
 * the five main data types (screenings, referrals, payments, stock, dashboard).
 *
 * Write path:
 *   1. Write to SQLite immediately (returns data to UI instantly, even offline)
 *   2. Enqueue in sync_queue
 *   3. If online, attempt immediate push (fire-and-forget)
 *
 * Read path:
 *   Returns SQLite data (always fast, always available offline).
 *   UI never waits for the network.
 *
 * The original apiService is still used for:
 *  - Authentication (requires server)
 *  - File uploads (cannot be queued easily)
 *  - User profile updates
 *  - Any operation not yet migrated
 */

import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  insertScreening,
  insertReferral,
  insertPayment,
  getScreenings,
  getReferrals,
  getPayments,
  getStock,
  getLocalStats,
  updateReferralStatus,
  enqueue,
  newLocalId,
} from "./db";
import { pushPendingToNeon } from "./sync";

// ─── connectivity helper ──────────────────────────────────────────────────────
async function online(): Promise<boolean> {
  const s = await NetInfo.fetch();
  return !!(s.isConnected && s.isInternetReachable !== false);
}

// ─── Current user id ──────────────────────────────────────────────────────────
async function currentUserId(): Promise<string> {
  const raw = await AsyncStorage.getItem("user");
  if (!raw) return "unknown";
  try {
    return JSON.parse(raw).id ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SCREENINGS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Save a completed screening locally then push to Neon when online.
 * Called from ScreeningComplete.handleRegisterAndSave.
 */
export async function saveScreeningOfflineFirst(data: {
  clientName:          string;
  clientPhone:         string;
  clientAge?:          number;
  clientGender?:       string;
  clientDistrict?:     string;
  distanceVisionLeft?: string;
  distanceVisionRight?:string;
  nearVisionResult?:   string;
  torchTestPassed?:    boolean;
  glassesDispensed?:   boolean;
  glassesPower?:       string;
  glassesFrameType?:   string;
  needsReferral?:      boolean;
  referralReason?:     string;
  recommendedPower?:   string;
  notes?:              string;
}): Promise<{ success: boolean; localId: string; screeningId: string; data: { id: string }; error?: string }> {
  const localId     = newLocalId();
  const userId      = await currentUserId();
  const screeningDate = new Date().toISOString();

  // 1. Write SQLite
  insertScreening({ localId, healthWorkerId: userId, screeningDate, ...data });

  // 2. Build Neon payload (matches /api/screenings POST body)
  const neonPayload = {
    clientName:         data.clientName,
    clientPhone:        data.clientPhone,
    clientAge:          data.clientAge,
    clientGender:       data.clientGender,
    clientDistrict:     data.clientDistrict,
    distanceVisionLeft: data.distanceVisionLeft,
    distanceVisionRight:data.distanceVisionRight,
    nearVisionResult:   data.nearVisionResult,
    torchTestPassed:    data.torchTestPassed,
    glassesDispensed:   data.glassesDispensed,
    glassesPower:       data.glassesPower,
    glassesFrameType:   data.glassesFrameType,
    needsReferral:      data.needsReferral,
    referralReason:     data.referralReason,
    recommendedPower:   data.recommendedPower,
    notes:              data.notes,
    screeningDate,
    localId,
  };

  // 3. Enqueue
  enqueue("screenings", localId, "insert", neonPayload);

  // 4. Try immediate push (non-blocking)
  pushPendingToNeon().catch(() => {});

  // Return shape is backward-compatible with old apiService.createScreening response
  return {
    success:     true,
    localId,
    screeningId: localId,
    data:        { id: localId },
  };
}

/**
 * Read screenings from SQLite (works offline).
 * Returns same shape as apiService.getScreenings().
 */
export function readScreeningsLocal(): { success: boolean; data: any[] } {
  const rows = getScreenings(200);
  // Normalise column names to match what screens expect from the API
  const data = rows.map((r) => ({
    id:                   r.local_id,
    server_id:            r.server_id,
    health_worker_id:     r.health_worker_id,
    client_name:          r.client_name,
    client_phone:         r.client_phone,
    client_age:           r.client_age,
    client_gender:        r.client_gender,
    client_district:      r.client_district,
    distance_vision_left: r.distance_vision_left,
    distance_vision_right:r.distance_vision_right,
    near_vision_result:   r.near_vision_result,
    torch_test_passed:    !!r.torch_test_passed,
    glasses_dispensed:    !!r.glasses_dispensed,
    glasses_power:        r.glasses_power,
    glasses_frame_type:   r.glasses_frame_type,
    needs_referral:       !!r.needs_referral,
    referral_reason:      r.referral_reason,
    recommended_power:    r.recommended_power,
    notes:                r.notes,
    screening_date:       r.screening_date,
    created_at:           r.created_at,
    sync_status:          r.sync_status,
  }));
  return { success: true, data };
}

// ═════════════════════════════════════════════════════════════════════════════
// REFERRALS
// ═════════════════════════════════════════════════════════════════════════════

export async function saveReferralOfflineFirst(data: {
  clientName:       string;
  clientPhone?:     string;
  clientAge?:       number;
  clientGender?:    string;
  clientDistrict?:  string;
  reason:           string;
  urgency?:         string;
  facilityName?:    string;
  facilityLocation?:string;
  notes?:           string;
  screeningLocalId?:string;
}): Promise<{ success: boolean; localId: string; error?: string }> {
  const localId = newLocalId();
  const userId  = await currentUserId();

  // 1. SQLite
  insertReferral({ localId, healthWorkerId: userId, ...data });

  // 2. Neon payload (matches /api/simple-referrals/create)
  const neonPayload = {
    client_name:       data.clientName,
    client_phone:      data.clientPhone,
    client_age:        data.clientAge,
    client_gender:     data.clientGender,
    client_district:   data.clientDistrict,
    reason:            data.reason,
    urgency:           data.urgency ?? "normal",
    facility_name:     data.facilityName,
    facility_location: data.facilityLocation,
    notes:             data.notes,
    localId,
  };

  // 3. Enqueue
  enqueue("referrals", localId, "insert", neonPayload);

  // 4. Immediate push attempt
  pushPendingToNeon().catch(() => {});

  return { success: true, localId };
}

export function readReferralsLocal(status?: string): { success: boolean; data: any[] } {
  const rows = getReferrals(status);
  const data = rows.map((r) => ({
    id:               r.local_id,
    server_id:        r.server_id,
    client_name:      r.client_name,
    client_phone:     r.client_phone,
    client_age:       r.client_age,
    client_gender:    r.client_gender,
    client_district:  r.client_district,
    reason:           r.reason,
    urgency:          r.urgency,
    facility_name:    r.facility_name,
    facility_location:r.facility_location,
    notes:            r.notes,
    status:           r.status,
    referred_date:    r.referred_date,
    created_at:       r.created_at,
    sync_status:      r.sync_status,
  }));
  return { success: true, data };
}

export function markReferralCompleteLocal(localId: string): void {
  updateReferralStatus(localId, "completed");
}

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═════════════════════════════════════════════════════════════════════════════

export async function savePaymentOfflineFirst(data: {
  clientName:    string;
  clientPhone:   string;
  amount:        number;
  paymentMethod?:string;
  provider?:     string;
  status?:       string;
  dueDate?:      string;
  productName?:  string;
  productPower?: string;
}): Promise<{ success: boolean; localId: string; error?: string }> {
  const localId = newLocalId();
  const userId  = await currentUserId();

  // 1. SQLite
  insertPayment({ localId, healthWorkerId: userId, ...data });

  // 2. Neon payload (matches /api/simple-payments/create)
  const neonPayload = {
    clientName:    data.clientName,
    clientPhone:   data.clientPhone,
    amount:        data.amount,
    paymentMethod: data.paymentMethod ?? "cash",
    provider:      data.provider,
    mobileMoneyNumber: data.clientPhone,
    paymentType:   "full",
    localId,
  };

  // 3. Enqueue
  enqueue("payments", localId, "insert", neonPayload);

  // 4. Immediate push
  pushPendingToNeon().catch(() => {});

  return { success: true, localId };
}

export function readPaymentsLocal(status?: string): { success: boolean; data: any[] } {
  const rows = getPayments(status);
  const data = rows.map((p) => ({
    id:             p.local_id,
    server_id:      p.server_id,
    client_name:    p.client_name,
    client_phone:   p.client_phone,
    amount:         p.amount,
    payment_method: p.payment_method,
    provider:       p.provider,
    status:         p.status,
    due_date:       p.due_date,
    payment_date:   p.payment_date,
    transaction_id: p.transaction_id,
    product_name:   p.product_name,
    product_power:  p.product_power,
    created_at:     p.created_at,
    sync_status:    p.sync_status,
  }));
  return { success: true, data };
}

// ═════════════════════════════════════════════════════════════════════════════
// STOCK
// ═════════════════════════════════════════════════════════════════════════════

export function readStockLocal(): { success: boolean; data: any[] } {
  const rows = getStock();
  const data = rows.map((s) => ({
    id:             s.product_id,
    power:          s.power,
    stock_quantity: s.stock_quantity,
    stock_standard: s.stock_standard,
    stock_metal:    s.stock_metal,
    stock_fashion:  s.stock_fashion,
    stock_status:   s.stock_status,
    price:          s.price,
  }));
  return { success: true, data };
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS (from SQLite)
// ═════════════════════════════════════════════════════════════════════════════

export function readDashboardStatsLocal() {
  const stats = getLocalStats();
  return {
    success: true,
    data: {
      total_screenings:        stats.screeningCount,
      screenings_this_week:    stats.screeningCount, // fallback
      clients_needing_glasses: 0,                    // needs vision data cross-ref
      clients_referred:        stats.pendingReferrals,
      pending_referrals:       stats.pendingReferrals,
      paymentsDue:             stats.pendingPayments,
      total_stock:             stats.stockTotal,
      inventory:               stats.stockTotal,
      sync_queue_length:       stats.queueLength,
    },
  };
}
