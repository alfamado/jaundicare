import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  API_BASE_URL,
  clearSession,
  getSession,
  request,
  requestOtp,
  signOut,
  verifyOtp,
} from "./api";
import { assessBhutaniZone } from "./bhutani";
import { clearQueuedScreenings, getQueuedScreeningCount, offlineQueueSupported, queueScreening, syncQueuedScreenings } from "./offlineQueue";
import { evaluateOfflineSafety } from "./offlineTriage";
import { playWelcomeAudio, stopWelcomeAudio } from "./welcomeAudio";

const languages = [
  ["en", "English"],
  ["yo", "Yorùbá"],
  ["ha", "Hausa"],
  ["ig", "Igbo"],
  ["pcm", "Pidgin"],
];

const symptomFields = [
  ["yellow_eyes", "Yellowing in the whites of the eyes"],
  ["yellow_gums", "Yellow gums"],
  ["yellow_palms_or_soles", "Yellow palms or soles"],
  ["jaundice_first_24h", "Yellowing started within the first 24 hours"],
  ["jaundice_spreading", "Yellowing is spreading or becoming stronger"],
  ["difficult_to_wake", "Baby is difficult to wake"],
  ["floppy_or_unusually_drowsy", "Baby is unusually sleepy or floppy"],
  ["dark_urine", "Dark urine"],
  ["pale_stool", "Pale or chalk-coloured stool"],
];

function usePath() {
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return [path, navigate];
}

function useTranslations(language) {
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    let active = true;
    fetch(`/i18n/${language}.json`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => active && setTranslations(data))
      .catch(() => active && setTranslations({}));
    return () => {
      active = false;
    };
  }, [language]);

  return (key, fallback) => translations[key] || fallback || key;
}

function formatNigerianPhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function newChatId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function App() {
  const [path, navigate] = usePath();
  const [language, setLanguage] = useState(() => localStorage.getItem("jc_web_language") || "en");
  const t = useTranslations(language);

  useEffect(() => {
    localStorage.setItem("jc_web_language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => stopWelcomeAudio, []);

  const changeLanguage = (nextLanguage) => {
    stopWelcomeAudio();
    setLanguage(nextLanguage);
  };

  const page = path === "/privacy" || path === "/terms" || path === "/app" ? path : "/";

  return (
    <div className="site-shell">
      <SiteHeader language={language} onLanguageChange={changeLanguage} navigate={navigate} page={page} />
      {page === "/" && <Landing navigate={navigate} t={t} language={language} />}
      {page === "/app" && <WebPortal language={language} t={t} navigate={navigate} />}
      {page === "/privacy" && <LegalPage type="privacy" navigate={navigate} />}
      {page === "/terms" && <LegalPage type="terms" navigate={navigate} />}
      <SiteFooter navigate={navigate} />
    </div>
  );
}

function SiteHeader({ language, onLanguageChange, navigate, page }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/")} aria-label="JaundiCare home">
        <span className="brand-mark" aria-hidden="true">J</span>
        <span>
          <strong>JaundiCare</strong>
          <small>Newborn care support</small>
        </span>
      </button>
      <nav className="site-nav" aria-label="Main navigation">
        <button onClick={() => navigate("/")}>How it works</button>
        <button onClick={() => navigate("/privacy")}>Privacy</button>
        <button className={page === "/app" ? "nav-active" : ""} onClick={() => navigate("/app")}>Open web app</button>
      </nav>
      <div className="header-actions">
        <label className="language-select">
          <span className="sr-only">Choose language</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
            {languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="button button-small" onClick={() => navigate("/app")}>Get started</button>
      </div>
    </header>
  );
}

function Landing({ navigate, t, language }) {
  const downloadUrl = import.meta.env.VITE_ANDROID_DOWNLOAD_URL;
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Newborn jaundice support for Nigerian families</p>
          <h1>{t("dashboard.hero_title", "Check early. Act early. Stay calm.")}</h1>
          <p className="hero-text">{t("dashboard.hero_text", "JaundiCare helps parents notice possible newborn jaundice early, understand warning signs, and know when to seek care.")}</p>
          <div className="hero-actions">
            <button className="button" onClick={() => navigate("/app")}>Open web app</button>
            {downloadUrl ? (
              <a className="button button-secondary" href={downloadUrl}>Get Android app</a>
            ) : (
              <button className="button button-secondary" onClick={() => navigate("/app")}>Start a baby check</button>
            )}
          </div>
          <p className="hero-note">Available in English, Yorùbá, Hausa, Igbo and Nigerian Pidgin.</p>
          <WelcomeAudioButton language={language} />
        </div>
        <div className="hero-visual" aria-label="Simple illustration of parent support">
          <div className="signal-card signal-top"><span>1</span> Notice changes early</div>
          <div className="parent-card">
            <div className="sun" />
            <div className="parent-figure"><span className="head" /><span className="body" /></div>
            <div className="baby-figure"><span className="baby-head" /><span className="baby-body" /></div>
            <p>Small steps. Clear next action.</p>
          </div>
          <div className="signal-card signal-bottom"><span>2</span> Get the right next step</div>
        </div>
      </section>

      <section className="safety-banner" aria-label="Clinical safety information">
        <span className="safety-icon">!</span>
        <p><strong>Important:</strong> JaundiCare is a screening and care-support tool. It does not diagnose jaundice or replace a clinician, bilirubin test, or urgent medical care.</p>
      </section>

      <section className="section-wrap">
        <p className="eyebrow">Made for busy caregivers</p>
        <h2>Support that is clear before fear takes over.</h2>
        <div className="feature-grid">
          <Feature number="01" title="Screen with guidance" text="Use a baby photo together with practical questions about feeding, alertness and warning signs." />
          <Feature number="02" title="See the next action" text="The app presents urgent, same-day or monitoring guidance in plain language." />
          <Feature number="03" title="Find appropriate care" text="Use location or a manual State/LGA choice to find facilities and their services." />
          <Feature number="04" title="Keep learning" text="Simple, multilingual newborn-care information is available when a parent needs it." />
        </div>
      </section>

      <section className="two-column-section">
        <article className="path-card parent-path">
          <p className="eyebrow">For parents and caregivers</p>
          <h2>One concern. One clear next step.</h2>
          <ul>
            <li>Save a baby profile once.</li>
            <li>Use guided screening when worried.</li>
            <li>Keep the screening history for follow-up.</li>
          </ul>
          <button className="text-button" onClick={() => navigate("/app")}>Open parent support <span>→</span></button>
        </article>
        <article className="path-card worker-path">
          <p className="eyebrow">For community care teams</p>
          <h2>Support families closer to home.</h2>
          <ul>
            <li>Use structured newborn risk questions.</li>
            <li>Document follow-up conversations clearly.</li>
            <li>Escalate urgent signs without delay.</li>
          </ul>
          <p className="muted">Community accounts are provisioned by the care programme.</p>
        </article>
      </section>

      <section className="section-wrap language-section">
        <div>
          <p className="eyebrow">Language should not be a barrier</p>
          <h2>Care guidance in words families use every day.</h2>
        </div>
        <div className="language-pills">
          {languages.map(([, label]) => <span key={label}>{label}</span>)}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Start with what matters now</p>
          <h2>Worried about a newborn? Begin a guided check.</h2>
        </div>
        <button className="button button-light" onClick={() => navigate("/app")}>Open JaundiCare</button>
      </section>
    </main>
  );
}

function Feature({ number, title, text }) {
  return <article className="feature-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></article>;
}

function WelcomeAudioButton({ language }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const play = async () => {
    setError("");
    try {
      setPlaying(true);
      await playWelcomeAudio(language);
    } catch {
      setError("Audio could not start. Please tap Listen again.");
    } finally {
      setPlaying(false);
    }
  };

  return <div className="audio-guide"><button className="text-button audio-button" type="button" onClick={play}>{playing ? "Starting audio…" : "▶ Listen to welcome guidance"}</button>{error && <small>{error}</small>}</div>;
}

function WebPortal({ language, t, navigate }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getSession().accessToken));

  useEffect(() => {
    let active = true;
    if (!getSession().accessToken) {
      setChecking(false);
      return undefined;
    }
    request("/auth/me")
      .then((data) => active && setUser(data))
      .catch(() => {
        clearSession();
        active && setUser(null);
      })
      .finally(() => active && setChecking(false));
    return () => { active = false; };
  }, []);

  if (checking) return <main className="portal-shell"><LoadingCard label="Securing your session…" /></main>;
  if (!user) return <main className="portal-shell"><AuthCard language={language} onVerified={setUser} navigate={navigate} /></main>;
  return <AuthenticatedApp user={user} setUser={setUser} language={language} t={t} />;
}

