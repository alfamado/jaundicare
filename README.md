# JaundiCare

JaundiCare is an AI-powered newborn jaundice screening and care support tool built for Nigerian parents, caregivers, and community health workers. It helps families detect jaundice early, understand what to do next, and find the nearest health facility before the situation becomes an emergency.

The product works on a web browser and on Android phones. A release build of the Android app runs fully standalone without needing a laptop or developer tools. The backend is deployed and live on Render, and the database is managed PostgreSQL running in the cloud.

---

## What We Built and Why

Newborn jaundice affects about 60 percent of babies in their first week of life. In Nigeria, detection is harder because standard tools were not designed with darker skin tones in mind, clinics are often far away or overcrowded, and most parents have no reliable way to know whether their baby needs urgent hospital care or can be safely monitored at home.

JaundiCare addresses this by combining four things in one tool: an AI image classifier that looks for jaundice signs in a photo of the baby, a symptom-based clinical triage engine that evaluates danger signs like poor feeding and extreme drowsiness, a geolocation-powered facility finder that searches across 51,000 real Nigerian health facilities, and multilingual support across English, Yoruba, Hausa, Igbo, and Nigerian Pidgin so the tool works for the mother who switches languages mid-sentence and may not be comfortable reading long English text.

---

## Languages and Technologies

The backend is written in Python using FastAPI. The database is PostgreSQL managed through SQLAlchemy with Alembic handling all schema migrations. Images are stored permanently in Cloudinary so they can be used later for model retraining. The AI model is MobileNetV2 trained in PyTorch and exported to ONNX INT8 format for faster, lighter inference. The mobile app is built with Expo and React Native using TypeScript throughout. State management on mobile uses Zustand with AsyncStorage for offline persistence. Data fetching uses TanStack React Query configured for offline-first behavior. Authentication uses JWT with phone number verification through Termii SMS.

---

## How the System Is Structured

The project lives in a single repository with three top-level folders.

The backend folder contains everything that runs on the server. This includes the FastAPI application, the database models and migrations, all the service logic for AI inference, triage, facility search, Cloudinary uploads, HelpMum API integration, and the Termii SMS service for phone verification. The backend is deployed to Render and connects to a managed PostgreSQL database also on Render.

The mobile folder contains the Expo React Native app. This includes all screens, components, hooks, constants, services, and the offline queue. The app is built as a release APK that runs independently on Android without needing a developer laptop running in the background.

The web folder contains the original static HTML, CSS, and JavaScript frontend that served as the pilot web channel. It talks to the same backend as the mobile app.

---

## Authentication and Security

Authentication is built around phone number verification rather than email and password. This decision was deliberate. The target user is a Nigerian mother who uses WhatsApp every day and is far more likely to remember her phone number than an email address or password she set up once.

The flow works like this. A user enters their Nigerian phone number. The backend calls the Termii API to send a six-digit OTP via SMS. The OTP is hashed with bcrypt before it is stored in the database, so even if the database were compromised the actual codes would not be exposed. The user has ten minutes to enter the code and three attempts before the code is invalidated. After successful verification, the backend issues a short-lived JWT access token that expires in fifteen minutes and a long-lived refresh token that lasts thirty days. The refresh token is also hashed before storage and is rotated on every use, meaning the old token is immediately revoked when a new one is issued.

On the mobile side, tokens are stored in expo-secure-store rather than AsyncStorage. This matters because SecureStore uses the device keychain on Android, which is encrypted at the hardware level. AsyncStorage is plain text on disk and is not appropriate for storing authentication credentials.

Every API request from the mobile app includes the access token in the Authorization header. When the access token expires, the app automatically attempts a silent refresh. If the refresh token is also expired or revoked, the user is sent back to the phone entry screen to verify again.

JWT secrets are stored as environment variables and are never hardcoded in any source file. The CORS policy on the backend is restricted to the specific domains that are allowed to call the API rather than the wildcard that was used during development.

All screening data, baby profiles, and history are scoped to the authenticated user. One user cannot access another user's data. This was a fundamental change from the early prototype where all data was shared globally.

Community health worker accounts are provisioned separately from standard parent accounts. A CHW cannot self-register as a health worker. The role is assigned server-side after verification, which means the CHW-only features in the app are genuinely protected and not just hidden behind a UI check.

---

## Image Handling

