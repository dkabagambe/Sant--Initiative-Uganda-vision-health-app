# Pre-production test checklist

Use this before releasing to production or submitting to Google Play (Google Console).

---

## 1. Backend API smoke test

Run the script against **local** and **Vercel** to confirm critical endpoints respond.

### Local (backend must be running)

```bash
cd backend
npm run dev
# In another terminal:
node scripts/smoke-test-api.js
# With auth (dev bypass number only):
TEST_PHONE=0705686573 node scripts/smoke-test-api.js
```

### Vercel (production API)

```bash
cd backend
BASE_URL=https://backend-tau-sepia-43.vercel.app/api node scripts/smoke-test-api.js
# Optional auth test:
TEST_PHONE=0705686573 BASE_URL=https://backend-tau-sepia-43.vercel.app/api node scripts/smoke-test-api.js
```

**Expected:** All steps show ✅. If any show ❌, fix the backend or environment before production.

---

## 2. Data flow checklist (manual)

Test these flows in the app (Expo on device or emulator). Use **local** backend first, then switch to **Vercel** and re-test critical paths.

### Auth

- [ ] **Login (OTP)**  
  - Enter phone → receive OTP (or use dev bypass `123456` for 0705686573) → verify → land on home.
- [ ] **Logout**  
  - Menu → Logout → back to login screen.

### Registration (no OTP sent)

- [ ] **CHW registration**  
  - Complete all steps; no OTP field; submission succeeds.
- [ ] **Outlet/retail registration**  
  - Shop front + ID photos (camera/gallery, crop); submit; no OTP.
- [ ] **VSLA registration**  
  - Complete flow; submit; no OTP.

### Vision screening & glasses

- [ ] **Full screening flow**  
  - Start screening → enter client details → vision tests → result (pass/referral/glasses).
- [ ] **Client needs glasses (e.g. 41+)**  
  - Power selection → **Client registration / Issue glasses** screen loads.
- [ ] **Issue glasses page**  
  - Client details, product, total cost, payment method (Hire-purchase / Full) visible and scrollable; no overlap; form submits.

### Payments

- [ ] **Full payment**  
  - Select Full Payment → Confirm Sale → success / receipt.
- [ ] **Hire-purchase (if used)**  
  - Select HP → VSLA group → mobile number → Confirm; payment initiation and status (or “pending”) as expected.

### Dashboard & data

- [ ] **Dashboard**  
  - Stats, inventory, reports load (no 401 if logged in).
- [ ] **Inventory**  
  - Products list and stock visible; add stock if applicable.

### Connectivity

- [ ] **Local backend**  
  - App points to `http://YOUR_IP:5000/api` (or localhost); health/products work.
- [ ] **Vercel backend**  
  - App points to Vercel API URL; same flows work (login, screening, payments).

---

## 3. Frontend / device checks

- [ ] No red errors in Metro/Expo console during the above flows.
- [ ] SafeAreaView / layout: no content under notch or status bar; “Issue glasses” and long address text wrap and scroll.
- [ ] Images (outlet registration): camera and gallery both work; crop and submit succeed.

---

## 4. Before Google Console (Play Store)

- [ ] All smoke tests and data-flow checks above pass for **Vercel** (production API).
- [ ] App version and build number updated (e.g. in `app.json` / `app.config.js`).
- [ ] Build production Android bundle:

  ```bash
  cd frontend
  npx expo prebuild
  cd android && ./gradlew bundleRelease
  ```

  Or use EAS Build if you use Expo Application Services.

- [ ] Store listing: short/long description, screenshots, privacy policy URL (if required).
- [ ] Content rating and target audience set in Play Console.
- [ ] Backend env on Vercel: `DATABASE_URL`, `JWT_SECRET`, `TWILIO_*` (and any other required vars) set for production.

---

## 5. Quick reference – critical endpoints

| Flow           | Method | Endpoint              | Auth   |
|----------------|--------|------------------------|--------|
| Health         | GET    | `/api/health`          | No     |
| Products       | GET    | `/api/products`        | No     |
| Login          | POST   | `/api/auth/login`      | No     |
| Verify OTP     | POST   | `/api/auth/verify-otp`| No     |
| Create screening | POST | `/api/screenings`      | No*    |
| Create payment | POST   | `/api/payments`        | No*    |
| Dashboard      | GET    | `/api/dashboard/*`     | Yes    |

\* Token may be sent by app after login.

When all items in sections 1–4 are done and pass, you’re ready to submit to Google Console.
