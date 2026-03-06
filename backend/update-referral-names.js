require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function updateReferralClientNames() {
  try {
    console.log("🔍 Checking referral records with missing client names...");
    
    // First, check current state
    const referralsWithNullNames = await sql`
      SELECT id, client_name, client_phone, client_age, client_gender, client_district
      FROM referrals 
      WHERE client_name IS NULL OR client_name = '' OR client_name = 'CLIENT'
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${referralsWithNullNames.length} referrals with missing client names`);
    
    if (referralsWithNullNames.length === 0) {
      console.log("✅ All referrals have client names!");
      return;
    }
    
    // Update each referral with a generated name based on available data
    for (const referral of referralsWithNullNames) {
      let clientName = "Unknown Client";
      
      // Try to create a name from phone number (last 4 digits)
      if (referral.client_phone) {
        const last4 = referral.client_phone.slice(-4);
        clientName = `Client ${last4}`;
      }
      
      // Try to use age and gender for better name
      if (referral.client_age && referral.client_gender) {
        const ageGroup = referral.client_age < 18 ? 'Child' : referral.client_age < 60 ? 'Adult' : 'Senior';
        const gender = referral.client_gender.toLowerCase();
        clientName = `${ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} ${gender.charAt(0).toUpperCase() + gender.slice(1)}`;
      }
      
      // If we have district, add it
      if (referral.client_district && clientName !== "Unknown Client") {
        clientName += ` (${referral.client_district})`;
      }
      
      console.log(`Updating referral ${referral.id}: "${clientName}"`);
      
      await sql`
        UPDATE referrals 
        SET client_name = ${clientName}
        WHERE id = ${referral.id}
      `;
    }
    
    console.log("✅ Updated all referral client names!");
    
    // Verify the updates
    const updatedReferrals = await sql`
      SELECT id, client_name, client_phone, client_age, client_gender
      FROM referrals 
      WHERE client_name IS NULL OR client_name = '' OR client_name = 'CLIENT'
    `;
    
    console.log(`Remaining referrals with missing names: ${updatedReferrals.length}`);
    
    if (updatedReferrals.length === 0) {
      console.log("🎉 All referral client names have been updated successfully!");
    }
    
  } catch (error) {
    console.error("❌ Error updating referral client names:", error);
  }
}

updateReferralClientNames();