function AuthCard({ language, onVerified, navigate }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("parent");
  const normalisedPhone = formatNigerianPhone(phone);
  const allowDemoRoleSelection = import.meta.env.VITE_DEMO_AUTH_ENABLED === "true";

  const sendCode = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^234\d{10}$/.test(normalisedPhone)) {
      setError("Enter a Nigerian mobile number, for example 08012345678.");
      return;
    }
    setBusy(true);
    try {
      const result = await requestOtp({ phoneNumber: normalisedPhone, language, role });
      setNotice(result.message || "Verification code sent.");
      setStep("code");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit verification code.");
      return;
    }
    setBusy(true);
    try {
      const account = await verifyOtp({ phoneNumber: normalisedPhone, code });
      onVerified(account);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Secure web access</p>
        <h1>Your newborn support, when you need it.</h1>
        <p>Sign in with your phone number. Your records remain private to your account.</p>
        <button className="text-button inverse" onClick={() => navigate("/")}>← Back to information page</button>
      </div>
      <form className="auth-card" onSubmit={step === "phone" ? sendCode : confirmCode}>
        <p className="eyebrow">{step === "phone" ? "Step 1 of 2" : "Step 2 of 2"}</p>
        <h2>{step === "phone" ? "Enter your phone number" : "Enter your verification code"}</h2>
        <p>{step === "phone" ? "We will send a one-time code to continue." : `We sent a code to ${phone}.`}</p>
        {step === "phone" ? (
          <><label className="form-field"><span>Phone number</span><input autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0801 234 5678" /></label>{allowDemoRoleSelection && <label className="form-field"><span>Demo workspace</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="parent">Parent support</option><option value="health_worker">Community care</option></select><small>This choice is available only for approved demonstration phones.</small></label>}</>
        ) : (
          <label className="form-field"><span>Six-digit code</span><input autoFocus autoComplete="one-time-code" inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="123456" /></label>
        )}
        {notice && <p className="notice success">{notice}</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        <button className="button full-width" type="submit" disabled={busy}>{busy ? "Please wait…" : step === "phone" ? "Send verification code" : "Continue securely"}</button>
        {step === "code" && <button className="text-button" type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>Use a different number</button>}
        <p className="form-footnote">By continuing, you agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Notice</a>.</p>
      </form>
    </section>
  );
}

