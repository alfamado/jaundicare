# JaundiCare

JaundiCare is a mobile-first newborn jaundice screening, triage, education, and referral support application for parents, caregivers, and community health workers in Nigeria.

It is designed for lower-end Android phones and unreliable networks. The experience uses short, direct language and recorded guidance in English, Yoruba, Hausa, Igbo, and Nigerian Pidgin.

> **Clinical safety:** JaundiCare provides decision support and education. It does not diagnose a child or replace a qualified health professional. Urgent symptoms must be assessed at an appropriate health facility.

## What is included

- Phone-number sign-in using one-time passcodes.
- Live SMS verification through the approved sender ID.
- Parent profiles, baby profiles, screening history, and symptom-based risk triage.
- On-device ONNX inference for Android and server-side PyTorch inference.
- Image validation, consented image storage, and private signed image access.
- Nearby-facility discovery using GPS or a manual State/LGA fallback.
- Nearest, government, and clinic/private facility preferences, capability tags, telephone links, and map directions.
- Recorded onboarding audio and interface translations in five languages.
- JaundiCare Care Guide and Immunisation Guide, powered by the reusable ClinixTech Assist Core.
- Offline-friendly caching and queued screening submission.

## Repository layout

```text
backend/        FastAPI API, database migrations, triage, AI, facilities, and integrations
mobile/         Expo / React Native Android application
web/            React/Vite public website and authenticated browser companion
render.yaml     Render blueprint for the API (using an externally supplied database)
```

## Install the Android APK

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
the project before a test session, and plan a paid/managed database before clinical
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
TERMII_SENDER_ID             approved sender ID: OE Alert
CORS_ALLOWED_ORIGINS         exact allowed browser origin(s), comma-separated
ALLOWED_HOSTS                Render API hostname
CLINIX_ASSIST_PROVIDER        retrieval (safe fallback) or cloudflare (hosted Meta Llama)
CLOUDFLARE_ACCOUNT_ID         required only when CLINIX_ASSIST_PROVIDER=cloudflare
CLOUDFLARE_AI_API_TOKEN       private Workers AI token; Render only
CLOUDFLARE_LLAMA_MODEL        @cf/meta/llama-3.1-8b-instruct-fp8 by default
CLINIX_ASSIST_TIMEOUT_SECONDS hosted inference timeout; 25 by default
```

Use `https://your-service.onrender.com` as the mobile API URL. A native Android app does not need CORS, but any deployed browser frontend must be added to `CORS_ALLOWED_ORIGINS` exactly.

## ClinixTech Assist Core

JaundiCare is the first client of **ClinixTech Assist Core**: a stateless,
source-bounded health-information layer designed to be reused by future
ClinixTech products without making an external chatbot the product boundary.

```text
Mobile app / web client
        -> JaundiCare API on Render
        -> danger-sign rules + JaundiCare knowledge pack
        -> hosted Meta Llama provider (optional)
```

The client never receives the provider credential. Render receives one request
at a time, applies danger-sign rules before model inference, sends only the
minimised current question plus retrieved source material to the configured
provider, and does not store the question or reply. Before an external model
call, the service removes common phone numbers, emails and direct self-reported
names. Clients must still ask users not to type names, phone numbers, hospital
record numbers or other identifiers. A `session_id` is client-generated
correlation only; it is not server-side conversation memory.

The model is additionally bypassed for recognised newborn danger signs and
attempts to override its instructions. These rule sets are deliberately
conservative and must gain clinician-reviewed Yoruba, Hausa and Igbo trigger
terms before they are described as fully multilingual safety automation.

Current first-party routes require the user's normal JaundiCare access token:

```text
POST /v1/assistants/newborn-care/respond
POST /v1/assistants/immunisation-ng/respond
```

They return a response, a conservative action (`urgent`, `same_day`, or
`information`), source citations, content version, and an operational provider
label. These routes are for JaundiCare's signed-in users, not external clients.

### Future ClinixTech partner API

The repository also contains the separately authenticated partner route:

```text
POST /v1/partner/assistants/{assistant}/respond
Header: X-Clinix-API-Key: cxt_live_…
```

It is disabled by default with `CLINIX_PARTNER_API_ENABLED=false`. When it is
deliberately enabled, a project key is checked against its own scopes and
allowed assistants, and receives a separate per-project quota. It cannot be
used as a JaundiCare parent/CHW credential. The only initial assistant names
are `newborn-care` and `immunisation-ng`.

Create a project and display one new key exactly once from a secure
administrator environment:

```powershell
cd backend
python scripts/create_clinix_api_key.py --name "Example clinic" --slug example-clinic --assistants newborn-care,immunisation-ng
```

