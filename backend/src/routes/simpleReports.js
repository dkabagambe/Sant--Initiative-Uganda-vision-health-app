const express = require('express');
const router = express.Router();

// Simple reports endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { reportType, startDate, endDate } = req.query;

    if (reportType === 'screenings' || !reportType) {
      // Get screenings data with ONLY existing columns
      let query = sql`
        SELECT 
          s.id,
          s.client_name,
          s.client_phone,
          s.client_age as age,
          s.client_gender as gender,
          s.client_village as village,
          s.client_district as district,
          s.screening_date,
          s.distance_vision_left,
          s.distance_vision_right,
          s.distance_vision_both,
          s.near_vision_result,
          s.pinhole_test_left,
          s.pinhole_test_right,
          s.needs_glasses,
          s.needs_referral,
          s.referral_reason,
          s.recommended_product_id,
          s.recommended_power,
          s.selected_frame_type,
          s.notes,
          s.torch_test_passed,
          s.torch_test_abnormal_signs,
          s.health_worker_id,
          u.full_name as health_worker_name,
          s.created_at,
          s.is_synced,
          s.offline_id
        FROM screenings s
        LEFT JOIN users u ON s.health_worker_id = u.id
        WHERE s.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            s.id,
            s.client_name,
            s.client_phone,
            s.client_age as age,
            s.client_gender as gender,
            s.client_village as village,
            s.client_district as district,
            s.screening_date,
            s.distance_vision_left,
            s.distance_vision_right,
            s.distance_vision_both,
            s.near_vision_result,
            s.pinhole_test_left,
            s.pinhole_test_right,
            s.needs_glasses,
            s.needs_referral,
            s.referral_reason,
            s.recommended_product_id,
            s.recommended_power,
            s.selected_frame_type,
            s.notes,
            s.torch_test_passed,
            s.torch_test_abnormal_signs,
            s.health_worker_id,
            u.full_name as health_worker_name,
            s.created_at,
            s.is_synced,
            s.offline_id
          FROM screenings s
          LEFT JOIN users u ON s.health_worker_id = u.id
          WHERE s.client_name IS NOT NULL
          AND date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      const screenings = await query;
      
      if (reportType === 'screenings') {
        return res.json({
          success: true,
          data: screenings
        });
      }

      // For summary, calculate metrics
      const summary = {
        total_screenings: screenings.length,
        glasses_needed: screenings.filter(s => s.needs_glasses).length,
        referrals_made: screenings.filter(s => s.needs_referral).length,
        total_payments: 0, // Will be calculated below
        completed_payments: 0,
        total_revenue: 0,
        average_sale: 0,
        full_payment_revenue: 0,
        hire_purchase_revenue: 0,
      };

      return res.json({
        success: true,
        data: summary
      });
    }

    if (reportType === 'payments') {
      // Get payments data with ONLY existing columns
      let query = sql`
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
        WHERE p.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
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
          WHERE p.client_name IS NOT NULL
          AND date(COALESCE(p.payment_date, p.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      const payments = await query;
      return res.json({
        success: true,
        data: payments
      });
    }

    if (reportType === 'referrals') {
      // Get referrals data with ONLY existing columns
      let query = sql`
        SELECT 
          r.id,
          r.screening_id,
          r.client_name,
          r.client_phone,
          r.client_age as age,
          r.client_gender as gender,
          r.client_district as district,
          r.reason as referral_reason,
          r.facility_name,
          r.facility_location as facility_type,
          r.urgency as urgency_level,
          r.status as referral_status,
          r.referred_date,
          r.notes,
          r.health_worker_id,
          u.full_name as health_worker_name,
          r.created_at,
          s.needs_glasses,
          s.needs_referral,
          s.torch_test_passed,
          s.torch_test_abnormal_signs,
          s.distance_vision_left,
          s.distance_vision_right
        FROM referrals r
        LEFT JOIN users u ON r.health_worker_id = u.id
        LEFT JOIN screenings s ON r.screening_id = s.id
        WHERE r.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            r.id,
            r.screening_id,
            r.client_name,
            r.client_phone,
            r.client_age as age,
            r.client_gender as gender,
            r.client_district as district,
            r.reason as referral_reason,
            r.facility_name,
            r.facility_location as facility_type,
            r.urgency as urgency_level,
            r.status as referral_status,
            r.referred_date,
            r.notes,
            r.health_worker_id,
            u.full_name as health_worker_name,
            r.created_at,
            s.needs_glasses,
            s.needs_referral,
            s.torch_test_passed,
            s.torch_test_abnormal_signs,
            s.distance_vision_left,
            s.distance_vision_right
          FROM referrals r
          LEFT JOIN users u ON r.health_worker_id = u.id
          LEFT JOIN screenings s ON r.screening_id = s.id
          WHERE r.client_name IS NOT NULL
          AND date(COALESCE(r.referred_date, r.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      const referrals = await query;
      return res.json({
        success: true,
        data: referrals
      });
    }

    // Default: return summary with all data
    const [screenings, payments, referrals] = await Promise.all([
      sql`SELECT COUNT(*) as total_screenings FROM screenings WHERE client_name IS NOT NULL`,
      sql`SELECT COUNT(*) as total_payments, SUM(amount) as total_revenue FROM payments WHERE client_name IS NOT NULL`,
      sql`SELECT COUNT(*) as total_referrals FROM referrals WHERE client_name IS NOT NULL`
    ]);

    const summary = {
      total_screenings: parseInt(screenings[0]?.total_screenings || 0),
      glasses_needed: 0, // Would need more complex query
      referrals_made: parseInt(referrals[0]?.total_referrals || 0),
      total_payments: parseInt(payments[0]?.total_payments || 0),
      completed_payments: 0, // Would need status filter
      total_revenue: parseInt(payments[0]?.total_revenue || 0),
      average_sale: 0,
      full_payment_revenue: 0,
      hire_purchase_revenue: 0,
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load reports',
      details: error.message
    });
  }
});

module.exports = router;
