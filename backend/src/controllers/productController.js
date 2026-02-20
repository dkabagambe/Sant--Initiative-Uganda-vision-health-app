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

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, frameType } = req.body;
    const sql = req.app.locals.sql;

    if (!quantityChange) {
      return res.status(400).json({ success: false, error: "Quantity change required" });
    }

    // Build update query based on frame type
    let updateQuery;
    if (frameType === "standard") {
      updateQuery = sql`
        UPDATE products 
        SET stock_standard = stock_standard + ${quantityChange},
            stock_quantity = stock_quantity + ${quantityChange}
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (frameType === "metal") {
      updateQuery = sql`
        UPDATE products 
        SET stock_metal = stock_metal + ${quantityChange},
            stock_quantity = stock_quantity + ${quantityChange}
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (frameType === "fashion") {
      updateQuery = sql`
        UPDATE products 
        SET stock_fashion = stock_fashion + ${quantityChange},
            stock_quantity = stock_quantity + ${quantityChange}
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Update total stock only
      updateQuery = sql`
        UPDATE products 
        SET stock_quantity = stock_quantity + ${quantityChange}
        WHERE id = ${id}
        RETURNING *
      `;
    }

    const result = await updateQuery;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      product: result[0],
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
