# Frontend-Backend Connection Guide

## Backend Setup

### 1. Start the Backend Server

```bash
cd backend
./start.sh
```

Or manually:
```bash
cd backend
node src/index.js
```

The server will start on `http://localhost:5000`

### 2. Verify Backend is Running

Open your browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "database": "connected",
  "app": "Santé Initiative Uganda Backend"
}
```

## Frontend Setup

### 1. Configure API Base URL

Edit `frontend/src/services/api.ts` and set the correct API_BASE_URL:

**For Android Emulator:**
```typescript
const API_BASE_URL = "http://10.0.2.2:5000/api";
```

**For iOS Simulator:**
```typescript
const API_BASE_URL = "http://localhost:5000/api";
```

**For Physical Device:**
```typescript
const API_BASE_URL = "http://YOUR_COMPUTER_IP:5000/api";
```

To find your computer's IP:
- **Linux/Mac:** `ifconfig` or `ip addr show`
- **Windows:** `ipconfig`

### 2. Start the Frontend

```bash
cd frontend
npm start
```

## Testing the Connection

### 1. Test Authentication

1. Open the app
2. Enter a phone number (e.g., `0700123456`)
3. Click "Send OTP"
4. Check backend console for the OTP code
5. Enter the OTP
6. Complete registration

### 2. Test Products/Inventory

1. Navigate to Inventory screen
2. Products should load from database
3. Stock quantities should show with frame breakdowns

### 3. Test Screening

1. Start a new screening
2. Complete all 6 steps
3. Data should save to database
4. Check backend logs for confirmation

### 4. Test Payments

1. Navigate to Payments screen
2. Create a payment
3. Should save to database
4. View payment status

## API Endpoints Available

### Authentication
- `POST /api/auth/login` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & register
- `GET /api/auth/check` - Check auth status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id/stock` - Update stock

### Screenings
- `POST /api/screenings` - Create screening
- `GET /api/screenings` - Get all screenings
- `GET /api/screenings/stats` - Get statistics
- `GET /api/screenings/:id` - Get screening by ID

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get statistics
- `PATCH /api/payments/:id/status` - Update status
- `GET /api/payments/client/:phone/installments` - Get installments

### Referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals` - Get all referrals
- `GET /api/referrals/stats` - Get statistics
- `PATCH /api/referrals/:id/status` - Update status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/inventory` - Get inventory summary
- `GET /api/dashboard/reports` - Get reports
- `GET /api/dashboard/clients` - Get clients list

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use: `lsof -i :5000`
- Kill existing process: `pkill -f "node.*index.js"`
- Check database connection in `.env`

### Frontend can't connect
- Verify backend is running
- Check API_BASE_URL is correct
- For physical device, ensure same WiFi network
- Check firewall settings

### Database errors
- Run: `node scripts/init-db.js` to reinitialize
- Check DATABASE_URL in `.env`
- Verify Neon database is accessible

### Authentication fails
- Check JWT_SECRET in `.env`
- Clear AsyncStorage: In app, logout and clear data
- Check backend logs for OTP code

## Development Tips

1. **Keep backend running** - Use `nodemon` for auto-restart:
   ```bash
   npm install -g nodemon
   nodemon src/index.js
   ```

2. **Monitor logs** - Watch backend console for API calls and errors

3. **Test with Postman** - Import endpoints and test directly

4. **Check network** - Use React Native Debugger to inspect API calls

5. **Database queries** - Use Neon console to view/edit data directly
