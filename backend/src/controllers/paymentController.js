// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      screeningId,
      productId,
      clientName,
      clientPhone,
      amount,
      mobileMoneyNumber,
      paymentMethod,
      paymentType,
      installmentNumber,
      totalInstallments,
      dueDate,
      offlineId,
    } = req.body;

    if (!amount || !clientPhone) {
      return res.status(400).json({ success: false, error: "Amount and client phone required" });
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment
    const payment = await sql`
      INSERT INTO payments (
        screening_id, product_id, client_name, client_phone,
        amount, mobile_money_number, transaction_id,
        status, payment_method, payment_type,
        installment_number, total_installments, due_date,
        offline_id, is_synced
      ) VALUES (
        ${screeningId || null}, ${productId || null}, ${clientName}, ${clientPhone},
        ${amount}, ${mobileMoneyNumber || clientPhone}, ${transactionId},
        'pending', ${paymentMethod || 'mobile_money'}, ${paymentType || 'full'},
        ${installmentNumber || null}, ${totalInstallments || null}, ${dueDate || null},
        ${offlineId || null}, true
      )
      RETURNING *
    `;

    // TODO: Integrate with mobile money API (MTN MoMo, Airtel Money)
    // For now, simulate payment processing
    if (paymentMethod === 'cash') {
      // Auto-complete cash payments
      await sql`
        UPDATE payments 
        SET status = 'completed', verified_at = NOW()
        WHERE id = ${payment[0].id}
      `;
      payment[0].status = 'completed';
    }

    res.json({
      success: true,
      message: "Payment created successfully",
      transactionId: payment[0].transaction_id,
      data: payment[0],
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ success: false, error: "Failed to create payment" });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { status, limit = 50, offset = 0 } = req.query;

    let payments;
    if (status) {
      payments = await sql`
        SELECT 
          p.*,
          pr.name as product_name,
          pr.power as product_power,
          s.client_name as screening_client_name
        FROM payments p
        LEFT JOIN products pr ON p.product_id = pr.id
        LEFT JOIN screenings s ON p.screening_id = s.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      payments = await sql`
        SELECT 
          p.*,
          pr.name as product_name,
          pr.power as product_power,
          s.client_name as screening_client_name
        FROM payments p
        LEFT JOIN products pr ON p.product_id = pr.id
        LEFT JOIN screenings s ON p.screening_id = s.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = await sql`
      SELECT COUNT(*) as count FROM payments
    `;

    res.json({
      success: true,
      data: payments,
      count: payments.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;

    const payment = await sql`
      SELECT 
        p.*,
        pr.name as product_name,
        pr.power as product_power,
        pr.price as product_price,
        s.client_name as screening_client_name,
        s.client_phone as screening_client_phone
      FROM payments p
      LEFT JOIN products pr ON p.product_id = pr.id
      LEFT JOIN screenings s ON p.screening_id = s.id
      WHERE p.id = ${id}
    `;

    if (payment.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.json({
      success: true,
      data: payment[0],
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment" });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sql = req.app.locals.sql;

    if (!['pending', 'completed', 'failed', 'overdue'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const currentTime = new Date().toISOString();
    
    if (status === 'completed') {
      await sql`
        UPDATE payments 
        SET status = ${status}, verified_at = ${currentTime}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE payments 
        SET status = ${status}
        WHERE id = ${id}
      `;
    }
    
    // Fetch updated record
    const updated = await sql`SELECT * FROM payments WHERE id = ${id}`;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.json({
      success: true,
      message: "Payment status updated",
      data: updated[0],
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ success: false, error: "Failed to update payment" });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
      FROM payments
    `;

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch statistics" });
  }
};

// Get installment payments for a client
exports.getClientInstallments = async (req, res) => {
  try {
    const { clientPhone } = req.params;
    const sql = req.app.locals.sql;

    const installments = await sql`
      SELECT * FROM payments
      WHERE client_phone = ${clientPhone}
      AND payment_type = 'installment'
      ORDER BY installment_number ASC
    `;

    res.json({
      success: true,
      data: installments,
      count: installments.length,
    });
  } catch (error) {
    console.error("Get client installments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch installments" });
  }
};
