# Database Schema Verification

## ✅ All Tables Created and Populated

### 1. **users** (4 records)
Fields:
- id, phone_number, first_name, last_name, full_name
- gender, national_id, date_of_birth, role
- village, parish, sub_county, district, region
- organization_name, registration_number, years_of_experience
- training_certificate, business_name, business_type, tin_number
- created_at, updated_at, last_login, is_active
- otp_code, otp_expires_at

Sample User: Jane Nambi (0700123456) - Luweero District

### 2. **products** (6 records)
Fields:
- id, name, description, power, price, currency
- stock_quantity, stock_standard, stock_metal, stock_fashion
- category, created_at

### 3. **screenings** (28 records)
Fields:
- id, client_id, client_name, client_phone, client_age, client_gender, client_village
- health_worker_id, distance_vision_left, distance_vision_right, distance_vision_both
- near_vision_result, pinhole_test_left, pinhole_test_right
- needs_glasses, needs_referral, referral_reason
- recommended_product_id, recommended_power, selected_frame_type
- notes, screening_date, created_at, is_synced, offline_id

### 4. **payments** (1 record)
Fields:
- id, screening_id, product_id, client_name, client_phone
- amount, currency, mobile_money_number, transaction_id
- status, payment_method, payment_type
- installment_number, total_installments, due_date
- payment_date, verified_at, created_at, is_synced, offline_id

### 5. **referrals** (1 record)
Fields:
- id, screening_id, client_id, health_worker_id, client_name
- reason, urgency, facility_name, facility_location
- status, referred_date, completed_date, notes, created_at

### 6. **clients** (3 records)
Fields:
- id, health_worker_id, full_name, phone_number
- age, gender, village, district, created_at

Sample Clients:
- Nakato Grace (0701234567)
- Musoke Peter (0702345678)
- Nansubuga Sarah (0703456789)

## Database Location
`/home/daniel/websites/sante-initiative/backend/sante.db`

## All Required Fields Present ✅
- User registration fields (CHW, Outlet, VSLA)
- Screening workflow fields
- Payment tracking fields
- Referral management fields
- Client management fields
- Offline sync support (is_synced, offline_id)
