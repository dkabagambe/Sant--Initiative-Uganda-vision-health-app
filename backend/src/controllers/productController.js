// Get all products with frame breakdown
exports.getProducts = async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const products = await sql`
      SELECT 
        id, name, description, power, price, currency,
        stock_quantity, stock_standard, stock_metal, stock_fashion,
        category, created_at
      FROM products
      ORDER BY power ASC
    `;

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        power: p.power,
        price: p.price,
        stock_quantity: p.stock_quantity,
        category: p.category,
        description: p.description,
        breakdown: {
          standard: p.stock_standard,
          metal: p.stock_metal,
          fashion: p.stock_fashion,
        },
      })),
      count: products.length,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

// Update product stock (VHT-scoped: updates vht_stock for the logged-in health worker)
exports.updateProductStock = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantityChange, frameType } = req.body;
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: "Authentication required to update stock" });
    }
    if (!quantityChange) {
      return res.status(400).json({ success: false, error: "Quantity change required" });
    }

    const productRows = await sql`SELECT * FROM products WHERE id = ${productId}`;
    if (!productRows || productRows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const existing = await sql`SELECT * FROM vht_stock WHERE health_worker_id = ${healthWorkerId} AND product_id = ${productId}`;
    const row = existing && existing[0];

    const addStandard = frameType === "standard" ? quantityChange : 0;
    const addMetal = frameType === "metal" ? quantityChange : 0;
    const addFashion = frameType === "fashion" ? quantityChange : 0;
    const addTotal = quantityChange;

    if (row) {
      await sql`
        UPDATE vht_stock SET
          stock_quantity = stock_quantity + ${addTotal},
          stock_standard = stock_standard + ${addStandard},
          stock_metal = stock_metal + ${addMetal},
          stock_fashion = stock_fashion + ${addFashion}
        WHERE health_worker_id = ${healthWorkerId} AND product_id = ${productId}
      `;
    } else {
      await sql`
        INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
        VALUES (${healthWorkerId}, ${productId}, ${addTotal}, ${addStandard}, ${addMetal}, ${addFashion})
      `;
    }

    const updated = await sql`
      SELECT v.*, p.name, p.power, p.price
      FROM vht_stock v
      JOIN products p ON p.id = v.product_id
      WHERE v.health_worker_id = ${healthWorkerId} AND v.product_id = ${productId}
    `;

    res.json({
      success: true,
      message: "Stock updated successfully",
      product: updated && updated[0] ? {
        id: updated[0].product_id,
        name: updated[0].name,
        power: updated[0].power,
        price: updated[0].price,
        stock_quantity: updated[0].stock_quantity,
        stock_standard: updated[0].stock_standard,
        stock_metal: updated[0].stock_metal,
        stock_fashion: updated[0].stock_fashion,
      } : productRows[0],
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ success: false, error: "Failed to update stock" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;

    const product = await sql`
      SELECT * FROM products WHERE id = ${id}
    `;

    if (product.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({
      success: true,
      data: product[0],
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};
