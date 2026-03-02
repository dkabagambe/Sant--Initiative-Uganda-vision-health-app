# Physical Device Setup

When running the Expo app on a **physical phone**, the device must reach your backend. `localhost` on the phone points to the phone itself, not your computer.

## Steps

1. **Find your machine IP** (phone and computer must be on same Wi‑Fi)
   - Linux: `hostname -I` or `ip addr`
   - macOS: System Settings → Network → Wi‑Fi → Details

2. **Create `frontend/.env`** (copy from .env.example):
   ```bash
   cp .env.example .env
   ```

3. **Edit `frontend/.env`** and set your IP:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
   ```
   Example: `EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api`

4. **Start the backend** (on your machine):
   ```bash
   cd backend && npm run dev
   ```

5. **Start Expo**:
   ```bash
   cd frontend && npx expo start
   ```

6. **Full reload on device** — After changing `.env`, shake the device → Reload (hot reload does not pick up env changes).
