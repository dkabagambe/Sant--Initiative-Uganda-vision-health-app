const { sendSMS } = require("../services/smsService");
const { initiateCollection } = require("../services/mobileMoneyService");
const {
  validateWebhookSignature,
  mapProviderCallback,
} = require("../services/paymentWebhookService");

// Helper to format amount in UGX
const formatAmount = (amount) => {
  if (typeof amount !== "number") return amount;
  return `UGX ${amount.toLocaleString("en-UG")}`;
};

const buildPaymentMessage = ({
  clientName,
  productId,
  amount,
  paymentMethod,
  paymentType,
  totalInstallments,
  dueDate,
}) => {
  const isInstallment = paymentType === "installment";
  const amountFormatted = formatAmount(amount);
  let message = `Sale completed successfully.\n`;
  if (clientName) {
    message += `Client: ${clientName}\n`;
  }
  if (productId) {
    message += `Product: Reading glasses\n`;
  }
  message += `Total amount: ${amountFormatted}\n`;
  message += `Payment method: ${paymentMethod || "mobile_money"}.`;

  if (isInstallment) {
    message += `\nPlan: Hire-purchase (${totalInstallments || 1} months).`;
    if (dueDate) {
      message += `\nNext payment: ${amountFormatted} due ${dueDate}.`;
    }
  }
  return message;
};

const sendPaymentReceiptSMS = ({
  clientPhone,
  clientName,
  productId,
  amount,
  paymentMethod,
  paymentType,
  totalInstallments,
  dueDate,
}) => {
  try {
    const message = buildPaymentMessage({
      clientName,
      productId,
      amount,
      paymentMethod,
      paymentType,
      totalInstallments,
      dueDate,
    });
    sendSMS(clientPhone, message)
      .then((result) => {
        console.log("Payment receipt SMS result:", result);
      })
      .catch((err) => {
        console.error("Payment receipt SMS error:", err.message);
      });
  } catch (smsError) {
    console.error("Failed to queue payment SMS:", smsError.message);
  }
};

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
      provider,
      providerReference,
      providerStatus,
    } = req.body;

    if (!amount || !clientPhone) {
      return res.status(400).json({ success: false, error: "Amount and client phone required" });
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Try full payment creation first, fall back to basic fields if schema doesn't support
    let payment;
    try {
      payment = await sql`
        INSERT INTO payments (
          screening_id, product_id, client_name, client_phone,
          amount, mobile_money_number, transaction_id,
          status, payment_method, payment_type,
          installment_number, total_installments, due_date,
          offline_id, is_synced,
          provider, provider_reference, provider_status
        ) VALUES (
          ${screeningId || null}, ${productId || null}, ${clientName}, ${clientPhone},
          ${amount}, ${mobileMoneyNumber || clientPhone}, ${transactionId},
          'pending', ${paymentMethod || 'mobile_money'}, ${paymentType || 'full'},
          ${installmentNumber || null}, ${totalInstallments || null}, ${dueDate || null},
          ${offlineId || null}, true,
          ${provider || null}, ${providerReference || null}, ${providerStatus || null}
        )
        RETURNING *
      `;
    } catch (schemaError) {
      // If schema doesn't support all fields, use basic fields only
      console.log('⚠️ Payment schema limited, using basic fields only');
      payment = await sql`
        INSERT INTO payments (
          screening_id, product_id, client_name, client_phone,
          amount, mobile_money_number, transaction_id,
          status, payment_method, payment_type,
          installment_number, total_installments, due_date,
          is_synced
        ) VALUES (
          ${screeningId || null}, ${productId || null}, ${clientName}, ${clientPhone},
          ${amount}, ${mobileMoneyNumber || clientPhone}, ${transactionId},
          'pending', ${paymentMethod || 'mobile_money'}, ${paymentType || 'full'},
          ${installmentNumber || null}, ${totalInstallments || null}, ${dueDate || null},
          true
        )
        RETURNING *
      `;
    }

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

    // Send receipt only for immediately completed flows (e.g. cash).
    if (payment[0].status === "completed") {
      sendPaymentReceiptSMS({
        clientPhone,
        clientName,
        productId,
        amount,
        paymentMethod,
        paymentType,
        totalInstallments,
        dueDate,
      });
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

// Initiate real-time mobile money collection and create pending payment
exports.initiateMobileMoneyPayment = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      screeningId,
      productId,
      clientName,
      clientPhone,
      amount,
      mobileMoneyNumber,
      paymentMethod = "mobile_money",
      paymentType = "full",
      installmentNumber,
      totalInstallments,
      dueDate,
      offlineId,
      provider = "mtn",
    } = req.body;

    if (!amount || !clientPhone) {
      return res
        .status(400)
        .json({ success: false, error: "Amount and client phone required" });
    }

    const transactionId = `TXN_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)
      .toUpperCase()}`;

    const payment = await sql`
      INSERT INTO payments (
        screening_id, product_id, client_name, client_phone,
        amount, mobile_money_number, transaction_id,
        status, payment_method, payment_type,
        installment_number, total_installments, due_date,
        offline_id, is_synced,
        provider, provider_reference, provider_status, provider_requested_at
      ) VALUES (
        ${screeningId || null}, ${productId || null}, ${clientName || null}, ${clientPhone},
        ${amount}, ${mobileMoneyNumber || clientPhone}, ${transactionId},
        'pending', ${paymentMethod}, ${paymentType},
        ${installmentNumber || null}, ${totalInstallments || null}, ${dueDate || null},
        ${offlineId || null}, true,
        ${provider}, ${transactionId}, 'INITIATED', ${new Date().toISOString()}
      )
      RETURNING *
    `;

    const initiation = await initiateCollection({
      provider,
      amount,
      phoneNumber: mobileMoneyNumber || clientPhone,
      externalReference: transactionId,
      payerMessage: "Approve mobile money payment for vision services",
    });

    if (!initiation.success) {
      await sql`
        UPDATE payments
        SET status = 'failed',
            provider_status = 'FAILED',
            provider_failure_reason = ${initiation.error || "Initiation failed"}
        WHERE id = ${payment[0].id}
      `;

      return res.status(400).json({
        success: false,
        error: initiation.error || "Failed to initiate mobile money collection",
        data: { ...payment[0], status: "failed" },
      });
    }

    await sql`
      UPDATE payments
      SET provider = ${initiation.provider || provider},
          provider_reference = ${initiation.providerReference || transactionId},
          provider_status = ${initiation.providerStatus || "PENDING"}
      WHERE id = ${payment[0].id}
    `;

    // Mock auto-complete in development to make local real-time flow testable.
    if (initiation.mode === "mock") {
      setTimeout(async () => {
        try {
          await sql`
            UPDATE payments
            SET status = 'completed',
                verified_at = ${new Date().toISOString()},
                provider_status = 'SUCCESS',
                provider_completed_at = ${new Date().toISOString()}
            WHERE id = ${payment[0].id}
          `;

          sendPaymentReceiptSMS({
            clientPhone,
            clientName,
            productId,
            amount,
            paymentMethod,
            paymentType,
            totalInstallments,
            dueDate,
          });
        } catch (err) {
          console.error("Mock mobile money completion error:", err.message);
        }
      }, 6000);
    }

    const updated = await sql`SELECT * FROM payments WHERE id = ${payment[0].id}`;

    res.json({
      success: true,
      message: "Mobile money request initiated",
      data: updated[0],
      transactionId,
    });
  } catch (error) {
    console.error("Initiate mobile money error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to initiate mobile money payment" });
  }
};

