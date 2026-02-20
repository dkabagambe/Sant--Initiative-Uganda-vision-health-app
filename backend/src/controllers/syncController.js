exports.sync = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { operations } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(operations)) {
      return res
        .status(400)
        .json({ success: false, error: "operations must be an array" });
    }

    const results = [];

    for (const op of operations) {
      try {
        if (op.type === "screening" || op.clientName) {
          const {
            clientName,
            clientPhone,
            visualAcuityLeft,
            visualAcuityRight,
            recommendedProductId,
            date,
          } = op;

          const inserted = await sql`
            INSERT INTO screenings
              (health_worker_id, client_name, client_phone, visual_acuity_left, visual_acuity_right, recommended_product_id, screening_date, synced)
            VALUES
              (${userId}, ${clientName}, ${clientPhone}, ${visualAcuityLeft}, ${visualAcuityRight}, ${recommendedProductId}, ${date || new Date()}, true)
            RETURNING id
          `;

          results.push({ ...op, synced: true, id: inserted[0].id });
        } else if (op.type === "payment" || op.amount) {
          const { clientName, clientPhone, amount, productName } = op;
          const transactionId = `SYNC_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

          const inserted = await sql`
            INSERT INTO payments
              (health_worker_id, client_name, client_phone, amount, product_name, transaction_id, status, synced)
            VALUES
              (${userId}, ${clientName}, ${clientPhone}, ${amount}, ${productName}, ${transactionId}, 'completed', true)
            RETURNING id
          `;

          results.push({
            ...op,
            synced: true,
            transactionId,
            id: inserted[0].id,
          });
        } else {
          results.push({
            ...op,
            synced: false,
            error: "Unknown operation type",
          });
        }
      } catch (err) {
        console.error("Error syncing operation:", err);
        results.push({ ...op, synced: false, error: err.message });
      }
    }

    res.json({
      success: true,
      syncedCount: results.filter((r) => r.synced).length,
      results,
    });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
