# JaundiCare

JaundiCare is a mobile-first newborn jaundice screening, triage, education, and referral support application for parents, caregivers, and community health workers in Nigeria.

It is designed for lower-end Android phones and unreliable networks. The experience uses short, direct language and recorded guidance in English, Yoruba, Hausa, Igbo, and Nigerian Pidgin.

> **Clinical safety:** JaundiCare provides decision support and education. It does not diagnose a child or replace a qualified health professional. Urgent symptoms must be assessed at an appropriate health facility.

## What is included

- Phone-number sign-in using one-time passcodes.
- A presentation-safe OTP mode for three pre-authorised team phones.
- Parent profiles, baby profiles, screening history, and symptom-based risk triage.
- On-device ONNX inference for Android and server-side PyTorch inference.
- Image validation, consented image storage, and private signed image access.
- Nearby-facility discovery using GPS or a manual State/LGA fallback.
- Nearest, government, and clinic/private facility preferences, capability tags, telephone links, and map directions.
- Recorded onboarding audio and interface translations in five languages.
- Parent access to MamaBot, plus Community Care and VaxAI for an authorised community health worker account.
- Offline-friendly caching and queued screening submission.

## Repository layout

```text
backend/        FastAPI API, database migrations, triage, AI, facilities, and integrations
mobile/         Expo / React Native Android application
web/            Original browser prototype using the same API
render.yaml     Render blueprint for the API and PostgreSQL database
```

## Fast demo: use the built Android APK

The verified release APK is at:

[`mobile/android/app/build/outputs/apk/release/app-release.apk`](mobile/android/app/build/outputs/apk/release/app-release.apk)

1. Deploy the current `backend/` source to Render first. The APK contains the updated app screens, but facilities, sign-in, roles, and chat depend on the deployed API.
2. Copy the APK to the Android phone and install it. If Android reports a signature conflict, uninstall the older JaundiCare app first, then install this one.
3. Open the app. English narration starts once on the welcome screen. Switching languages stops the previous narration before the next one starts.
4. On the dashboard, choose **Find care nearby**, allow location access, then try **Government** to see facilities with services such as bilirubin testing and phototherapy. If GPS is unavailable, select State and LGA manually.

## Render deployment

Use the repository root [`render.yaml`](render.yaml), or configure the service manually:

```text
Root directory: backend
Build command: pip install -r requirements-prod.txt
Start command: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health check: /health
```

Set all secrets only in Render's Environment page—never in Git or the mobile app:

```text
DATABASE_URL                 Render PostgreSQL connection string
JWT_SECRET                   long random secret
RATE_LIMIT_SALT              separate long random secret
CLOUDINARY_CLOUD_NAME        optional, needed for consented cloud image storage
CLOUDINARY_API_KEY           optional, needed for consented cloud image storage
CLOUDINARY_API_SECRET        optional, needed for consented cloud image storage
TERMII_API_KEY               required only for live SMS delivery
TERMII_BASE_URL              required only for live SMS delivery
TERMII_SENDER_ID             approved sender ID for live SMS delivery
CORS_ALLOWED_ORIGINS         exact allowed browser origin(s), comma-separated
ALLOWED_HOSTS                Render API hostname
MAMABOT_API_KEY              required for MamaBot responses
VAXAI_API_KEY                required for VaxAI responses
CONSULTATION_DEMO_MODE       set true only for the clearly labelled presentation fallback
```

Use `https://your-service.onrender.com` as the mobile API URL. A native Android app does not need CORS, but any deployed browser frontend must be added to `CORS_ALLOWED_ORIGINS` exactly.

## Presentation OTP mode

This mode is deliberately restricted. It accepts only three pre-authorised Nigerian phone numbers, so arbitrary users cannot sign in as a parent or community health worker during the demo.

On Render, set these values and redeploy:

```text
ENVIRONMENT=demo
OTP_DELIVERY_MODE=demo
DEMO_AUTH_ENABLED=true

DEMO_ALLOWED_PHONE_1=2348012345678
DEMO_OTP_CODE_1=123456
DEMO_ALLOWED_PHONE_2=2348012345679
DEMO_OTP_CODE_2=234567
DEMO_ALLOWED_PHONE_3=2348012345680
DEMO_OTP_CODE_3=345678

DEMO_HEALTH_WORKER_PHONE=2348012345678
CONSULTATION_DEMO_MODE=true
```

Replace the sample values. Each phone must be `234` followed by ten digits: no `+`, spaces, or leading zero. Use a different six-digit code for each phone.

The number in `DEMO_HEALTH_WORKER_PHONE` must exactly match one of the three allowed numbers. That phone receives the Community Care interface after OTP verification; the other two remain parent accounts. Selecting a role in the app never grants that permission on its own.

When live SMS is ready, restore:

```text
ENVIRONMENT=production
OTP_DELIVERY_MODE=termii
DEMO_AUTH_ENABLED=false
DEMO_HEALTH_WORKER_PHONE=
CONSULTATION_DEMO_MODE=false
```

## Build the Android app

Requirements: Node.js LTS, Android Studio / Android SDK, and a configured Android device or emulator.

```powershell
cd mobile
Copy-Item .env.example .env
```

Set the deployed API in `mobile/.env`:

```text
EXPO_PUBLIC_API_BASE_URL=https://your-service.onrender.com
```

Install dependencies and check types:

```powershell
npm install
npm run typecheck
```

Only after native packages or native configuration change, regenerate Android:

```powershell
npx expo prebuild --clean --platform android
```

Build and install a release build on a USB-connected Android device:

```powershell
npx expo run:android --variant release
```

The standalone APK is written to:

```text
mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Run the backend locally

Requirements: Python 3.11 and a PostgreSQL database.

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Set a valid local `DATABASE_URL` and any services you want to exercise in `backend/.env`, then run migrations and start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The local API is available at `http://127.0.0.1:8000`; interactive API documentation is at `/docs`.

## Security and privacy notes

- OTPs and refresh tokens are stored as hashes; access tokens are short-lived and refresh tokens rotate.
- Mobile credentials use SecureStore rather than plain AsyncStorage.
- A parent can access only their own babies, screenings, and history.
- Community health worker privileges are assigned server-side, never by a client-side role selection.
- Uploaded images are checked by byte content, size-limited, re-encoded, and cleaned up on processing failure.
- Training-image storage is disabled by default. It requires explicit consent and a configured storage provider.
- Do not log phone numbers, OTP codes, tokens, baby images, or Cloudinary credentials.

## Quick verification checklist

1. `/health` returns a successful response after the Render deployment.
2. A pre-authorised demo phone completes OTP verification.
3. Switching welcome languages produces one narration at a time; moving forward stops narration.
4. **Find care nearby** produces location-based or manual State/LGA results and opens map directions.
5. The designated demo community-health-worker phone sees Community Care after sign-in.
6. `npm run typecheck` and `python -m compileall -q app` succeed before submitting changes.
