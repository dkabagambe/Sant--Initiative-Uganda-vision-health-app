const { sendSMS } = require("./smsService");

// Check every hour for upcoming / overdue installment payments
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

const formatAmount = (amount) => {
  if (typeof amount !== "number") return amount;
  return `UGX ${amount.toLocaleString("en-UG")}`;
};

const buildReminderMessage = (payment, type) => {
  const amountFormatted = formatAmount(payment.amount);
  const dueDate = payment.due_date;

  if (type === "upcoming") {
    return (
      `Reminder: your glasses payment of ${amountFormatted} is due on ${dueDate}.\n` +
      `Plan: Hire-purchase (${payment.total_installments || 1} months).\n` +
      `Thank you for using Santé Initiative Uganda.`
    );
  }

  // overdue
  return (
    `Your glasses payment of ${amountFormatted} was due on ${dueDate} and is now overdue.\n` +
    `Please pay as soon as possible to keep your hire-purchase plan active.\n` +
    `Thank you, Santé Initiative Uganda.`
  );
};

exports.startPaymentReminderScheduler = (sql) => {
  console.log("⏰ Starting payment reminder scheduler (hourly checks)...");

  const runCheck = async () => {
    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const threeDaysStr = threeDaysFromNow.toISOString().slice(0, 10);

      // Upcoming installments (next 3 days)
      const upcoming = await sql`
        SELECT * FROM payments
        WHERE payment_type = 'installment'
          AND status = 'pending'
          AND due_date IS NOT NULL
          AND date(due_date) >= date(${todayStr})
          AND date(due_date) <= date(${threeDaysStr})
      `;

      // Overdue installments
      const overdue = await sql`
        SELECT * FROM payments
        WHERE payment_type = 'installment'
          AND status = 'pending'
          AND due_date IS NOT NULL
          AND date(due_date) < date(${todayStr})
      `;

      for (const payment of upcoming) {
        if (!payment.client_phone) continue;
        const msg = buildReminderMessage(payment, "upcoming");
        sendSMS(payment.client_phone, msg).then((r) => {
          console.log("📩 Upcoming installment reminder sent:", {
            id: payment.id,
            phone: payment.client_phone,
            result: r,
          });
        }).catch((err) => {
          console.error("Failed to send upcoming reminder:", err.message);
        });
      }

      for (const payment of overdue) {
        if (!payment.client_phone) continue;
        const msg = buildReminderMessage(payment, "overdue");
        sendSMS(payment.client_phone, msg).then((r) => {
          console.log("📩 Overdue installment reminder sent:", {
            id: payment.id,
            phone: payment.client_phone,
            result: r,
          });
        }).catch((err) => {
          console.error("Failed to send overdue reminder:", err.message);
        });
      }
    } catch (err) {
      console.error("Payment reminder scheduler error:", err.message);
    }
  };

  // Run once on startup, then on interval
  runCheck();
  setInterval(runCheck, CHECK_INTERVAL_MS);
};