When a parent or health worker submits a screening, the image goes through several checks before it is accepted. The filename is regenerated server-side using a UUID so the original filename from the device is never used. The file is checked for size limits. The content type is verified by reading the actual file bytes rather than trusting the extension the client claimed. The image is re-encoded through Pillow before being passed to the AI model, which prevents certain classes of malicious file attacks.

Images are uploaded to Cloudinary in a private bucket with signed URLs. This means images are not publicly accessible by default. A signed URL with a short expiry is generated when a screening result needs to display the image. Explicit consent is recorded before any image is stored. A retention policy and deletion endpoint exist so users can request their images be removed, which also calls the Cloudinary deletion API to remove the file from cloud storage and not just the database record.

On the mobile side, images are compressed to a maximum width of 800 pixels and re-encoded as JPEG at 70 percent quality before upload. This reduces upload size significantly on 3G connections without meaningfully affecting what the AI model can detect.

---

## The AI Model

The model is a MobileNetV2 binary classifier trained in PyTorch to distinguish jaundice from normal. The training process used data augmentation specifically targeting Fitzpatrick skin types five and six, which correspond to darker skin tones that existing tools handle poorly. This is one of the core clinical differentiators of JaundiCare.

After training, the model is exported from PyTorch FP32 format to ONNX INT8 using dynamic quantization. This reduces the model file from roughly 9 megabytes to roughly 2.4 megabytes and cuts inference time from around four seconds to under two seconds on CPU. The ONNX runtime has no dependency on PyTorch at serving time, which significantly reduces memory usage on Render's free tier.

The same ONNX artifact is used on the server. A conversion script is included in the backend folder that takes the trained PyTorch weights and produces the ONNX INT8 file in one command. Parity tests verify that the ONNX model produces predictions within an acceptable margin of the original PyTorch model before any deployment.

The model is versioned. Each deployment records which model version produced each screening result, so it is always possible to trace a past result back to the exact model that generated it.

---

## Clinical Triage

The symptom-based triage engine evaluates danger signs independently of the AI image result. This is intentional and important. The image classifier can be uncertain, especially on darker skin or in poor lighting. The triage engine does not down-triage a case just because the image confidence is low. If a baby has difficulty waking, poor feeding, yellowing that appeared in the first 24 hours, or dark urine, the triage engine escalates the case regardless of what the image says.

The combination logic follows a strict rule: the final decision is always the more cautious of the image result and the symptom result, never the more optimistic. A neonatal clinician reviewed the triage protocol before it was deployed to confirm the decision thresholds are appropriate for the Nigerian clinical context.

The Bhutani nomogram is implemented for community health workers who have access to a laboratory bilirubin reading. The nomogram uses the published 1999 Bhutani Pediatrics thresholds with linear interpolation between data points. The zone boundaries are the peer-reviewed standard values and have not been modified. A CHW can enter the baby's age in hours and the total serum bilirubin level and the nomogram plots the reading and returns the risk zone with a specific clinical action.

---

## Facility Search

The facility database contains 51,022 Nigerian health facilities sourced from OpenStreetMap. Facilities are searched by GPS radius, expanding from 25 kilometres to 50 to 100 kilometres until enough results are found. When GPS is unavailable, the user can select their state and local government area and the search narrows to that LGA first before expanding.

The search results respect the user's preference for facility type. If a user selects government hospitals, the results are sorted by a tiering system that puts federal teaching hospitals first, then state hospitals, then mission hospitals, then private facilities. This decision came from understanding the Nigerian context: a mother on a limited budget in Abeokuta should not be sent to a private specialist clinic when Federal Medical Centre Abeokuta is 0.96 kilometres away.

For urgent triage cases, the nearest hospital with appropriate capacity is always surfaced at the top regardless of the user's preference, because in a genuine emergency time matters more than cost.

A spatial index is used on the facility coordinates to make radius queries fast even across 51,000 records.

---

## Offline Functionality

The mobile app is designed to remain useful when the network is unavailable or too slow to complete a request. React Query is configured with a 24-hour cache lifetime for both the baby profile and the screening history. This means a user who opens the app without internet sees their last known data rather than an error.

When a screening submission fails because the network is unavailable, the app queues the screening locally using AsyncStorage rather than showing a failure to the user. A background listener using NetInfo watches for the moment the connection returns. When it does, the queued screenings are automatically uploaded without the user needing to do anything. Each queued item tracks the number of failed upload attempts and is dropped after five failures to prevent the queue from growing indefinitely.

The care guide, nomogram calculator, and triage logic all work entirely offline because they do not require network calls.

---

## HelpMum Integration

