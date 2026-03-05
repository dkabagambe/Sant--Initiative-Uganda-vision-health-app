const express = require('express');
const router = express.Router();

// Simple reports endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { reportType, startDate, endDate } = req.query;

    let data = [];

    if (reportType === 'screenings' || !reportType) {
      // Get screenings data with available columns
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
          p.name as product_name,
          p.power as product_power,
          p.price as product_price,
          p.category as product_category,
          s.health_worker_id,
          u.full_name as health_worker_name,
          s.created_at,
          s.is_synced,
          s.offline_id
        FROM screenings s
        LEFT JOIN products p ON s.recommended_product_id = p.id
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
            p.name as product_name,
            p.power as product_power,
            p.price as product_price,
            p.category as product_category,
            s.health_worker_id,
            u.full_name as health_worker_name,
            s.created_at,
            s.is_synced,
            s.offline_id
          FROM screenings s
          LEFT JOIN products p ON s.recommended_product_id = p.id
          LEFT JOIN users u ON s.health_worker_id = u.id
          WHERE s.client_name IS NOT NULL
          AND date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      const screenings = await query;
      data = screenings;
    } else if (reportType === 'payments') {
      // Get payments data with full details
      let query = sql`
        SELECT 
          p.id,
          p.screening_id,
          p.product_id,
          p.client_name,
          p.client_phone,
          p.amount,
          p.currency,
          p.mobile_money_number,
          p.transaction_id,
          p.status,
          p.payment_method,
          p.payment_type,
          p.installment_number,
          p.total_installments,
          p.due_date,
          p.payment_date,
          p.verified_at,
          p.offline_id,
          p.is_synced,
          p.created_at,
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
            p.screening_id,
            p.product_id,
            p.client_name,
            p.client_phone,
            p.amount,
            p.currency,
            p.mobile_money_number,
            p.transaction_id,
            p.status,
            p.payment_method,
            p.payment_type,
            p.installment_number,
            p.total_installments,
            p.due_date,
            p.payment_date,
            p.verified_at,
            p.offline_id,
            p.is_synced,
            p.created_at,
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
      data = payments;
    } else if (reportType === 'referrals') {
      // Get referrals data with full details
      let query = sql`
        SELECT 
          r.id,
          r.screening_id,
          r.client_name,
          r.client_phone,
          r.client_age,
          r.client_gender,
          r.client_district,
          r.reason,
          r.facility_name,
          r.facility_location,
          r.urgency,
          r.status,
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
            r.client_age,
            r.client_gender,
            r.client_village,
            r.client_district,
            r.reason,
            r.facility_name,
            r.facility_location,
            r.urgency,
            r.status,
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
      data = referrals;
    }

    // Calculate summary statistics if no specific report type
    if (!reportType) {
      let summaryQuery;
      if (startDate && endDate) {
        summaryQuery = sql`
          SELECT 
            COUNT(DISTINCT s.id) as total_screenings,
            COUNT(DISTINCT CASE WHEN s.needs_glasses = true THEN s.id END) as glasses_needed,
            COUNT(DISTINCT CASE WHEN s.needs_referral = true THEN s.id END) as referrals_needed,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            COUNT(DISTINCT p.id) as total_payments,
            COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_payments,
            COUNT(DISTINCT CASE WHEN p.payment_type = 'installment' THEN p.id END) as hire_purchase_count,
            COUNT(DISTINCT CASE WHEN p.payment_type = 'full' THEN p.id END) as full_payment_count
          FROM screenings s
          LEFT JOIN payments p ON s.id = p.screening_id
          WHERE date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      } else {
        summaryQuery = sql`
          SELECT 
            COUNT(DISTINCT s.id) as total_screenings,
            COUNT(DISTINCT CASE WHEN s.needs_glasses = true THEN s.id END) as glasses_needed,
            COUNT(DISTINCT CASE WHEN s.needs_referral = true THEN s.id END) as referrals_needed,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            COUNT(DISTINCT p.id) as total_payments,
            COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_payments,
            COUNT(DISTINCT CASE WHEN p.payment_type = 'installment' THEN p.id END) as hire_purchase_count,
            COUNT(DISTINCT CASE WHEN p.payment_type = 'full' THEN p.id END) as full_payment_count
          FROM screenings s
          LEFT JOIN payments p ON s.id = p.screening_id
        `;
      }
      
      const summary = await summaryQuery;

      return res.json({
        success: true,
        data: data,
        summary: summary[0] || {}
      });
    }

    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Simple reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
