# Loop Deployment & Production Guide

This guide covers everything required to deploy Loop across cloud infrastructure, web hosting, and mobile app stores.

---

## 1. Required GitHub Secrets by Environment

### Backend & Cloud (Staging & Production)
- `MONGODB_URI`: Production MongoDB Atlas connection string.
- `REDIS_URL`: Managed Redis URL for Socket.io adapter and BullMQ queues.
- `JWT_ACCESS_SECRET`: Minimum 32-character high-entropy secret.
- `JWT_REFRESH_SECRET`: Minimum 32-character high-entropy secret.
- `RENDER_API_KEY`: API token for deploying services via Render.

### Web Deployment (Vercel)
- `VERCEL_TOKEN`: Vercel automation token.
- `VERCEL_ORG_ID`: Team or organization ID.
- `VERCEL_PROJECT_ID`: Project ID.
- `VITE_API_URL`: Backend URL (e.g. `https://api.example.com`).

### Android Release (Google Play)
- `ANDROID_KEYSTORE_BASE64`: Base64-encoded release `.keystore` or `.jks` file.
- `ANDROID_KEYSTORE_PASSWORD`: Password for release keystore.
- `ANDROID_KEY_ALIAS`: Key alias in the release keystore.
- `ANDROID_KEY_PASSWORD`: Password for alias.
- `PLAY_STORE_JSON_KEY`: Service account credentials JSON from Google Play Developer Console.

### iOS Release (Apple App Store / TestFlight)
- `APPLE_ID`: Apple developer account email.
- `TEAM_ID`: Apple Developer Portal Team ID.
- `ITC_TEAM_ID`: App Store Connect Team ID.
- `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`: App-specific password.
- `MATCH_PASSWORD`: Decryption password for Match git storage.
- `MATCH_GIT_URL`: Private repository for certificates and provisioning profiles.

---

## 2. Backend Deployment (Render / Railway)

The repository provides a [`render.yaml`](file:///e:/Loop_App/render.yaml) blueprint:
1. Connect your repository to Render.
2. Render creates three resources automatically:
   - `loop-api`: Web service running Node 20+ ESM HTTP and Socket.io server with auto-scaling.
   - `loop-scheduler-worker`: Dedicated background worker running BullMQ to scan missed check-ins every 5 minutes (preventing duplicate triggers).
   - `loop-redis`: Private Redis instance connecting the API and worker.

---

## 3. Web Deployment (Vercel PWA)

1. Connect the repository to Vercel.
2. Root directory: `web`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set environment variable: `VITE_API_URL=https://api.yourdomain.com`.

---

## 4. Mobile Release Process

### Android:
```bash
cd mobile/android
bundle exec fastlane internal
```

### iOS:
```bash
cd mobile/ios
bundle exec fastlane beta
```
