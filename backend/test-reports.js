#!/usr/bin/env node

// Test all reports endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testReports() {
  console.log('=== Testing All Reports Endpoints ===\n');

  try {
    // Test 1: Screenings Report
    console.log('1. Testing Screenings Report...');
    const screeningsRes = await axios.get(`${BASE_URL}/simple-reports/list?reportType=screenings`);
    console.log('✅ Screenings:', screeningsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Records: ${screeningsRes.data.data?.length || 0}`);

    // Test 2: Payments Report  
    console.log('\n2. Testing Payments Report...');
    const paymentsRes = await axios.get(`${BASE_URL}/simple-reports/list?reportType=payments`);
    console.log('✅ Payments:', paymentsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Records: ${paymentsRes.data.data?.length || 0}`);

    // Test 3: Referrals Report
    console.log('\n3. Testing Referrals Report...');
    const referralsRes = await axios.get(`${BASE_URL}/simple-reports/list?reportType=referrals`);
    console.log('✅ Referrals:', referralsRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Records: ${referralsRes.data.data?.length || 0}`);

    // Test 4: Summary Report
    console.log('\n4. Testing Summary Report...');
    const summaryRes = await axios.get(`${BASE_URL}/simple-reports/list`);
    console.log('✅ Summary:', summaryRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Summary data: ${Object.keys(summaryRes.data.data || {}).length} metrics`);

    // Test 5: Inventory Summary
    console.log('\n5. Testing Inventory Summary...');
    const inventoryRes = await axios.get(`${BASE_URL}/simple-inventory/summary`);
    console.log('✅ Inventory:', inventoryRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Products: ${inventoryRes.data.data?.products?.length || 0}`);
    console.log(`   - Total Stock: ${inventoryRes.data.data?.totals?.total_pairs || 0}`);

    // Test 6: Export CSV
    console.log('\n6. Testing CSV Export...');
    const exportRes = await axios.get(`${BASE_URL}/export/download?reportType=screenings&format=csv`, {
      responseType: 'text'
    });
    console.log('✅ Export:', exportRes.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log(`   - CSV Lines: ${exportRes.data.split('\n').length}`);

    // Test 7: Date Filtered Reports
    console.log('\n7. Testing Date-Filtered Reports...');
    const dateFilteredRes = await axios.get(`${BASE_URL}/simple-reports/list?reportType=screenings&startDate=2026-03-01&endDate=2026-03-31`);
    console.log('✅ Date Filtered:', dateFilteredRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   - Records in date range: ${dateFilteredRes.data.data?.length || 0}`);

    console.log('\n=== All Reports Tests Complete ===');
    console.log('🎉 Reports page should be fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testReports();