// Provider callback endpoint to update payment in real-time
exports.handleMobileMoneyWebhook = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const provider = (req.params.provider || "").toLowerCase();
    const payload = req.body || {};

    const signatureCheck = validateWebhookSignature(provider, req);
    if (!signatureCheck.valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid webhook signature",
        reason: signatureCheck.reason,
      });
    }

    const mapped = mapProviderCallback(provider, payload);
    if (!mapped.reference) {
      return res
        .status(400)
        .json({ success: false, error: "Missing provider reference" });
    }

    await sql`
      UPDATE payments
      SET status = ${mapped.internalStatus},
          verified_at = ${
            mapped.internalStatus === "completed" ? new Date().toISOString() : null
          },
          provider = ${provider || null},
          provider_status = ${String(mapped.providerStatus)},
          provider_callback_payload = ${JSON.stringify(payload)},
          provider_completed_at = ${
            mapped.internalStatus === "completed" ? new Date().toISOString() : null
          },
          provider_failure_reason = ${
            mapped.internalStatus === "failed"
              ? mapped.failureReason || "Provider failure"
              : null
          }
      WHERE provider_reference = ${mapped.reference}
         OR transaction_id = ${mapped.reference}
    `;

    const rows = await sql`
      SELECT * FROM payments
      WHERE provider_reference = ${mapped.reference}
         OR transaction_id = ${mapped.reference}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (rows.length > 0 && rows[0].status === "completed") {
      sendPaymentReceiptSMS({
        clientPhone: rows[0].client_phone,
        clientName: rows[0].client_name,
        productId: rows[0].product_id,
        amount: Number(rows[0].amount),
        paymentMethod: rows[0].payment_method,
        paymentType: rows[0].payment_type,
        totalInstallments: rows[0].total_installments,
        dueDate: rows[0].due_date,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mobile money webhook error:", error);
    res.status(500).json({ success: false, error: "Webhook handling failed" });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const payment = await sql`
      SELECT * FROM payments WHERE id = ${id}
    `;
    if (payment.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }
    res.json({ success: true, data: payment[0] });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment status" });
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

    if (status === "completed") {
      sendPaymentReceiptSMS({
        clientPhone: updated[0].client_phone,
        clientName: updated[0].client_name,
        productId: updated[0].product_id,
        amount: Number(updated[0].amount),
        paymentMethod: updated[0].payment_method,
        paymentType: updated[0].payment_type,
        totalInstallments: updated[0].total_installments,
        dueDate: updated[0].due_date,
      });
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
