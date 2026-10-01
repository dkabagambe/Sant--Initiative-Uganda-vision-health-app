/**
 * db.ts  –  SQLite offline database
 *
 * Single source of truth for the phone's local store.
 * Mirrors the subset of Neon tables needed for offline work.
 *
 * Tables
 * ──────
 *  profiles      – one row per logged-in user
 *  screenings    – vision screening sessions
 *  referrals     – referral records
 *  payments      – payment records
 *  stock         – per-product stock snapshot
 *  sync_queue    – pending writes waiting to reach Neon
 *
 * All writes go to SQLite first. The sync engine (sync.ts) pushes
 * sync_queue rows to the Neon API when a connection is available.
 */

import * as SQLite from "expo-sqlite";

// ─── Open (creates file on first call) ───────────────────────────────────────
let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync("sante_offline.db");
  }
  return _db;
}

// ─── Bootstrap – run once at app start ───────────────────────────────────────
export async function initDb(): Promise<void> {
  const db = getDb();

  // Use WAL mode for better concurrent read performance
  db.execSync("PRAGMA journal_mode = WAL;");
  db.execSync("PRAGMA foreign_keys = ON;");

  db.execSync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id            TEXT PRIMARY KEY,
      phone_number  TEXT UNIQUE NOT NULL,
      full_name     TEXT,
      role          TEXT,
      district      TEXT,
      village       TEXT,
      profile_image TEXT,
      pin_hash      TEXT,
      token         TEXT,
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS screenings (
      local_id      TEXT PRIMARY KEY,
      server_id     TEXT,
      health_worker_id TEXT,
      client_name   TEXT,
      client_phone  TEXT,
      client_age    INTEGER,
      client_gender TEXT,
      client_district TEXT,
      distance_vision_left  TEXT,
      distance_vision_right TEXT,
      near_vision_result    TEXT,
      torch_test_passed     INTEGER DEFAULT 0,
      glasses_dispensed     INTEGER DEFAULT 0,
      glasses_power         TEXT,
      glasses_frame_type    TEXT,
      needs_referral        INTEGER DEFAULT 0,
      referral_reason       TEXT,
      recommended_power     TEXT,
      notes                 TEXT,
      screening_date        TEXT DEFAULT (datetime('now')),
      sync_status   TEXT DEFAULT 'pending',
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS referrals (
      local_id        TEXT PRIMARY KEY,
      server_id       TEXT,
      health_worker_id TEXT,
      screening_local_id TEXT,
      client_name     TEXT,
      client_phone    TEXT,
      client_age      INTEGER,
      client_gender   TEXT,
      client_district TEXT,
      reason          TEXT,
      urgency         TEXT DEFAULT 'normal',
      facility_name   TEXT,
      facility_location TEXT,
      notes           TEXT,
      status          TEXT DEFAULT 'pending',
      referred_date   TEXT DEFAULT (datetime('now')),
      sync_status     TEXT DEFAULT 'pending',
      created_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS payments (
      local_id        TEXT PRIMARY KEY,
      server_id       TEXT,
      health_worker_id TEXT,
      client_name     TEXT,
      client_phone    TEXT,
      amount          REAL,
      payment_method  TEXT DEFAULT 'cash',
      provider        TEXT,
      status          TEXT DEFAULT 'pending',
      due_date        TEXT,
      payment_date    TEXT,
      transaction_id  TEXT,
      product_name    TEXT,
      product_power   TEXT,
      sync_status     TEXT DEFAULT 'pending',
      created_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS stock (
      product_id    TEXT PRIMARY KEY,
      power         TEXT,
      stock_quantity INTEGER DEFAULT 0,
      stock_standard INTEGER DEFAULT 0,
      stock_metal   INTEGER DEFAULT 0,
      stock_fashion INTEGER DEFAULT 0,
      stock_status  TEXT DEFAULT 'normal',
      price         REAL,
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name  TEXT NOT NULL,
      local_id    TEXT NOT NULL,
      operation   TEXT NOT NULL,   -- 'insert' | 'update' | 'delete'
      payload     TEXT NOT NULL,   -- JSON blob
      retries     INTEGER DEFAULT 0,
      last_error  TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  // Indexes for common lookups
  db.execSync(
    "CREATE INDEX IF NOT EXISTS idx_screenings_phone ON screenings(client_phone);"
  );
  db.execSync(
    "CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);"
  );
  db.execSync(
    "CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);"
  );
  db.execSync(
    "CREATE INDEX IF NOT EXISTS idx_sync_queue_retries ON sync_queue(retries);"
  );
}

// ─── UUID-lite (no crypto dep needed) ────────────────────────────────────────
export function newLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// PROFILES
// ═════════════════════════════════════════════════════════════════════════════

export function upsertProfile(profile: {
  id: string;
  phone_number: string;
  full_name?: string;
  role?: string;
  district?: string;
  village?: string;
  profile_image?: string;
  token?: string;
}): void {
  const db = getDb();
  db.runSync(
    `INSERT INTO profiles (id, phone_number, full_name, role, district, village, profile_image, token, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       phone_number  = excluded.phone_number,
       full_name     = excluded.full_name,
       role          = excluded.role,
       district      = excluded.district,
       village       = excluded.village,
       profile_image = excluded.profile_image,
       token         = excluded.token,
       updated_at    = datetime('now')`,
    [
      profile.id,
      profile.phone_number,
      profile.full_name ?? null,
      profile.role ?? null,
      profile.district ?? null,
      profile.village ?? null,
      profile.profile_image ?? null,
      profile.token ?? null,
    ]
  );
}

export function getProfileByPhone(phone: string): any | null {
  const db = getDb();
  return db.getFirstSync(
    "SELECT * FROM profiles WHERE phone_number = ? LIMIT 1",
    [phone]
  );
}

export function savePinHash(userId: string, pinHash: string): void {
  const db = getDb();
  db.runSync("UPDATE profiles SET pin_hash = ? WHERE id = ?", [pinHash, userId]);
}

// ═════════════════════════════════════════════════════════════════════════════
// SCREENINGS
// ═════════════════════════════════════════════════════════════════════════════

export function insertScreening(s: {
  localId: string;
  healthWorkerId: string;
  clientName: string;
  clientPhone: string;
  clientAge?: number;
  clientGender?: string;
  clientDistrict?: string;
  distanceVisionLeft?: string;
  distanceVisionRight?: string;
  nearVisionResult?: string;
  torchTestPassed?: boolean;
  glassesDispensed?: boolean;
  glassesPower?: string;
  glassesFrameType?: string;
  needsReferral?: boolean;
  referralReason?: string;
  recommendedPower?: string;
  notes?: string;
  screeningDate?: string;
}): void {
  const db = getDb();
  db.runSync(
    `INSERT OR REPLACE INTO screenings
      (local_id, health_worker_id, client_name, client_phone, client_age,
       client_gender, client_district, distance_vision_left, distance_vision_right,
       near_vision_result, torch_test_passed, glasses_dispensed, glasses_power,
       glasses_frame_type, needs_referral, referral_reason, recommended_power,
       notes, screening_date, sync_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      s.localId,
      s.healthWorkerId,
      s.clientName,
      s.clientPhone,
      s.clientAge ?? null,
      s.clientGender ?? null,
      s.clientDistrict ?? null,
      s.distanceVisionLeft ?? null,
      s.distanceVisionRight ?? null,
      s.nearVisionResult ?? null,
      s.torchTestPassed ? 1 : 0,
      s.glassesDispensed ? 1 : 0,
      s.glassesPower ?? null,
      s.glassesFrameType ?? null,
      s.needsReferral ? 1 : 0,
      s.referralReason ?? null,
      s.recommendedPower ?? null,
      s.notes ?? null,
      s.screeningDate ?? new Date().toISOString(),
      "pending",
    ]
  );
}

export function getScreenings(limit = 100): any[] {
  const db = getDb();
  return db.getAllSync(
    "SELECT * FROM screenings ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
}

export function markScreeningSynced(localId: string, serverId: string): void {
  const db = getDb();
  db.runSync(
    "UPDATE screenings SET sync_status='synced', server_id=? WHERE local_id=?",
    [serverId, localId]
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// REFERRALS
// ═════════════════════════════════════════════════════════════════════════════

export function insertReferral(r: {
  localId: string;
  healthWorkerId: string;
  screeningLocalId?: string;
  clientName: string;
  clientPhone?: string;
  clientAge?: number;
  clientGender?: string;
  clientDistrict?: string;
  reason: string;
  urgency?: string;
  facilityName?: string;
  facilityLocation?: string;
  notes?: string;
}): void {
  const db = getDb();
  db.runSync(
    `INSERT OR REPLACE INTO referrals
      (local_id, health_worker_id, screening_local_id, client_name, client_phone,
       client_age, client_gender, client_district, reason, urgency, facility_name,
       facility_location, notes, status, sync_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','pending')`,
    [
      r.localId,
      r.healthWorkerId,
      r.screeningLocalId ?? null,
      r.clientName,
      r.clientPhone ?? null,
      r.clientAge ?? null,
      r.clientGender ?? null,
      r.clientDistrict ?? null,
      r.reason,
      r.urgency ?? "normal",
      r.facilityName ?? null,
      r.facilityLocation ?? null,
      r.notes ?? null,
    ]
  );
}

export function getReferrals(status?: string): any[] {
  const db = getDb();
  if (status) {
    return db.getAllSync(
      "SELECT * FROM referrals WHERE status=? ORDER BY created_at DESC",
      [status]
    );
  }
  return db.getAllSync(
    "SELECT * FROM referrals ORDER BY created_at DESC"
  );
}

export function updateReferralStatus(
  localId: string,
  status: string
): void {
  const db = getDb();
  db.runSync(
    "UPDATE referrals SET status=? WHERE local_id=?",
    [status, localId]
  );
}

export function markReferralSynced(localId: string, serverId: string): void {
  const db = getDb();
  db.runSync(
    "UPDATE referrals SET sync_status='synced', server_id=? WHERE local_id=?",
    [serverId, localId]
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═════════════════════════════════════════════════════════════════════════════

export function insertPayment(p: {
  localId: string;
  healthWorkerId: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  paymentMethod?: string;
  provider?: string;
  status?: string;
  dueDate?: string;
  productName?: string;
  productPower?: string;
}): void {
  const db = getDb();
  db.runSync(
    `INSERT OR REPLACE INTO payments
      (local_id, health_worker_id, client_name, client_phone, amount,
       payment_method, provider, status, due_date, product_name, product_power,
       sync_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      p.localId,
      p.healthWorkerId,
      p.clientName,
      p.clientPhone,
      p.amount,
      p.paymentMethod ?? "cash",
      p.provider ?? null,
      p.status ?? "pending",
      p.dueDate ?? null,
      p.productName ?? null,
      p.productPower ?? null,
      "pending",
    ]
  );
}

export function getPayments(status?: string): any[] {
  const db = getDb();
  if (status) {
    return db.getAllSync(
      "SELECT * FROM payments WHERE status=? ORDER BY created_at DESC",
      [status]
    );
  }
  return db.getAllSync("SELECT * FROM payments ORDER BY created_at DESC");
}

export function markPaymentSynced(localId: string, serverId: string): void {
  const db = getDb();
  db.runSync(
    "UPDATE payments SET sync_status='synced', server_id=? WHERE local_id=?",
    [serverId, localId]
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STOCK
// ═════════════════════════════════════════════════════════════════════════════

export function upsertStockItem(item: {
  productId: string;
  power: string;
  stockQuantity: number;
  stockStandard?: number;
  stockMetal?: number;
  stockFashion?: number;
  stockStatus?: string;
  price?: number;
}): void {
  const db = getDb();
  db.runSync(
    `INSERT INTO stock
      (product_id, power, stock_quantity, stock_standard, stock_metal, stock_fashion,
       stock_status, price, updated_at)
     VALUES (?,?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(product_id) DO UPDATE SET
       power          = excluded.power,
       stock_quantity = excluded.stock_quantity,
       stock_standard = excluded.stock_standard,
       stock_metal    = excluded.stock_metal,
       stock_fashion  = excluded.stock_fashion,
       stock_status   = excluded.stock_status,
       price          = excluded.price,
       updated_at     = datetime('now')`,
    [
      item.productId,
      item.power,
      item.stockQuantity,
      item.stockStandard ?? 0,
      item.stockMetal ?? 0,
      item.stockFashion ?? 0,
      item.stockStatus ?? "normal",
      item.price ?? null,
    ]
  );
}

export function getStock(): any[] {
  const db = getDb();
  return db.getAllSync("SELECT * FROM stock ORDER BY power ASC");
}

// ═════════════════════════════════════════════════════════════════════════════
// SYNC QUEUE
// ═════════════════════════════════════════════════════════════════════════════

export function enqueue(
  tableName: string,
  localId: string,
  operation: "insert" | "update" | "delete",
  payload: object
): void {
  const db = getDb();
  db.runSync(
    `INSERT INTO sync_queue (table_name, local_id, operation, payload)
     VALUES (?, ?, ?, ?)`,
    [tableName, localId, operation, JSON.stringify(payload)]
  );
}

export function getPendingQueue(maxRetries = 3): any[] {
  const db = getDb();
  return db.getAllSync(
    "SELECT * FROM sync_queue WHERE retries < ? ORDER BY id ASC",
    [maxRetries]
  );
}

export function dequeueSuccess(queueId: number): void {
  const db = getDb();
  db.runSync("DELETE FROM sync_queue WHERE id = ?", [queueId]);
}

export function incrementRetry(queueId: number, errorMsg: string): void {
  const db = getDb();
  db.runSync(
    "UPDATE sync_queue SET retries = retries + 1, last_error = ? WHERE id = ?",
    [errorMsg, queueId]
  );
}

export function clearQueue(): void {
  const db = getDb();
  db.runSync("DELETE FROM sync_queue");
}

// ─── Stats helpers used by dashboard ─────────────────────────────────────────
export function getLocalStats() {
  const db = getDb();
  const screeningCount = (
    db.getFirstSync("SELECT COUNT(*) as c FROM screenings") as any
  )?.c ?? 0;
  const pendingReferrals = (
    db.getFirstSync(
      "SELECT COUNT(*) as c FROM referrals WHERE status='pending'"
    ) as any
  )?.c ?? 0;
  const pendingPayments = (
    db.getFirstSync(
      "SELECT COUNT(*) as c FROM payments WHERE status='pending' OR status='overdue'"
    ) as any
  )?.c ?? 0;
  const stockTotal = (
    db.getFirstSync("SELECT SUM(stock_quantity) as c FROM stock") as any
  )?.c ?? 0;
  const queueLength = (
    db.getFirstSync("SELECT COUNT(*) as c FROM sync_queue WHERE retries < 3") as any
  )?.c ?? 0;

  return {
    screeningCount,
    pendingReferrals,
    pendingPayments,
    stockTotal,
    queueLength,
  };
}