For rotation, create a replacement, update and verify the partner's server,
then revoke the old prefix:

```powershell
python scripts/revoke_clinix_api_key.py --prefix cxt_live_ab12cd34ef56
```

Use a server-to-server request; never expose a `cxt_live_…` secret in an Expo
app, Vite site, browser request, or Git repository:

```bash
curl -X POST "https://your-service.onrender.com/v1/partner/assistants/newborn-care/respond" \
  -H "Content-Type: application/json" \
  -H "X-Clinix-API-Key: cxt_live_..." \
  -d '{"message":"My baby is yellow and not feeding well","language":"en","session_id":"client_generated_id"}'
```

Before external launch, complete a clinical-content review, API-key rotation
and revocation workflow, an acceptable-use policy, consent terms for clients,
and monitoring/incident response. Do not market this route as diagnosis or
emergency care.

### Enable hosted Meta Llama on Render

The default `CLINIX_ASSIST_PROVIDER=retrieval` is a deployed, source-backed
fallback. It works without an LLM and is useful if a provider is unavailable,
but it is deliberately limited to the small source-backed content pack.

To enable hosted inference, create a Cloudflare Workers AI account and an API
token with only the permissions Cloudflare currently requires for Workers AI
inference, then set these **only in Render**:

```text
CLINIX_ASSIST_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_AI_API_TOKEN=your_private_workers_ai_token
CLOUDFLARE_LLAMA_MODEL=@cf/meta/llama-3.1-8b-instruct-fp8
CLINIX_ASSIST_TIMEOUT_SECONDS=25
```

Do not add any of these values to Expo, Vercel, `.env` files committed to Git,
or a browser-facing `VITE_` variable. The local Ollama configuration in
`backend/.env.example` is only for development and prompt evaluation; neither
Render nor a user's phone needs to run the model file.

Enabling a hosted provider means the minimised current question is processed by
that provider. Before clinical deployment, review the provider's current data
handling terms, choose the appropriate account controls, and record that
decision in ClinixTech's privacy documentation.

The initial knowledge cards cite WHO newborn-feeding, newborn-care, and
Nigeria immunisation sources. Their `clinical_review_required` status is
intentional: expand or change any medical content only through a documented
clinical review and content-versioning process.

## Live SMS and community-worker accounts

Set these values in Render and redeploy the API:

```text
ENVIRONMENT=production
TERMII_API_KEY=your_private_key
TERMII_BASE_URL=your_account_specific_base_url
TERMII_SENDER_ID=OE Alert
```

Use the exact account-specific base URL from the Termii dashboard. New public
sign-ins always create a parent account. This prevents a caller from assigning
themselves a clinical role.

To provision a community-health-worker account, let that person complete one
live SMS sign-in first, then run this in the Supabase SQL editor with their
normalised phone number (`234` followed by ten digits):

```sql
UPDATE users
SET role = 'health_worker'
WHERE phone_number = '2348012345678';
```

They should sign out and sign in again afterwards. Build a permissioned
administrator workflow before allowing anyone other than a trusted operator to
run this change.

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
facilities and directions, history, care guidance, and the Care and
Immunisation Guides. A
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

Set `VITE_PARENT_COMPANY_NAME` in Vercel only after you have the exact legal
parent-company name. It is shown in the footer as “A product of …”. The footer
also contains JaundiCare's business address: Adenekan Street, Alakuko,
Ifako-Ijaye, Lagos, Nigeria.

Verify the production bundle before deployment:

```powershell
npm run build
```

### Deploy the website to Vercel

1. Create a Vercel project from this repository and set **Root Directory** to
   `web`.
2. Use build command `npm run build` and output directory `dist`.
3. Add `VITE_API_BASE_URL=https://your-service.onrender.com` in Vercel's
   Environment Variables, then redeploy. Add the optional public download,
   contact, and verified `VITE_PARENT_COMPANY_NAME` values only when ready.
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
- GPS is used transiently to rank nearby facilities. Completed screenings retain the
  confirmed State/LGA and coordinates rounded to two decimal places (about 1 km),
  not a precise location trail. Planning reports must use aggregated, de-identified
  data with small-number suppression.
- Do not log phone numbers, OTP codes, tokens, baby images, or Cloudinary credentials.

## Quick verification checklist

1. `/health` returns a successful response after the Render deployment.
2. A real phone receives and completes an OTP sent from `OE Alert`.
3. Switching welcome languages produces one narration at a time; moving forward stops narration.
4. **Find care nearby** produces location-based or manual State/LGA results and opens map directions.
5. A deliberately provisioned community-health-worker account sees Community Care after sign-in.
6. `npm run typecheck` and `python -m compileall -q app` succeed before submitting changes.
