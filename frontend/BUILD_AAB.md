# Build Android App Bundle (AAB) for Google Play

## Frontend ↔ Vercel

**Yes — the frontend is connected to Vercel in production.**

- In **release** builds (e.g. AAB), `__DEV__` is `false`, so the app uses:
  - **API base URL:** `https://backend-tau-sepia-43.vercel.app/api` (from `configService.ts` → `VERCEL_API_URL`).
- No `.env` or `EXPO_PUBLIC_API_URL` is needed for the store build; the built app will talk to your Vercel backend.

---

## Build AAB with EAS (recommended)

1. Install EAS CLI (once):
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. From the **frontend** folder, build the Android app bundle:
   ```bash
   cd frontend
   eas build --platform android --profile production
   ```

3. EAS builds in the cloud. When it finishes, you get a link to download the **.aab** (and optionally .apk). Use the .aab for Google Play Console upload.

4. Optional: bump version before each release in `app.json`:
   - `expo.version` (e.g. `1.1.2`)
   - `expo.android.versionCode` (e.g. `5`)

---

## Build AAB locally (without EAS)

If you prefer a local build:

```bash
cd frontend
npx expo prebuild
cd android
./gradlew bundleRelease
```

The AAB is at: `android/app/build/outputs/bundle/release/app-release.aab`.

**Note:** For production, the app still uses the Vercel API URL; no extra env is required for the AAB.