function AuthenticatedApp({ user, setUser, language, t }) {
  const isHealthWorker = user.role === "health_worker";
  const [tab, setTab] = useState(isHealthWorker ? "community" : "home");
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(() => navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [syncNotice, setSyncNotice] = useState("");
  const syncingRef = useRef(false);

  const loadAccountData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requests = isHealthWorker
        ? [Promise.resolve(null), request("/screening/history")]
        : [request("/profile/baby"), request("/screening/history")];
      const [nextProfile, nextHistory] = await Promise.all(requests);
      setProfile(nextProfile?.exists ? nextProfile : null);
      setHistory(Array.isArray(nextHistory) ? nextHistory : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [isHealthWorker]);

  const refreshQueueCount = useCallback(async () => {
    try {
      setQueueCount(await getQueuedScreeningCount(user.user_id));
    } catch {
      setQueueCount(0);
    }
  }, [user.user_id]);

  const submitQueuedScreening = useCallback(async ({ image, fields, language: queuedLanguage }) => {
    await request("/screening/analyze", { method: "POST", body: buildScreeningFormData(image, fields, queuedLanguage) });
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current || !offlineQueueSupported()) return;
    syncingRef.current = true;
    try {
      const outcome = await syncQueuedScreenings({ ownerId: user.user_id, submit: submitQueuedScreening });
      if (outcome.synced) {
        setSyncNotice(`${outcome.synced} queued screening${outcome.synced === 1 ? "" : "s"} sent securely.`);
        await loadAccountData();
      }
      if (outcome.failed) setSyncNotice("Some queued screenings could not be sent yet. Keep this browser open and try again when the connection is stable.");
    } finally {
      syncingRef.current = false;
      await refreshQueueCount();
    }
  }, [loadAccountData, refreshQueueCount, submitQueuedScreening, user.user_id]);

  useEffect(() => {
    void loadAccountData();
    void refreshQueueCount();
  }, [loadAccountData, refreshQueueCount]);

  useEffect(() => {
    const markOnline = () => {
      setOnline(true);
      void syncOfflineQueue();
    };
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    if (navigator.onLine) void syncOfflineQueue();
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, [syncOfflineQueue]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const navigation = isHealthWorker
    ? [["community", "Community care"], ["screen", "Assisted screen"], ["analytics", "My activity"], ["bhutani", "Bilirubin reference"]]
    : [["home", "Home"], ["profile", "Baby profile"], ["screen", "Screening"], ["history", "History"], ["guide", "Care guide"]];

  const completeScreening = (result) => {
    setHistory((current) => [result, ...current]);
  };

  return (
    <main className="portal-shell">
      <section className="app-topbar">
        <div><p className="eyebrow">{isHealthWorker ? "Community care workspace" : "Private care workspace"}</p><h1>{isHealthWorker ? "Newborn care support" : profile?.baby_name ? `${profile.baby_name}'s care` : "Your newborn care"}</h1></div>
        <div className="account-actions"><span>{isHealthWorker ? "Community health worker" : "Parent account"}</span><button className="text-button" onClick={handleSignOut}>Sign out</button></div>
      </section>
      <section className={`connection-status ${online ? "connection-online" : "connection-offline"}`}><span>{online ? "Online" : "Offline"}</span>{queueCount > 0 && <><span>•</span><strong>{queueCount} screening{queueCount === 1 ? "" : "s"} queued securely on this browser</strong>{online && <button className="text-button" onClick={() => void syncOfflineQueue()}>Sync now</button>}</>}{queueCount > 0 && <button className="text-button" onClick={() => void clearQueuedScreenings(user.user_id).then(refreshQueueCount)}>Remove queued items</button>}</section>
      {syncNotice && <p className="notice success">{syncNotice}</p>}
      <nav className="app-tabs" aria-label="Web app navigation">
        {navigation.map(([value, label]) => <button className={tab === value ? "tab-active" : ""} onClick={() => setTab(value)} key={value}>{label}</button>)}
      </nav>
      {error && <p className="notice error">{error}</p>}
      {loading ? <LoadingCard label="Loading your care information…" /> : (
        <div className="app-content">
          {!isHealthWorker && tab === "home" && <AppHome profile={profile} history={history} setTab={setTab} />}
          {!isHealthWorker && tab === "profile" && <ProfileEditor profile={profile} onSaved={(value) => { setProfile(value); setTab("screen"); }} />}
          {tab === "screen" && <ScreeningForm profile={isHealthWorker ? null : profile} language={language} ownerId={user.user_id} communityMode={isHealthWorker} onQueued={refreshQueueCount} onCompleted={completeScreening} />}
          {!isHealthWorker && tab === "history" && <HistoryList items={history} />}
          {!isHealthWorker && tab === "guide" && <CareGuide />}
          {isHealthWorker && tab === "community" && <CommunityCare history={history} queueCount={queueCount} setTab={setTab} />}
          {isHealthWorker && tab === "analytics" && <CommunityAnalytics history={history} />}
          {isHealthWorker && tab === "bhutani" && <BhutaniReference />}
        </div>
      )}
      <AssistantHub t={t} />
    </main>
  );
}

function AppHome({ profile, history, setTab }) {
  const latest = history[0];
  return <>
    <section className="home-grid">
      <article className="app-panel welcome-panel"><p className="eyebrow">Next useful action</p><h2>{profile ? "Start a guided check when you are worried." : "Save a baby profile before the first check."}</h2><p>{profile ? "The profile helps calculate age for safer triage guidance." : "Date and time of birth help the app give more useful, age-aware guidance."}</p><button className="button" onClick={() => setTab(profile ? "screen" : "profile")}>{profile ? "Start screening" : "Create baby profile"}</button></article>
      <article className="app-panel result-panel"><p className="eyebrow">Latest screening</p><h2>{latest ? decisionLabel(latest.final_decision) : "No screening yet"}</h2><p>{latest ? latest.parent_message : "Use the guided screening when you notice yellowing, poor feeding or unusual sleepiness."}</p></article>
    </section>
    <section className="care-reminder"><strong>Go urgently now</strong> if a baby is very difficult to wake, floppy, feeding very poorly, has pale stool, or you are seriously worried. Do not wait for an online screening.</section>
  </>;
}

function ProfileEditor({ profile, onSaved }) {
  const [form, setForm] = useState({
    baby_name: profile?.baby_name || "",
    parent_name: profile?.parent_name || "",
    date_of_birth: profile?.date_of_birth || "",
    time_of_birth: profile?.time_of_birth || "",
    sex: profile?.sex || "",
    gestational_age_weeks: profile?.gestational_age_weeks || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const data = await request("/profile/baby", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, gestational_age_weeks: form.gestational_age_weeks ? Number(form.gestational_age_weeks) : null, parent_name: form.parent_name || null, sex: form.sex || null }) });
      onSaved(data);
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };

  return <section className="form-panel"><div><p className="eyebrow">Baby profile</p><h2>Save details once</h2><p>JaundiCare uses the date and time of birth to make screening guidance safer.</p></div><form className="form-grid" onSubmit={submit}>
    <Field label="Baby's name *"><input required value={form.baby_name} onChange={(event) => setForm({ ...form, baby_name: event.target.value })} /></Field>
    <Field label="Parent or caregiver name"><input value={form.parent_name} onChange={(event) => setForm({ ...form, parent_name: event.target.value })} /></Field>
    <Field label="Date of birth *"><input required type="date" value={form.date_of_birth} onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })} /></Field>
    <Field label="Time of birth *"><input required type="time" value={form.time_of_birth} onChange={(event) => setForm({ ...form, time_of_birth: event.target.value })} /></Field>
    <Field label="Sex"><select value={form.sex} onChange={(event) => setForm({ ...form, sex: event.target.value })}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></select></Field>
    <Field label="Gestational age in weeks"><input min="20" max="45" type="number" value={form.gestational_age_weeks} onChange={(event) => setForm({ ...form, gestational_age_weeks: event.target.value })} placeholder="e.g. 38" /></Field>
    {error && <p className="notice error form-wide">{error}</p>}<button className="button form-wide" disabled={busy}>{busy ? "Saving…" : "Save baby profile"}</button>
  </form></section>;
}

