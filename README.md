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
web/            React/Vite public website and authenticated browser companion
render.yaml     Render blueprint for the API (using an externally supplied database)
```

## Fast demo: use the built Android APK

The verified release APK is at:

[`mobile/android/app/build/outputs/apk/release/app-release.apk`](mobile/android/app/build/outputs/apk/release/app-release.apk)

1. Deploy the current `backend/` source to Render first. The APK contains the updated app screens, but facilities, sign-in, roles, and chat depend on the deployed API.
2. Copy the APK to the Android phone and install it. If Android reports a signature conflict, uninstall the older JaundiCare app first, then install this one.
3. Open the app. English narration starts once on the welcome screen. Switching languages stops the previous narration before the next one starts.
4. On the dashboard, choose **Find care nearby**, allow location access, then try **Government** to see facilities with services such as bilirubin testing and phototherapy. If GPS is unavailable, select State and LGA manually.

## Supabase database + Render API deployment

JaundiCare keeps the FastAPI service on Render and uses Supabase only as its
managed PostgreSQL database. The mobile app continues to call the same Render
API URL, so it does **not** need a rebuild for this database migration.

1. Create a Supabase project in a region near your users.
2. In the Supabase dashboard choose **Connect** and copy the **Session pooler**
   URI (port `5432`). This is the appropriate connection for Render and other
   IPv4-only persistent app servers. Do not use the direct URI on the Supabase
   Free plan: it is IPv6-only.
3. Append `?sslmode=require` if Supabase did not include it, then set that
   complete URI as `DATABASE_URL` in Render's Environment page.
4. Set `DB_POOL_SIZE=3` and `DB_MAX_OVERFLOW=2` in Render.
5. Deploy the backend. Its existing start command runs `alembic upgrade head`
   before starting the API, which creates the schema in the new database.
6. Visit `/health`, then sign in and create one baby profile to verify the
   migration. A newly created Supabase database starts empty; old Render data
   can only be copied if its database is still accessible for export.

The Supabase Free plan is suitable for the MVP, but it has a 500 MB database
limit and pauses inactive projects after one week. Use an uptime check or open
the project before a demo, and plan a paid/managed database before clinical
production.

The root [`render.yaml`](render.yaml) and [`backend/render.yaml`](backend/render.yaml)
now expect an externally supplied `DATABASE_URL`; neither provisions a Render
PostgreSQL instance.

### Render deployment

Use the repository root [`render.yaml`](render.yaml), or configure the service manually:

```text
Root directory: backend
Build command: pip install -r requirements-prod.txt
Start command: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health check: /health
```

Set all secrets only in Render's Environment page—never in Git or the mobile app:

```text
DATABASE_URL                 Supabase Session pooler connection string with sslmode=require
DB_POOL_SIZE                 3
DB_MAX_OVERFLOW              2
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
MAMABOT_API_KEY              required for live MamaBot responses
VAXAI_API_KEY                required for live VaxAI responses
MAMABOT_URL                  optional override for MamaBot endpoint
VAXAI_URL                    optional override for VaxAI endpoint
CONSULTATION_DEMO_MODE       keep false when using the live assistants
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

CONSULTATION_DEMO_MODE=false
```

Replace the sample values. Each phone must be `234` followed by ten digits: no `+`, spaces, or leading zero. Use a different six-digit code for each phone.

Each approved phone may rehearse either interface: choose Parent or Community Care during onboarding before requesting the code. That switch is accepted only while the restricted presentation OTP mode is active; normal live-SMS registration remains parent-only unless an administrator provisions a health-worker account.

When live SMS is ready, restore:

```text
ENVIRONMENT=production
OTP_DELIVERY_MODE=termii
DEMO_AUTH_ENABLED=false
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

## Run and deploy the website

The `web/` folder is a React/Vite site designed for a public domain. It provides
an easy-to-understand product page, privacy notice, terms of use, and a secure
browser companion at `/app`. The browser companion uses the same FastAPI API as
the mobile app and keeps authentication tokens only in the current browser
session. It includes the five recorded welcome narrations, parent screening,
facilities and directions, history, care guidance, MamaBot and VaxAI. A
provisioned community-health-worker account also receives assisted screening,
its own activity summary, and the bilirubin reference tool.

The original static prototype is preserved as
[`web/legacy-index.html`](web/legacy-index.html) for reference; it is not the
site that should be deployed.

For local development:

```powershell
cd web
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `web/.env` to the deployed FastAPI URL. Do not put
database URLs, provider API keys, SMS credentials, or private service keys in a
Vite environment file: any `VITE_` value is public in the built website.

The website caches only its public application shell and language/audio assets.
It never caches API responses or authenticated clinical data. When a signed-in
browser is genuinely offline, a screening image and form data can be queued in
that browser's IndexedDB with Web Crypto encryption, alongside conservative
symptom-only safety guidance. It will sync when the same signed-in account
reconnects. This is a continuity feature, not an alternative to the Android
offline implementation; users can remove queued items from the connection bar.

`VITE_DEMO_AUTH_ENABLED` must remain `false` in a public deployment. It merely
shows the demo role selector in the browser; the API remains responsible for
allowing it and must itself be in the restricted demo OTP mode. A normal browser
visitor can never self-assign a community-health-worker role.

Verify the production bundle before deployment:

```powershell
npm run build
```

### Deploy the website to Vercel

1. Create a Vercel project from this repository and set **Root Directory** to
   `web`.
2. Use build command `npm run build` and output directory `dist`.
3. Add `VITE_API_BASE_URL=https://your-service.onrender.com` in Vercel's
   Environment Variables, then redeploy. Add the optional public download and
   contact values only when they are ready.
4. Add your custom domain in Vercel and wait for HTTPS to be issued. The public
   routes will be `https://your-domain/`, `/privacy`, `/terms`, and `/app`.
5. In Render, set `CORS_ALLOWED_ORIGINS` to the exact browser origins, for
   example `https://your-domain,https://www.your-domain`; redeploy the API.
   Add the Vercel preview origin only if you deliberately need browser testing
   on it.

The website is useful evidence of a real product when requesting an SMS sender
ID, but the SMS provider remains responsible for approval. Keep the privacy,
terms, contact, and product information live on the custom domain before
resubmitting that request.

The community activity view is deliberately limited to screenings created by
that signed-in community account. Do not turn it into a cross-parent or
population dashboard until the backend has organisation, facility, assignment,
consent, and aggregation boundaries designed for that purpose.

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
