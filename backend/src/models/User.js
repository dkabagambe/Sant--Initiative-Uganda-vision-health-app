const db = require("../../config/database");

class User {
  // Find user by phone number
  static async findByPhone(phoneNumber) {
    const result = await db.query(
      "SELECT * FROM users WHERE phone_number = $1",
      [phoneNumber],
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query(
      "SELECT id, phone_number, full_name, role, village, district, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }

  // Create new user
  static async create(userData) {
    const {
      phoneNumber,
      fullName,
      role = "health_worker",
      village,
      district,
    } = userData;

    const result = await db.query(
      `INSERT INTO users (phone_number, full_name, role, village, district) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, phone_number, full_name, role, village, district, created_at`,
      [phoneNumber, fullName, role, village, district],
    );

    return result.rows[0];
  }

  // Update user
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Get all health workers
  static async getAllHealthWorkers() {
    const result = await db.query(
      "SELECT id, full_name, phone_number, village, district, created_at FROM users WHERE role = $1 ORDER BY full_name",
      ["health_worker"],
    );
    return result.rows;
  }
}

module.exports = User;