function buildScreeningFormData(image, fields, language) {
  const payload = new FormData();
  payload.append("image", image);
  payload.append("feeding", fields.feeding);
  payload.append("ui_language", language);
  payload.append("allow_training_use", "false");
  if (fields.age_hours !== undefined && fields.age_hours !== null && fields.age_hours !== "") payload.append("age_hours", String(fields.age_hours));
  ["user_state", "user_lga", "user_latitude", "user_longitude", "facility_preference"].forEach((key) => {
    if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") payload.append(key, String(fields[key]));
  });
  ["darker_skin_tone", ...symptomFields.map(([key]) => key)].forEach((key) => payload.append(key, String(Boolean(fields[key]))));
  return payload;
}

function ScreeningForm({ profile, language, ownerId, communityMode, onQueued, onCompleted }) {
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ feeding: "good", age_hours: "", user_state: "", user_lga: "", darker_skin_tone: false, facility_preference: "nearest" });
  const [symptoms, setSymptoms] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const location = () => navigator.geolocation?.getCurrentPosition(
    (position) => setForm((current) => ({ ...current, user_latitude: position.coords.latitude, user_longitude: position.coords.longitude })),
    () => setError("We could not get your location. You can continue by entering your State or LGA."),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
  );

  const createFields = () => ({
    ...form,
    age_hours: form.age_hours === "" ? null : Number(form.age_hours),
    ...symptoms,
  });

  const queueOfflineScreening = async (fields) => {
    const queueId = await queueScreening({ ownerId, image, fields, language });
    const safetyResult = evaluateOfflineSafety(fields);
    const offlineResult = {
      ...safetyResult,
      screening_id: `queued-${queueId}`,
      created_at: new Date().toISOString(),
      recommended_facilities: [],
      pending_sync: true,
    };
    setResult(offlineResult);
    await onQueued();
    onCompleted(offlineResult);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!image) { setError("Add a clear baby photo before continuing."); return; }
    setBusy(true); setError("");
    const fields = createFields();
    if (!navigator.onLine) {
      try {
        await queueOfflineScreening(fields);
      } catch (queueError) {
        setError(queueError.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      const data = await request("/screening/analyze", { method: "POST", body: buildScreeningFormData(image, fields, language) });
      setResult(data); onCompleted(data);
    } catch (requestError) {
      // A real API response means the server rejected the request; never hide
      // that behind an offline result. Queue only when the browser itself is offline.
      if (!navigator.onLine) {
        try {
          await queueOfflineScreening(fields);
        } catch (queueError) {
          setError(queueError.message);
        }
      } else {
        setError(requestError.message);
      }
    } finally { setBusy(false); }
  };

  return <section className="form-panel"><div><p className="eyebrow">{communityMode ? "Assisted community screening" : "Guided screening"}</p><h2>{communityMode ? "Document the newborn signs you observe." : "Check what you can see and how your baby is doing."}</h2><p>Use natural light. A result is support for a care decision, not a diagnosis.</p></div><form onSubmit={submit} className="screen-form">
    <Field label="Baby photo *"><input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /><small>Use a clear photo of the face and eyes. It is never stored for training from this browser. When offline, it is encrypted on this browser until it can be sent.</small></Field>
    {!profile && <Field label="Baby age in hours (optional)"><input type="number" min="0" value={form.age_hours} onChange={(event) => setForm({ ...form, age_hours: event.target.value })} placeholder="e.g. 72" /></Field>}
    <Field label="How is the baby feeding?"><div className="choice-row">{[["good", "Feeding well"], ["poor", "Feeding poorly"]].map(([value, label]) => <label key={value}><input type="radio" name="feeding" checked={form.feeding === value} onChange={() => setForm({ ...form, feeding: value })} /> {label}</label>)}</div></Field>
    <div className="location-row"><Field label="State (optional)"><input value={form.user_state} onChange={(event) => setForm({ ...form, user_state: event.target.value })} placeholder="e.g. Ogun" /></Field><Field label="LGA (optional)"><input value={form.user_lga} onChange={(event) => setForm({ ...form, user_lga: event.target.value })} placeholder="e.g. Abeokuta South" /></Field><Field label="Facility preference"><select value={form.facility_preference} onChange={(event) => setForm({ ...form, facility_preference: event.target.value })}><option value="nearest">Nearest suitable care</option><option value="government">Government facility</option><option value="clinic">Private clinic</option></select></Field><button className="button button-secondary location-button" type="button" onClick={location}>Use location</button></div>
    <fieldset className="symptom-set"><legend>Signs to check</legend>{symptomFields.map(([key, label]) => <label className="check-row" key={key}><input type="checkbox" checked={Boolean(symptoms[key])} onChange={(event) => setSymptoms({ ...symptoms, [key]: event.target.checked })} /><span>{label}</span></label>)}</fieldset>
    {error && <p className="notice error">{error}</p>}<button className="button full-width" disabled={busy}>{busy ? "Analysing safely…" : "Review screening"}</button>
  </form>{result && <ScreeningResult result={result} />}</section>;
}

