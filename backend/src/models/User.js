// src/models/User.js
class User {
  static async findById(sql, id) {
    const result = await sql`
      SELECT id, phone_number, full_name, role, village, district, created_at
      FROM users
      WHERE id = ${id}
    `;
    return result[0];
  }

  static async findByPhone(sql, phoneNumber) {
    const result = await sql`
      SELECT *
      FROM users
      WHERE phone_number = ${phoneNumber}
    `;
    return result[0];
  }

  static async create(sql, userData) {
    const {
      phoneNumber,
      fullName,
      role = "health_worker",
      village,
      district,
    } = userData;
    const result = await sql`
      INSERT INTO users (phone_number, full_name, role, village, district)
      VALUES (${phoneNumber}, ${fullName}, ${role}, ${village}, ${district})
      RETURNING id, phone_number, full_name, role, village, district, created_at
    `;
    return result[0];
  }

  static async update(sql, id, updates) {
    const setClauses = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) setClauses.push(`${key} = ${sql(value)}`);
    }
    if (!setClauses.length) throw new Error("No fields to update");

    const query = `
      UPDATE users
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    const result = await sql(query);
    return result[0];
  }

  static async getAllHealthWorkers(sql) {
    return await sql`
      SELECT id, full_name, phone_number, village, district, created_at
      FROM users
      WHERE role = 'health_worker'
      ORDER BY full_name
    `;
  }
}

module.exports = User;
