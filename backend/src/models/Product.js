// src/models/Product.js
class Product {
  static async getAll(sql) {
    return await sql`SELECT * FROM products ORDER BY power`;
  }

  static async findById(sql, id) {
    const result = await sql`SELECT * FROM products WHERE id = ${id}`;
    return result[0];
  }

  static async findByCategory(sql, category) {
    return await sql`SELECT * FROM products WHERE category = ${category} ORDER BY power`;
  }

  static async updateStock(sql, id, quantityChange) {
    const result = await sql`
      UPDATE products
      SET stock_quantity = stock_quantity + ${quantityChange}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, stock_quantity
    `;
    return result[0];
  }
}

module.exports = Product;