function ScreeningResult({ result }) {
  const facilities = result.recommended_facilities || [];
  return <section className={`screen-result ${decisionTone(result.final_decision)}`}><p className="eyebrow">Recommended next step</p><h2>{decisionLabel(result.final_decision)}</h2><p className="result-message">{result.parent_message}</p>{result.pending_sync && <p className="offline-result-note"><strong>Queued for secure review.</strong> This offline guidance is based on reported signs only. Keep the browser open and reconnect so the photo can be analysed.</p>}{result.notes?.length > 0 && <ul>{result.notes.map((note) => <li key={note}>{note}</li>)}</ul>}{facilities.length > 0 && <div className="facility-list"><h3>Places that may be able to help</h3>{facilities.map((facility) => <article className="facility-card" key={facility.id}><div><strong>{facility.name}</strong><p>{facility.address || [facility.lga, facility.state].filter(Boolean).join(", ")}</p><small>{facility.services?.join(" · ")}</small></div>{facility.latitude && facility.longitude && <a href={`https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Directions</a>}</article>)}</div>}</section>;
}

function HistoryList({ items }) {
  if (!items.length) return <section className="empty-panel"><h2>No screening history yet</h2><p>Your completed screening results will appear here for follow-up.</p></section>;
  return <section className="history-list"><div><p className="eyebrow">Private screening history</p><h2>Previous checks</h2></div>{items.map((item) => <article className="history-card" key={item.screening_id}><span className={`status-dot ${decisionTone(item.final_decision)}`} /><div><strong>{decisionLabel(item.final_decision)}</strong>{item.pending_sync && <span className="pending-pill">Awaiting photo review</span>}<p>{item.parent_message}</p><small>{new Date(item.created_at).toLocaleString()}</small></div></article>)}</section>;
}

function CareGuide() {
  const sections = {
    warning: { title: "Warning signs", intro: "Seek urgent medical care if you notice any of these signs.", items: [["Baby is very hard to wake", "A baby who cannot be woken for feeds or is limp needs urgent assessment."], ["Yellowing in the first 24 hours", "Any yellowing in the first day needs hospital assessment today."], ["Dark urine or pale stool", "Dark urine or very pale stool can point to a serious problem and needs urgent review."]] },
    feeding: { title: "Feeding support", intro: "Frequent effective feeding helps newborns clear bilirubin.", items: [["Feed 8 to 12 times in 24 hours", "Offer breastfeeds often. Wake a sleepy baby for feeds."], ["Do not give water", "Water does not treat jaundice and can reduce milk intake."], ["Ask for latch support", "A midwife or nurse can help if feeds are painful, short, or ineffective."]] },
    myths: { title: "Common myths", intro: "Simple facts can prevent harmful delays.", items: [["Do not use direct sunlight as treatment", "Sunlight is not a controlled substitute for prescribed phototherapy and can burn or dehydrate a newborn."], ["Avoid herbs or herbal baths", "They have not been shown to lower bilirubin and may harm a newborn."], ["Check eyes and gums on darker skin", "Yellowing can be harder to see on the skin. Check eyes, gums, palms and soles too."]] },
  };
  const [active, setActive] = useState("warning");
  const [open, setOpen] = useState(null);
  const section = sections[active];
  return <section className="guide-panel"><div><p className="eyebrow">Care guide</p><h2>Short guidance for the moments that matter.</h2></div><div className="guide-tabs">{Object.entries(sections).map(([key, value]) => <button className={key === active ? "guide-tab-active" : ""} onClick={() => { setActive(key); setOpen(null); }} key={key}>{value.title}</button>)}</div><p className="guide-intro">{section.intro}</p>{section.items.map(([title, body], index) => <article className="guide-item" key={title}><button onClick={() => setOpen(open === index ? null : index)}><strong>{title}</strong><span>{open === index ? "−" : "+"}</span></button>{open === index && <p>{body}</p>}</article>)}</section>;
}

function CommunityCare({ history, queueCount, setTab }) {
  const urgent = history.filter((item) => item.final_decision?.includes("URGENT")).length;
  const sameDay = history.filter((item) => item.final_decision?.includes("SAME_DAY") || item.final_decision?.includes("RECHECK")).length;
  return <section className="community-panel"><div className="community-hero"><div><p className="eyebrow">Community care workflow</p><h2>One guided conversation. One safe next step.</h2><p>Use this workspace for assisted checks. It stores only screenings created by this community account; it does not reveal another parent’s private records.</p></div><button className="button" onClick={() => setTab("screen")}>Start assisted screening</button></div><div className="metric-grid"><Metric label="Checks recorded" value={history.length} tone="monitor" /><Metric label="Urgent outcomes" value={urgent} tone="urgent" /><Metric label="Same-day outcomes" value={sameDay} tone="same-day" /><Metric label="Queued offline" value={queueCount} tone="monitor" /></div><section className="care-reminder"><strong>For every urgent result:</strong> explain the next action simply, support the caregiver to reach an appropriate facility, and do not wait for an assistant response.</section>{history.length > 0 && <HistoryList items={history.slice(0, 5)} />}</section>;
}

function Metric({ label, value, tone }) {
  return <article className={`metric-card ${tone}`}><strong>{value}</strong><span>{label}</span></article>;
}

function CommunityAnalytics({ history }) {
  const summary = useMemo(() => {
    const counts = { urgent: 0, sameDay: 0, monitor: 0 };
    history.forEach((item) => {
      if (item.final_decision?.includes("URGENT")) counts.urgent += 1;
      else if (item.final_decision?.includes("SAME_DAY") || item.final_decision?.includes("RECHECK")) counts.sameDay += 1;
      else counts.monitor += 1;
    });
    return counts;
  }, [history]);
  const total = history.length;
  const rows = [["Urgent hospital review", summary.urgent, "urgent"], ["Same-day / recheck", summary.sameDay, "same-day"], ["Monitor closely", summary.monitor, "monitor"]];
  return <section className="analytics-panel"><div><p className="eyebrow">My activity</p><h2>Assisted screening summary</h2><p>This summary includes only screenings recorded by this signed-in community account. It is not a population health report.</p></div><div className="metric-grid"><Metric label="Total checks" value={total} tone="monitor" /><Metric label="Urgent" value={summary.urgent} tone="urgent" /><Metric label="Same-day" value={summary.sameDay} tone="same-day" /></div><section className="distribution-card"><h3>Outcome distribution</h3>{total === 0 ? <p>No assisted screenings have been recorded yet.</p> : rows.map(([label, count, tone]) => <div className="distribution-row" key={label}><span>{label}</span><div><i className={tone} style={{ width: `${(count / total) * 100}%` }} /></div><strong>{count}</strong></div>)}</section></section>;
}

function BhutaniReference() {
  const [ageHours, setAgeHours] = useState("");
  const [bilirubin, setBilirubin] = useState("");
  const result = assessBhutaniZone(ageHours, bilirubin);
  return <section className="bhutani-panel"><div><p className="eyebrow">Clinical reference</p><h2>Hour-specific bilirubin reference</h2><p>Use only when a measured total serum bilirubin value is available. This reference does not replace clinical judgement or treatment thresholds.</p></div><div className="form-grid compact-form"><Field label="Age in hours (12–120)"><input type="number" min="0" max="8760" value={ageHours} onChange={(event) => setAgeHours(event.target.value)} placeholder="e.g. 48" /></Field><Field label="Total bilirubin (mg/dL)"><input type="number" min="0" step="0.1" value={bilirubin} onChange={(event) => setBilirubin(event.target.value)} placeholder="e.g. 12.4" /></Field></div>{result && <article className={`bhutani-result ${result.tone}`}><p className="eyebrow">Reference zone</p><h3>{result.zone}</h3><p>{result.action}</p>{result.thresholds && <small>At {ageHours} hours: 40th {result.thresholds.p40} · 75th {result.thresholds.p75} · 95th {result.thresholds.p95} mg/dL.</small>}</article>}<p className="clinical-note">Reference: Bhutani et al., Pediatrics (1999), hour-specific bilirubin percentile curves for healthy term and near-term newborns.</p></section>;
}

function AssistantHub({ t }) {
  const [open, setOpen] = useState(false);
  const [assistant, setAssistant] = useState("mamabot");
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({ mamabot: [], vaxai: [] });
  const [busy, setBusy] = useState(false);
  const chatIds = useRef({ mamabot: newChatId(), vaxai: newChatId() });
  const labels = { mamabot: "MamaBot", vaxai: "VaxAI" };
  const suggestions = assistant === "vaxai" ? ["What vaccines are due for a baby at birth in Nigeria?", "When should my baby receive the next vaccines?"] : ["How often should I breastfeed my newborn?", "My baby is sleepy during feeds. What should I do?"];

  const sendQuestion = async (value) => {
    const text = value.trim();
    if (!text || busy) return;
    setMessage("");
    setChats((current) => ({ ...current, [assistant]: [...current[assistant], { role: "user", text }] }));
    setBusy(true);
    try {
      const data = await request(`/consult/${assistant}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, chat_id: chatIds.current[assistant] }) });
      setChats((current) => ({ ...current, [assistant]: [...current[assistant], { role: "assistant", text: data.response || "I could not read that response. Please try again." }] }));
    } catch (requestError) {
      setChats((current) => ({ ...current, [assistant]: [...current[assistant], { role: "assistant", text: requestError.message } ] }));
    } finally {
      setBusy(false);
    }
  };

  return <aside className={`chat-widget ${open ? "chat-open" : ""}`}><button className="chat-toggle" onClick={() => setOpen(!open)}>{open ? "Close assistants" : "Ask an assistant"}</button>{open && <div className="chat-body"><div className="assistant-tabs"><button className={assistant === "mamabot" ? "assistant-active" : ""} onClick={() => setAssistant("mamabot")}>MamaBot</button><button className={assistant === "vaxai" ? "assistant-active" : ""} onClick={() => setAssistant("vaxai")}>VaxAI</button></div><p><strong>{labels[assistant]}</strong><br />{assistant === "mamabot" ? "Newborn-care education support." : "Childhood vaccination education support."}</p><div className="suggestion-row">{suggestions.map((suggestion) => <button disabled={busy} key={suggestion} onClick={() => void sendQuestion(suggestion)}>{suggestion}</button>)}</div><div className="chat-messages" aria-live="polite">{chats[assistant].length === 0 && <span>Choose a suggested question or type your own below.</span>}{chats[assistant].map((item, index) => <p className={item.role} key={`${item.role}-${index}`}>{item.text}</p>)}{busy && <span>Thinking…</span>}</div><form onSubmit={(event) => { event.preventDefault(); void sendQuestion(message); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your question" disabled={busy} /><button aria-label="Send question" disabled={busy}>↑</button></form><small>{t("trust.title", "This is a screening support tool.")}</small></div>}</aside>;
}

function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function LoadingCard({ label }) { return <section className="loading-card"><span className="spinner" />{label}</section>; }
function decisionTone(value) { return value?.includes("URGENT") ? "urgent" : value?.includes("SAME_DAY") || value?.includes("RECHECK") ? "same-day" : "monitor"; }
function decisionLabel(value) { return ({ URGENT_HOSPITAL_REVIEW: "Seek urgent hospital care", SAME_DAY_CLINIC_REVIEW: "Arrange same-day assessment", RECHECK_SOON_OR_CLINIC_IF_CONCERNED: "Arrange same-day assessment", HOME_MONITORING: "Monitor closely at home" })[value] || "Review screening guidance"; }

function LegalPage({ type, navigate }) {
  const isPrivacy = type === "privacy";
  return <main className="legal-page"><p className="eyebrow">JaundiCare legal information</p><h1>{isPrivacy ? "Privacy Notice" : "Terms of Use"}</h1><p className="legal-updated">Last updated: 17 August 2026</p>{isPrivacy ? <><h2>What this notice covers</h2><p>JaundiCare processes the minimum account, baby-profile, screening and care-support information required to provide its services. It is a newborn-care support tool, not an emergency service or replacement for a clinician.</p><h2>How information is used</h2><p>Phone numbers are used for account verification. Baby profile and screening records are linked to the signed-in account so a caregiver can follow up. Screening images are processed to provide a result. Training-image storage is disabled by default and requires separate, explicit consent.</p><h2>Keeping information safe</h2><p>The browser communicates with the API over HTTPS. The web app keeps session tokens only for the active browser session. Never share verification codes or account access with another person.</p><h2>Your choices</h2><p>You can ask to delete your account and associated records in the app. Do not upload an image unless you are authorised to make that decision for the baby.</p></> : <><h2>Using JaundiCare safely</h2><p>Use JaundiCare only for newborn-care education, screening support and referral guidance. It does not make a medical diagnosis. Seek urgent medical care immediately for a very sleepy or floppy baby, poor feeding, seizures, breathing difficulty, fever, pale stool, or any serious concern.</p><h2>Your responsibility</h2><p>Provide accurate information and protect your phone and verification code. Do not use another person’s account or rely on a result to delay necessary clinical care.</p><h2>Service availability</h2><p>Some functions require internet access, including secure sign-in, live facility information and AI assistants. Service availability cannot be guaranteed during network or provider outages.</p></>}<button className="button" onClick={() => navigate("/")}>Back to JaundiCare</button></main>;
}

function SiteFooter({ navigate }) {
  const contact = import.meta.env.VITE_CONTACT_EMAIL;
  return <footer className="site-footer"><div><button className="brand footer-brand" onClick={() => navigate("/")}><span className="brand-mark">J</span><span><strong>JaundiCare</strong><small>Newborn care support</small></span></button><p>Clear support for parents. Faster action for newborn care.</p></div><div className="footer-links"><button onClick={() => navigate("/privacy")}>Privacy Notice</button><button onClick={() => navigate("/terms")}>Terms of Use</button>{contact && <a href={`mailto:${contact}`}>Contact</a>}</div><small>© {new Date().getFullYear()} JaundiCare. Screening support, not medical diagnosis.</small></footer>;
}

export default App;
