const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../sante.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    phone_number TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    gender TEXT,
    national_id TEXT,
    date_of_birth TEXT,
    role TEXT DEFAULT 'health_worker',
    village TEXT,
    parish TEXT,
    sub_county TEXT,
    county TEXT,
    district TEXT,
    region TEXT,
    organization_name TEXT,
    registration_number TEXT,
    years_of_experience INTEGER,
    training_certificate TEXT,
    business_name TEXT,
    business_type TEXT,
    tin_number TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT,
    is_active INTEGER DEFAULT 1,
    otp_code TEXT,
    otp_expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    power TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'UGX',
    stock_quantity INTEGER DEFAULT 0,
    stock_standard INTEGER DEFAULT 0,
    stock_metal INTEGER DEFAULT 0,
    stock_fashion INTEGER DEFAULT 0,
    category TEXT DEFAULT 'reading_glasses',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS screenings (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    client_id TEXT,
    client_name TEXT,
    client_phone TEXT,
    client_age INTEGER,
    client_gender TEXT,
    client_village TEXT,
    client_district TEXT,
    client_county TEXT,
    client_sub_county TEXT,
    client_parish TEXT,
    health_worker_id TEXT,
    distance_vision_left TEXT,
    distance_vision_right TEXT,
    distance_vision_both TEXT,
    near_vision_result TEXT,
    pinhole_test_left TEXT,
    pinhole_test_right TEXT,
    needs_glasses INTEGER DEFAULT 0,
    needs_referral INTEGER DEFAULT 0,
    referral_reason TEXT,
    recommended_product_id TEXT,
    recommended_power TEXT,
    selected_frame_type TEXT,
    notes TEXT,
    screening_date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_synced INTEGER DEFAULT 1,
    offline_id TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    screening_id TEXT,
    product_id TEXT,
    client_name TEXT,
    client_phone TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'UGX',
    mobile_money_number TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'mobile_money',
    payment_type TEXT DEFAULT 'full',
    installment_number INTEGER,
    total_installments INTEGER,
    due_date TEXT,
    payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    verified_at TEXT,
    provider TEXT,
    provider_reference TEXT,
    provider_status TEXT,
    provider_callback_payload TEXT,
    provider_failure_reason TEXT,
    provider_requested_at TEXT,
    provider_completed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_synced INTEGER DEFAULT 1,
    offline_id TEXT
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    screening_id TEXT,
    client_id TEXT,
    health_worker_id TEXT,
    client_name TEXT,
    client_phone TEXT,
    client_age INTEGER,
    client_gender TEXT,
    client_district TEXT,
    reason TEXT NOT NULL,
    urgency TEXT DEFAULT 'normal',
    facility_name TEXT,
    facility_location TEXT,
    status TEXT DEFAULT 'pending',
    referred_date TEXT DEFAULT (date('now')),
    completed_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    health_worker_id TEXT,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    age INTEGER,
    gender TEXT,
    village TEXT,
    parish TEXT,
    sub_county TEXT,
    county TEXT,
    district TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vht_stock (
    health_worker_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    stock_standard INTEGER DEFAULT 0,
    stock_metal INTEGER DEFAULT 0,
    stock_fashion INTEGER DEFAULT 0,
    PRIMARY KEY (health_worker_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Migrations: add columns that may be missing on existing databases
const migrations = [
  'ALTER TABLE referrals ADD COLUMN client_phone TEXT',
  'ALTER TABLE referrals ADD COLUMN client_age INTEGER',
  'ALTER TABLE referrals ADD COLUMN client_gender TEXT',
  'ALTER TABLE referrals ADD COLUMN client_district TEXT',
  'ALTER TABLE payments ADD COLUMN provider TEXT',
  'ALTER TABLE payments ADD COLUMN provider_reference TEXT',
  'ALTER TABLE payments ADD COLUMN provider_status TEXT',
  'ALTER TABLE payments ADD COLUMN provider_callback_payload TEXT',
  'ALTER TABLE payments ADD COLUMN provider_failure_reason TEXT',
  'ALTER TABLE payments ADD COLUMN provider_requested_at TEXT',
  'ALTER TABLE payments ADD COLUMN provider_completed_at TEXT',
];
migrations.forEach(m => {
  try { db.exec(m); } catch (e) { /* column already exists */ }
});

// Seed vht_stock from products for each health worker (one-time so VHTs see current stock)
try {
  const vhtCount = db.prepare("SELECT COUNT(*) as n FROM vht_stock").get();
  if (vhtCount && vhtCount.n === 0) {
    db.exec(`
      INSERT OR REPLACE INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
      SELECT u.id, p.id, p.stock_quantity, p.stock_standard, p.stock_metal, p.stock_fashion
      FROM users u
      CROSS JOIN products p
      WHERE u.role = 'health_worker' OR u.role IS NULL
    `);
  }
} catch (e) { /* ignore */ }

// Insert sample products
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const products = [
  ['1', 'Reading Glasses +1.00', 'Low power', '+1.00', 15000, 78, 30, 28, 20],
  ['2', 'Reading Glasses +1.50', 'Mild difficulty', '+1.50', 15000, 95, 40, 35, 20],
  ['3', 'Reading Glasses +2.00', 'Standard', '+2.00', 15000, 142, 60, 52, 30],
  ['4', 'Reading Glasses +2.50', 'Moderate', '+2.50', 15000, 87, 35, 32, 20],
  ['5', 'Reading Glasses +3.00', 'High power', '+3.00', 15000, 64, 25, 24, 15],
  ['6', 'Reading Glasses +3.50', 'Very high', '+3.50', 18000, 42, 18, 14, 10],
];

products.forEach(p => insertProduct.run(...p));

// SQL wrapper to mimic neon's tagged template syntax
const sql = (strings, ...values) => {
  // Handle tagged template literals
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += '?';
    }
  }
  
  // SQLite compatibility fixes
  query = query.replace(/NOW\(\)/gi, "datetime('now')");
  query = query.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");
  query = query.replace(/CURRENT_DATE/gi, "date('now')");
  query = query.replace(/uuid_generate_v4\(\)/gi, "hex(randomblob(16))");
  
  // Handle RETURNING clause for SQLite compatibility (UPDATE and INSERT)
  const hasReturningAny = /\s+RETURNING\s+/i.test(query);
  const isInsert = query.trim().toUpperCase().startsWith('INSERT');
  const isUpdate = query.trim().toUpperCase().startsWith('UPDATE');
  if (hasReturningAny && (isUpdate || isInsert)) {
    query = query.replace(/\s+RETURNING\s+[\w\s,]+\s*$/i, '');
  }

  try {
    const stmt = db.prepare(query);
    const isSelect = query.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
      const rows = stmt.all(...values);
      // Convert datetime('now') result to 'now' field for compatibility
      if (rows.length > 0 && rows[0]["datetime('now')"]) {
        rows[0].now = rows[0]["datetime('now')"];
      }
      return rows;
    } else if (isUpdate && hasReturningAny) {
      // For UPDATE with RETURNING, run update then select
      const info = stmt.run(...values);
      if (info.changes > 0) {
        const tableName = query.match(/UPDATE\s+(\w+)/i)?.[1];
        const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+RETURNING|$)/is);
        if (tableName && whereMatch) {
          const whereClause = whereMatch[1].trim();
          const wherePlaceholders = (whereClause.match(/\?/g) || []).length;
          const whereValues = values.slice(-wherePlaceholders);
          const selectQuery = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
          const selectStmt = db.prepare(selectQuery);
          return selectStmt.all(...whereValues);
        }
      }
      return [];
    } else if (isInsert && hasReturningAny) {
      // For INSERT with RETURNING, run insert then select by rowid
      const info = stmt.run(...values);
      if (info.changes > 0 && info.lastInsertRowid) {
        const tableName = query.match(/INSERT\s+INTO\s+(\w+)/i)?.[1];
        if (tableName) {
          const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE rowid = ?`);
          return selectStmt.all(info.lastInsertRowid);
        }
      }
      return [{ id: info.lastInsertRowid, changes: info.changes }];
    } else {
      const info = stmt.run(...values);
      return [{ id: info.lastInsertRowid, changes: info.changes }];
    }
  } catch (err) {
    console.error('SQL Error:', err.message, '\nQuery:', query);
    throw err;
  }
};

// Migration function to add missing columns
function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  // List of columns to add if they don't exist
  const migrations = [
    // Users - registration documents (CHW, Outlet, VSLA)
    { table: 'users', column: 'recommendation_letter', type: 'TEXT' },
    { table: 'users', column: 'shop_front_image', type: 'TEXT' },
    { table: 'users', column: 'owner_id_image', type: 'TEXT' },
    { table: 'users', column: 'registration_documents', type: 'TEXT' },
    // Screenings
    { table: 'screenings', column: 'client_district', type: 'TEXT' },
    { table: 'screenings', column: 'client_county', type: 'TEXT' },
    { table: 'screenings', column: 'client_sub_county', type: 'TEXT' },
    { table: 'screenings', column: 'client_parish', type: 'TEXT' },
    { table: 'screenings', column: 'offline_id', type: 'TEXT' },
    { table: 'screenings', column: 'is_synced', type: 'INTEGER DEFAULT 1' },
    { table: 'screenings', column: 'selected_frame_type', type: 'TEXT' },
    { table: 'screenings', column: 'recommended_power', type: 'TEXT' },
    { table: 'screenings', column: 'recommended_product_id', type: 'TEXT' },
    { table: 'screenings', column: 'referral_reason', type: 'TEXT' },
    { table: 'screenings', column: 'notes', type: 'TEXT' },
    { table: 'screenings', column: 'pinhole_test_left', type: 'TEXT' },
    { table: 'screenings', column: 'pinhole_test_right', type: 'TEXT' },
    { table: 'screenings', column: 'near_vision_result', type: 'TEXT' },
    { table: 'screenings', column: 'distance_vision_both', type: 'TEXT' },
    { table: 'screenings', column: 'distance_vision_right', type: 'TEXT' },
    { table: 'screenings', column: 'distance_vision_left', type: 'TEXT' },
    { table: 'screenings', column: 'health_worker_id', type: 'TEXT' },
    { table: 'screenings', column: 'client_village', type: 'TEXT' },
    { table: 'screenings', column: 'client_gender', type: 'TEXT' },
    { table: 'screenings', column: 'client_age', type: 'INTEGER' },
    { table: 'screenings', column: 'client_phone', type: 'TEXT' },
    { table: 'screenings', column: 'client_name', type: 'TEXT' },
    { table: 'screenings', column: 'client_id', type: 'TEXT' },
    
    // Referrals table columns
    { table: 'referrals', column: 'client_id', type: 'TEXT' },
    { table: 'referrals', column: 'client_name', type: 'TEXT' },
    { table: 'referrals', column: 'client_phone', type: 'TEXT' },
    { table: 'referrals', column: 'client_age', type: 'INTEGER' },
    { table: 'referrals', column: 'client_gender', type: 'TEXT' },
    { table: 'referrals', column: 'client_district', type: 'TEXT' },
    { table: 'referrals', column: 'facility_name', type: 'TEXT' },
    { table: 'referrals', column: 'facility_location', type: 'TEXT' },
    { table: 'referrals', column: 'status', type: 'TEXT DEFAULT "pending"' },
    { table: 'referrals', column: 'referred_date', type: 'TEXT DEFAULT (date("now"))' },
    { table: 'referrals', column: 'completed_date', type: 'TEXT' },
    { table: 'referrals', column: 'notes', type: 'TEXT' },
  ];

  migrations.forEach(({ table, column, type }) => {
    try {
      // Check if column exists
      const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
      const columnExists = tableInfo.some(col => col.name === column);
      
      if (!columnExists) {
        console.log(`➕ Adding column ${column} to ${table}`);
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not add column ${column} to ${table}: ${error.message}`);
    }
  });
  
  console.log('✅ Database migrations completed');
}

// Run migrations on startup
runMigrations();

module.exports = { sql, db };