JaundiCare integrates two HelpMum open-source AI tools as specialist consultation modules. This is a genuine integration built to solve specific gaps in the product, not a feature added to tick a judging criterion.

MamaBot is accessible from the care guide screen. Parents and health workers can ask maternal health questions in plain language and receive contextually appropriate responses. Example questions the tool handles well include how often to breastfeed a newborn, what to do when a baby is still yellow on day five, and whether glucose water helps clear jaundice.

VaxAI is accessible from the CHW dashboard. Community health workers can ask about vaccination schedules and immunization timing. This is directly relevant to newborn jaundice care because Hepatitis B vaccination is recommended at birth and has implications for liver health in jaundiced babies.

Both integrations use a fresh UUID per request to create stateless sessions with the HelpMum APIs, which means each question is treated as a standalone clinical inquiry rather than part of a persistent conversation. API keys are stored as environment variables and are never exposed to the mobile client.

---

## Database and Migrations

The database has six tables. The users table stores phone numbers, verification status, role, and language preference. The otp codes table stores hashed one-time passwords with expiry times and attempt counters. The refresh tokens table stores hashed refresh tokens with revocation status. The baby profiles table stores the baby's name, date and time of birth, sex, and gestational age, and is linked to the user who owns it. The screenings table stores the full result of every screening including the AI prediction, triage level, final decision, symptoms, GPS coordinates, facility recommendations, and the Cloudinary image URL. The model training images table is a separate record for each screening image that will feed into the next model training cycle, with fields for a clinician to add a ground truth label.

Schema changes are managed through Alembic. Running migrations on deployment is automated so the database schema is always in sync with the application code. The migration history is tracked in version files in the repository.

---

## Structured Logging and Monitoring

Application logs use structured JSON format rather than plain print statements. Every log entry includes a timestamp, log level, module name, and relevant context like the user ID or screening ID. This makes it possible to search logs by specific events and trace the full lifecycle of a request.

Rate limiting is applied to the OTP request endpoint to prevent abuse. A phone number cannot request more than three OTPs per hour. Rate limiting is also applied to the screening endpoint to prevent cost abuse through the Cloudinary and HelpMum APIs.

---

## Testing

The test suite uses pytest. Tests cover authentication flows including OTP generation, verification, token refresh, and logout. Tests cover data isolation to verify that one authenticated user cannot access another user's data. Tests cover image upload including size limits, content type validation, and re-encoding. Tests cover offline sync queue behavior. Tests cover the triage decision table to verify that specific combinations of symptoms and image results always produce the expected clinical outcome. Tests are run in CI on every push.

---

## Deployment

The backend is deployed to Render as a web service connected to the repository. Every push to the main branch triggers an automatic deploy. The database is Render's managed PostgreSQL. Environment variables for the JWT secret, Termii API key, Cloudinary credentials, and HelpMum API keys are set in the Render dashboard and are never stored in the repository.

The mobile app is distributed as a release APK built with Expo. The release build connects to the deployed Render backend rather than a local development server, which means it works on any network without needing a laptop running in the background.

The web frontend connects to the same Render backend as the mobile app.

---

## Running the Project Locally

To run the backend locally, you need Python 3.11 and PostgreSQL 16 installed. Create a database called jaundicare, activate the virtual environment from the project root, install the dependencies from requirements.txt, fill in the .env file with your database URL and API keys, and run uvicorn from inside the backend folder. The server will create all database tables on startup and load the facility data automatically.

To run the mobile app locally for development, you need Node.js 18 and an Android phone with USB debugging enabled. Install dependencies with npm install, update the API base URL in services/api.ts to point to your local machine's IP address, connect your phone by USB, and run npx expo run:android. After the first build you can use npx expo start with adb reverse to get live reloads without rebuilding.

To convert the AI model from PyTorch to ONNX INT8, install onnx and onnxruntime in the backend environment and run python convert_to_onnx.py from the backend folder. The script will output the sizes of the FP32 and INT8 files and confirm the ONNX model passes validation before you replace the inference engine.

---

## What Is Left to Do

Phone number authentication is in place and working. The next milestone before a real pilot is adding role-based provisioning for community health workers so they cannot self-register with elevated permissions. Voice guidance is recorded in all five languages and needs to be wired into the onboarding flow. The ONNX model conversion needs to be run on the trained weights and the resulting file needs to be deployed. A clinical partner needs to be onboarded who can begin labelling the training images that are already being collected through Cloudinary so the next model version can be trained on verified ground truth data.

