# Registration Data Flow

## Database Table: `users`

All registration data (CHW, Outlet, VSLA) is stored in the **users** table.

## Fields Mapping

### CHW Registration
**Step 1:**
- firstName → users.first_name
- lastName → users.last_name  
- gender → users.gender
- nationalId → users.national_id

**Step 2:**
- phoneNumber → users.phone_number
- dateOfBirth → users.date_of_birth
- village → users.village
- parish → users.parish
- subCounty → users.sub_county
- district → users.district
- region → users.region

**Step 3:**
- organizationName → users.organization_name
- registrationNumber → users.registration_number
- yearsOfExperience → users.years_of_experience

**Step 4:**
- trainingCertificate → users.training_certificate
- role → users.role (set to "health_worker")

### Outlet Registration
**Step 1:**
- firstName, lastName, gender, nationalId (same as CHW)

**Step 2:**
- phoneNumber, dateOfBirth, village, parish, subCounty, district (same as CHW)
- businessName → users.business_name
- businessType → users.business_type
- tinNumber → users.tin_number

**Step 3:**
- OTP verification

**Step 4:**
- role → users.role (set to "outlet")

### VSLA Registration
**Step 1:**
- groupName → users.organization_name
- groupType → users.business_type
- registrationNumber → users.registration_number
- yearFormed → (not stored currently)

**Step 2:**
- chairperson, treasurer, secretary → (not stored currently)
- phoneNumber → users.phone_number
- district, county, subcounty, parish → users.district, etc.

**Step 3:**
- totalMembers, meetingFrequency → (not stored currently)

**Step 4:**
- role → users.role (set to "vsla")

## How to Check Registration Data

```sql
-- Check all registered users
SELECT phone_number, first_name, last_name, role, district, 
       organization_name, business_name, created_at 
FROM users 
ORDER BY created_at DESC;

-- Check CHW registrations
SELECT * FROM users WHERE role = 'health_worker';

-- Check Outlet registrations  
SELECT * FROM users WHERE role = 'outlet';

-- Check VSLA registrations
SELECT * FROM users WHERE role = 'vsla';
```

## Missing Fields

Some registration form fields are NOT currently stored in the database:
- VSLA: yearFormed, chairperson details, treasurer details, secretary details, totalMembers, meetingFrequency
- These would need additional database columns or a separate table

## Current Status
✅ Basic user info (name, phone, district) is saved
✅ Role-specific fields (organization_name, business_name) are saved
⚠️ Some VSLA-specific fields are collected but not stored
