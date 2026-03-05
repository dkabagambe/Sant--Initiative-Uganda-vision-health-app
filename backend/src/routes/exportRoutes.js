const express = require('express');
const router = express.Router();

// Export data as CSV or PDF
router.get('/download', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { reportType, format, startDate, endDate } = req.query;

    if (!format || !['csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use csv or pdf'
      });
    }

    let data = [];
    let filename = '';
    let headers = [];

    if (reportType === 'screenings' || !reportType) {
      // Get screenings data
      let query = sql`
        SELECT 
          s.client_name,
          s.client_phone,
          s.client_age as age,
          s.client_gender as gender,
          s.client_village as village,
          s.client_district as district,
          s.screening_date,
          s.needs_glasses,
          s.needs_referral,
          s.referral_reason,
          s.recommended_power,
          s.selected_frame_type,
          s.notes,
          u.full_name as health_worker_name,
          s.created_at
        FROM screenings s
        LEFT JOIN users u ON s.health_worker_id = u.id
        WHERE s.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            s.client_name,
            s.client_phone,
            s.client_age as age,
            s.client_gender as gender,
            s.client_village as village,
            s.client_district as district,
            s.screening_date,
            s.needs_glasses,
            s.needs_referral,
            s.referral_reason,
            s.recommended_power,
            s.selected_frame_type,
            s.notes,
            u.full_name as health_worker_name,
            s.created_at
          FROM screenings s
          LEFT JOIN users u ON s.health_worker_id = u.id
          WHERE s.client_name IS NOT NULL
          AND date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      data = await query;
      filename = `screenings_${startDate || 'all'}_${endDate || 'all'}`;
      headers = [
        'Client Name', 'Phone', 'Age', 'Gender', 'Village', 'District', 
        'Screening Date', 'Needs Glasses', 'Needs Referral', 'Referral Reason',
        'Recommended Power', 'Frame Type', 'Notes', 'Health Worker', 'Created At'
      ];
    } else if (reportType === 'payments') {
      // Get payments data
      let query = sql`
        SELECT 
          p.client_name,
          p.client_phone,
          p.amount,
          p.payment_method,
          p.payment_type,
          p.payment_date,
          p.due_date,
          p.status,
          prod.name as product_name,
          prod.power as product_power,
          u.full_name as health_worker_name
        FROM payments p
        LEFT JOIN products prod ON p.product_id = prod.id
        LEFT JOIN users u ON p.health_worker_id = u.id
        WHERE p.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            p.client_name,
            p.client_phone,
            p.amount,
            p.payment_method,
            p.payment_type,
            p.payment_date,
            p.due_date,
            p.status,
            prod.name as product_name,
            prod.power as product_power,
            u.full_name as health_worker_name
          FROM payments p
          LEFT JOIN products prod ON p.product_id = prod.id
          LEFT JOIN users u ON p.health_worker_id = u.id
          WHERE p.client_name IS NOT NULL
          AND date(COALESCE(p.payment_date, p.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      data = await query;
      filename = `payments_${startDate || 'all'}_${endDate || 'all'}`;
      headers = [
        'Client Name', 'Phone', 'Amount', 'Payment Method', 'Payment Type',
        'Payment Date', 'Due Date', 'Status', 'Product Name', 'Product Power', 'Health Worker'
      ];
    } else if (reportType === 'referrals') {
      // Get referrals data
      let query = sql`
        SELECT 
          r.client_name,
          r.client_phone,
          r.client_age as age,
          r.client_gender as gender,
          r.client_district as district,
          r.referral_reason,
          r.facility_name,
          r.urgency_level,
          r.referral_status,
          r.referred_date,
          u.full_name as health_worker_name
        FROM referrals r
        LEFT JOIN users u ON r.health_worker_id = u.id
        WHERE r.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            r.client_name,
            r.client_phone,
            r.client_age as age,
            r.client_gender as gender,
            r.client_district as district,
            r.referral_reason,
            r.facility_name,
            r.urgency_level,
            r.referral_status,
            r.referred_date,
            u.full_name as health_worker_name
          FROM referrals r
          LEFT JOIN users u ON r.health_worker_id = u.id
          WHERE r.client_name IS NOT NULL
          AND date(COALESCE(r.referred_date, r.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      data = await query;
      filename = `referrals_${startDate || 'all'}_${endDate || 'all'}`;
      headers = [
        'Client Name', 'Phone', 'Age', 'Gender', 'District', 'Referral Reason',
        'Facility Name', 'Urgency Level', 'Status', 'Referred Date', 'Health Worker'
      ];
    }

    if (format === 'csv') {
      // Generate CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.client_name || '',
          row.client_phone || '',
          row.age || '',
          row.gender || '',
          row.village || '',
          row.district || '',
          row.screening_date || '',
          row.needs_glasses || '',
          row.needs_referral || '',
          row.referral_reason || '',
          row.recommended_power || '',
          row.selected_frame_type || '',
          row.notes || '',
          row.health_worker_name || '',
          row.created_at || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvContent);
    } else if (format === 'pdf') {
      // For PDF, we'll need a PDF library. For now, return JSON that can be used by frontend
      return res.json({
        success: true,
        data: data,
        headers: headers,
        filename: filename,
        message: 'PDF export requires frontend implementation. Use CSV for now.'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      details: error.message
    });
  }
});

module.exports = router;
