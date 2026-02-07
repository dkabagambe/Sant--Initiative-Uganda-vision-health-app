const db = require("../../config/database");

class Product {
  // Get all products
  static async getAll() {
    const result = await db.query("SELECT * FROM products ORDER BY power");
    return result.rows;
  }

  // Get product by ID
  static async findById(id) {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0];
  }

  // Get products by category
  static async findByCategory(category) {
    const result = await db.query(
      "SELECT * FROM products WHERE category = $1 ORDER BY power",
      [category],
    );
    return result.rows;
  }

  // Update product stock
  static async updateStock(id, quantityChange) {
    const result = await db.query(
      `UPDATE products 
       SET stock_quantity = stock_quantity + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, stock_quantity`,
      [quantityChange, id],
    );
    return result.rows[0];
  }
}

module.exports = Product;
