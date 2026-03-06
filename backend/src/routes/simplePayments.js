const express = require('express');
const router = express.Router();

// Simple payments endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { status, limit = 50, offset = 0 } = req.query;

    let payments;
    if (status) {
      payments = await sql`
        SELECT 
          p.id,
          p.client_name,
          p.client_phone,
          p.amount,
          p.payment_method,
          p.payment_type,
          p.installment_number,
          p.total_installments,
          p.due_date,
          p.payment_date,
          p.verified_at,
          p.transaction_id,
          p.offline_id,
          p.is_synced,
          p.created_at,
          p.status,
          prod.name as product_name,
          prod.power as product_power,
          prod.price as product_price,
          prod.category as product_category,
          s.client_age,
          s.client_gender,
          s.client_village,
          s.client_district
        FROM payments p
        LEFT JOIN products prod ON p.product_id = prod.id
        LEFT JOIN screenings s ON p.screening_id = s.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      payments = await sql`
        SELECT 
          p.id,
          p.client_name,
          p.client_phone,
          p.amount,
          p.payment_method,
          p.payment_type,
          p.installment_number,
          p.total_installments,
          p.due_date,
          p.payment_date,
          p.verified_at,
          p.transaction_id,
          p.offline_id,
          p.is_synced,
          p.created_at,
          p.status,
          prod.name as product_name,
          prod.power as product_power,
          prod.price as product_price,
          prod.category as product_category,
          s.client_age,
          s.client_gender,
          s.client_village,
          s.client_district
        FROM payments p
        LEFT JOIN products prod ON p.product_id = prod.id
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
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments',
      details: error.message 
    });
  }
});

// Create new payment
router.post('/create', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      client_name,
      client_phone,
      amount,
      payment_method = 'cash',
      payment_type = 'full',
      product_id,
      screening_id,
      due_date,
      total_installments = 1,
      health_worker_id
    } = req.body;

    // Get a valid health worker ID if not provided
    let workerId = health_worker_id;
    if (!workerId) {
      const workers = await sql`SELECT id FROM users WHERE role = 'health_worker' LIMIT 1`;
      if (workers.length > 0) {
        workerId = workers[0].id;
      }
    }

    const payment = await sql`
      INSERT INTO payments (
        client_name, client_phone, amount, payment_method, payment_type,
        product_id, screening_id, due_date, total_installments,
        payment_date, created_at, status
      ) VALUES (
        ${client_name || null}, ${client_phone || null}, ${amount || null}, ${payment_method || null}, ${payment_type || null},
        ${product_id || null}, ${screening_id || null}, ${due_date || null}, ${total_installments || null},
        ${new Date().toISOString().split('T')[0]}, NOW(), 'pending'
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Payment created successfully',
      data: payment[0]
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment',
      details: error.message 
    });
  }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { status } = req.body;

    const payment = await sql`
      UPDATE payments 
      SET 
        status = ${status},
        payment_date = ${status === 'completed' ? new Date().toISOString().split('T')[0] : 'payment_date'},
        verified_at = ${status === 'completed' ? NOW() : 'verified_at'},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment[0]
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update payment status',
      details: error.message 
    });
  }
});

// Get payment status
router.get('/:id/status', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;

    const payment = await sql`
      SELECT status, payment_date, verified_at, created_at
      FROM payments 
      WHERE id = ${id}
    `;

    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment[0]
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get payment status',
      details: error.message 
    });
  }
});

// Get payment stats
router.get('/stats', async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_payments,
        COUNT(*) FILTER (WHERE payment_type = 'full') as full_payments,
        COUNT(*) FILTER (WHERE payment_type = 'installment') as installment_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue
      FROM payments
    `;

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment stats',
      details: error.message 
    });
  }
});

module.exports = router;
