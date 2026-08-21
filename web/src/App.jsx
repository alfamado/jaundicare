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
import englishTranslations from "../i18n/en.json";
import yorubaTranslations from "../i18n/yo.json";
import hausaTranslations from "../i18n/ha.json";
import igboTranslations from "../i18n/ig.json";
import pidginTranslations from "../i18n/pcm.json";
import { uiTranslations } from "./uiTranslations";
import { legalContent } from "./legalContent";
import { landingContent } from "./landingContent";

const languages = [
  ["en", "English"],
  ["yo", "Yorùbá"],
  ["ha", "Hausa"],
  ["ig", "Igbo"],
  ["pcm", "Pidgin"],
];

const translationCatalog = {
  en: englishTranslations,
  yo: yorubaTranslations,
  ha: hausaTranslations,
  ig: igboTranslations,
  pcm: pidginTranslations,
};

const symptomFields = [
  ["yellow_eyes", "signs.yellow_eyes", "Yellowing in the whites of the eyes"],
  ["yellow_gums", "signs.yellow_gums", "Yellow gums"],
  ["yellow_palms_or_soles", "signs.yellow_palms", "Yellow palms or soles"],
  ["jaundice_first_24h", "signs.first24h", "Yellowing started within the first 24 hours"],
  ["jaundice_spreading", "signs.spreading", "Yellowing is spreading or becoming stronger"],
  ["difficult_to_wake", "signs.difficult_to_wake", "Baby is difficult to wake"],
  ["floppy_or_unusually_drowsy", "signs.floppy", "Baby is unusually sleepy or floppy"],
  ["dark_urine", "signs.dark_urine", "Dark urine"],
  ["pale_stool", "signs.pale_stool", "Pale or chalk-coloured stool"],
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
  const translations = {
    ...(translationCatalog[language] || translationCatalog.en),
    ...(uiTranslations[language] || uiTranslations.en),
  };

  const resolve = (dictionary, key) => {
    const direct = dictionary[key];
    if (typeof direct === "string") return direct;
    const nested = key.split(".").reduce(
      (value, segment) => value && typeof value === "object" ? value[segment] : undefined,
      dictionary,
    );
    return typeof nested === "string" ? nested : undefined;
  };

  return (key, fallback, values) => {
    const text = resolve(translations, key) || resolve({ ...translationCatalog.en, ...uiTranslations.en }, key) || fallback || key;
    return text.replace(/\{(\w+)\}/g, (_, name) => values?.[name] === undefined ? `{${name}}` : String(values[name]));
  };
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
    // Changing the language is a user gesture, so browsers allow us to start
    // the matching recorded narration here. A first page load cannot autoplay.
    void playWelcomeAudio(nextLanguage).catch(() => undefined);
  };

  const goToHowItWorks = () => {
    const scrollToGuide = () => {
      document.getElementById("how-it-works")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (path === "/") {
      scrollToGuide();
      return;
    }

    navigate("/");
    window.setTimeout(scrollToGuide, 50);
  };

  const page = path === "/privacy" || path === "/terms" || path === "/app" ? path : "/";

  return (
    <div className="site-shell">
      <SiteHeader language={language} onLanguageChange={changeLanguage} navigate={navigate} goToHowItWorks={goToHowItWorks} page={page} t={t} />
      {page === "/" && <Landing navigate={navigate} goToHowItWorks={goToHowItWorks} onLanguageChange={changeLanguage} t={t} language={language} />}
      {page === "/app" && <WebPortal language={language} t={t} navigate={navigate} />}
      {page === "/privacy" && <LegalPage type="privacy" navigate={navigate} t={t} language={language} />}
      {page === "/terms" && <LegalPage type="terms" navigate={navigate} t={t} language={language} />}
      <SiteFooter navigate={navigate} t={t} />
    </div>
  );
}

function SiteHeader({ language, onLanguageChange, navigate, goToHowItWorks, page, t }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/")} aria-label="JaundiCare home">
        <span className="brand-mark" aria-hidden="true">J</span>
        <span>
          <strong>JaundiCare</strong>
          <small>{t("app.support", "Newborn care support")}</small>
        </span>
      </button>
      <nav className="site-nav" aria-label="Main navigation">
        <button onClick={goToHowItWorks}>{t("dashboard.learn_jaundice", "How it works")}</button>
        <button onClick={() => navigate("/privacy")}>{t("ui.legal.privacy", "Privacy")}</button>
        <button className={page === "/app" ? "nav-active" : ""} onClick={() => navigate("/app")}>{t("dashboard.start_check", "Open web app")}</button>
      </nav>
      <div className="header-actions">
        <label className="language-select">
          <span className="sr-only">Choose language</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
            {languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="button button-small" onClick={() => navigate("/app")}>{t("dashboard.start_check", "Get started")}</button>
      </div>
    </header>
  );
}

function Landing({ navigate, goToHowItWorks, onLanguageChange, t, language }) {
  const downloadUrl = import.meta.env.VITE_ANDROID_DOWNLOAD_URL;
  const copy = landingContent[language] || landingContent.en;
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("dashboard.hero_tag", "Newborn jaundice support for Nigerian families")}</p>
          <h1>{t("dashboard.hero_title", "Check early. Act early. Stay calm.")}</h1>
          <p className="hero-text">{t("dashboard.hero_text", "JaundiCare helps parents notice possible newborn jaundice early, understand warning signs, and know when to seek care.")}</p>
          <div className="hero-actions">
            <button className="button" onClick={() => navigate("/app")}>{t("dashboard.start_check", "Open web app")}</button>
            {downloadUrl ? (
              <a className="button button-secondary" href={downloadUrl}>{copy.androidAction}</a>
            ) : (
              <button className="button button-secondary" onClick={goToHowItWorks}>{copy.howItWorksAction}</button>
            )}
          </div>
          <p className="hero-note">{t("ui.onboarding.choose_language", "Choose your language")}: English, Yorùbá, Hausa, Igbo, Pidgin.</p>
          <WelcomeAudioButton language={language} t={t} />
          <div className="hero-trust" aria-label={copy.trustLabel}>
            {copy.trustItems.map((item, index) => (
              <span key={item}><b>{index + 1}</b>{item}</span>
            ))}
          </div>
        </div>
        <div className="hero-visual" aria-label="Simple illustration of parent support">
          <div className="signal-card signal-top"><span>1</span> {copy.visualTop}</div>
          <div className="parent-card">
            <div className="sun" />
            <div className="parent-figure"><span className="head" /><span className="body" /></div>
            <div className="baby-figure"><span className="baby-head" /><span className="baby-body" /></div>
            <p>{copy.visualMiddle}</p>
          </div>
          <div className="signal-card signal-bottom"><span>2</span> {copy.visualBottom}</div>
        </div>
      </section>

      <section className="safety-banner" aria-label="Clinical safety information">
        <span className="safety-icon">!</span>
        <p><strong>{t("trust.title", "Important")}</strong> {t("ui.onboarding.safety", "JaundiCare is a screening and care-support tool. It does not diagnose jaundice or replace a clinician, bilirubin test, or urgent medical care.")}</p>
      </section>

      <section className="section-wrap" id="how-it-works">
        <p className="eyebrow">{copy.madeFor}</p>
        <h2>{copy.featureTitle}</h2>
        <div className="feature-grid">
          {copy.features.map(([title, text], index) => <Feature key={title} number={`0${index + 1}`} title={title} text={text} />)}
        </div>
      </section>

      <section className="two-column-section">
        <article className="path-card parent-path">
          <p className="eyebrow">{copy.parentEyebrow}</p>
          <h2>{copy.parentTitle}</h2>
          <ul>
            {copy.parentItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <button className="text-button" onClick={() => navigate("/app")}>{copy.parentAction} <span>→</span></button>
        </article>
        <article className="path-card worker-path">
          <p className="eyebrow">{copy.workerEyebrow}</p>
          <h2>{copy.workerTitle}</h2>
          <ul>
            {copy.workerItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="muted">{copy.workerNote}</p>
        </article>
      </section>

      <section className="section-wrap language-section">
        <div>
          <p className="eyebrow">{copy.languageEyebrow}</p>
          <h2>{copy.languageTitle}</h2>
        </div>
        <div className="language-pills">
          {languages.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={language === value ? "language-pill-active" : ""}
              aria-pressed={language === value}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">{copy.ctaEyebrow}</p>
          <h2>{copy.ctaTitle}</h2>
        </div>
        <button className="button button-light" onClick={() => navigate("/app")}>{copy.ctaAction}</button>
      </section>
    </main>
  );
}

function Feature({ number, title, text }) {
  return <article className="feature-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></article>;
}

function WelcomeAudioButton({ language, t }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const play = async () => {
    setError("");
    try {
      setPlaying(true);
      await playWelcomeAudio(language);
    } catch {
      setError(t("ui.onboarding.tap_audio", "Audio could not start. Please tap Listen again."));
    } finally {
      setPlaying(false);
    }
  };

  return <div className="audio-guide"><button className="text-button audio-button" type="button" onClick={play}>{playing ? t("voice.playing", "Starting audio…") : `▶ ${t("ui.onboarding.tap_audio", "Listen to welcome guidance")}`}</button>{error && <small>{error}</small>}</div>;
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
  if (!user) return <main className="portal-shell"><AuthCard language={language} t={t} onVerified={setUser} navigate={navigate} /></main>;
  return <AuthenticatedApp user={user} setUser={setUser} language={language} t={t} />;
}

function AuthCard({ language, t, onVerified, navigate }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const normalisedPhone = formatNigerianPhone(phone);

  const sendCode = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^234\d{10}$/.test(normalisedPhone)) {
      setError(t("ui.auth.invalid_phone", "Enter a Nigerian mobile number, for example 08012345678."));
      return;
    }
    setBusy(true);
    try {
      const result = await requestOtp({ phoneNumber: normalisedPhone, language });
      setNotice(result.message || t("ui.auth.send_code", "Verification code sent."));
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
      setError(t("ui.auth.enter_code", "Enter the six-digit verification code."));
      return;
    }
    setBusy(true);
    // Audio must begin inside this button gesture; browsers otherwise block
    // sound after the asynchronous OTP request resolves. Stop it on failure.
    void playWelcomeAudio(language).catch(() => undefined);
    try {
      const account = await verifyOtp({ phoneNumber: normalisedPhone, code });
      onVerified(account);
    } catch (requestError) {
      stopWelcomeAudio();
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">{t("topbar.support", "Secure web access")}</p>
        <h1>{t("ui.auth.welcome", "Your newborn support, when you need it.")}</h1>
        <p>{t("ui.auth.phone_privacy", "Sign in with your phone number. Your records remain private to your account.")}</p>
        <button className="text-button inverse" onClick={() => navigate("/")}>← {t("dashboard.learn_jaundice", "Back to information page")}</button>
      </div>
      <form className="auth-card" onSubmit={step === "phone" ? sendCode : confirmCode}>
        <p className="eyebrow">{step === "phone" ? "1 / 2" : "2 / 2"}</p>
        <h2>{step === "phone" ? t("ui.auth.phone_title", "Enter your phone number") : t("ui.auth.enter_code", "Enter your verification code")}</h2>
        <p>{step === "phone" ? t("ui.auth.phone_intro", "We will send a one-time code to continue.") : `${t("ui.auth.sent_code", "We sent a code to")} ${phone}.`}</p>
        {step === "phone" ? (
          <label className="form-field"><span>{t("ui.auth.phone_number", "Phone number")}</span><input autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0801 234 5678" /></label>
        ) : (
          <label className="form-field"><span>{t("ui.auth.enter_code", "Six-digit code")}</span><input autoFocus autoComplete="one-time-code" inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="123456" /></label>
        )}
        {notice && <p className="notice success">{notice}</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        <button className="button full-width" type="submit" disabled={busy}>{busy ? t("ui.auth.verifying", "Please wait…") : step === "phone" ? t("ui.auth.send_code", "Send verification code") : t("ui.onboarding.continue", "Continue securely")}</button>
        {step === "code" && <button className="text-button" type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>{t("ui.auth.resend", "Use a different number")}</button>}
        <p className="form-footnote">By continuing, you agree to the <a href="/terms">{t("ui.legal.terms", "Terms")}</a> and <a href="/privacy">{t("ui.legal.privacy", "Privacy Notice")}</a>.</p>
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
    ? [["community", t("nav.chw", "Community care")], ["screen", t("chw.actions.screening", "Assisted screen")], ["analytics", t("nav.analytics", "My activity")], ["bhutani", t("nav.nomogram", "Bilirubin reference")]]
    : [["home", t("nav.dashboard", "Home")], ["profile", t("nav.profile", "Baby profile")], ["screen", t("nav.screening", "Screening")], ["history", t("nav.history", "History")], ["guide", t("nav.care", "Care guide")]];

  const completeScreening = (result) => {
    setHistory((current) => [result, ...current]);
  };

  return (
    <main className="portal-shell">
      <section className="app-topbar">
        <div><p className="eyebrow">{isHealthWorker ? t("nav.chw", "Community care workspace") : t("topbar.support", "Private care workspace")}</p><h1>{isHealthWorker ? t("app.support", "Newborn care support") : profile?.baby_name ? `${profile.baby_name}'s care` : t("topbar.subtitle", "Your newborn care")}</h1></div>
        <div className="account-actions"><span>{isHealthWorker ? t("mode.health_worker", "Community health worker") : t("mode.parent", "Parent account")}</span><button className="text-button" onClick={handleSignOut}>Sign out</button></div>
      </section>
      <section className={`connection-status ${online ? "connection-online" : "connection-offline"}`}><span>{online ? "Online" : "Offline"}</span>{queueCount > 0 && <><span>•</span><strong>{queueCount} screening{queueCount === 1 ? "" : "s"} queued securely on this browser</strong>{online && <button className="text-button" onClick={() => void syncOfflineQueue()}>Sync now</button>}</>}{queueCount > 0 && <button className="text-button" onClick={() => void clearQueuedScreenings(user.user_id).then(refreshQueueCount)}>Remove queued items</button>}</section>
      {syncNotice && <p className="notice success">{syncNotice}</p>}
      <nav className="app-tabs" aria-label="Web app navigation">
        {navigation.map(([value, label]) => <button className={tab === value ? "tab-active" : ""} onClick={() => setTab(value)} key={value}>{label}</button>)}
      </nav>
      {error && <p className="notice error">{error}</p>}
      {loading ? <LoadingCard label="Loading your care information…" /> : (
        <div className="app-content">
          {!isHealthWorker && tab === "home" && <AppHome profile={profile} history={history} setTab={setTab} t={t} />}
          {!isHealthWorker && tab === "profile" && <ProfileEditor profile={profile} t={t} onSaved={(value) => { setProfile(value); setTab("screen"); }} />}
          {tab === "screen" && <ScreeningForm profile={isHealthWorker ? null : profile} language={language} t={t} ownerId={user.user_id} communityMode={isHealthWorker} onQueued={refreshQueueCount} onCompleted={completeScreening} />}
          {!isHealthWorker && tab === "history" && <HistoryList items={history} t={t} />}
          {!isHealthWorker && tab === "guide" && <CareGuide t={t} />}
          {isHealthWorker && tab === "community" && <CommunityCare history={history} queueCount={queueCount} setTab={setTab} t={t} />}
          {isHealthWorker && tab === "analytics" && <CommunityAnalytics history={history} t={t} />}
          {isHealthWorker && tab === "bhutani" && <BhutaniReference t={t} />}
        </div>
      )}
      <AssistantHub t={t} />
    </main>
  );
}

function AppHome({ profile, history, setTab, t }) {
  const latest = history[0];
  return <>
    <section className="home-grid">
      <article className="app-panel welcome-panel"><p className="eyebrow">{t("dashboard.start_check", "Next useful action")}</p><h2>{profile ? t("dashboard.start_check", "Start a guided check when you are worried.") : t("dashboard.no_profile", "Save a baby profile before the first check.")}</h2><p>{profile ? t("profile.text", "The profile helps calculate age for safer triage guidance.") : t("dashboard.create_profile_hint", "Date and time of birth help the app give more useful, age-aware guidance.")}</p><button className="button" onClick={() => setTab(profile ? "screen" : "profile")}>{profile ? t("dashboard.start_check", "Start screening") : t("profile.save", "Create baby profile")}</button></article>
      <article className="app-panel result-panel"><p className="eyebrow">{t("dashboard.latest_screening", "Latest screening")}</p><h2>{latest ? decisionLabel(latest.final_decision, t) : t("dashboard.no_screening", "No screening yet")}</h2><p>{latest ? latest.parent_message : t("dashboard.hero_text", "Use the guided screening when you notice yellowing, poor feeding or unusual sleepiness.")}</p></article>
    </section>
    <section className="care-reminder"><strong>Go urgently now</strong> if a baby is very difficult to wake, floppy, feeding very poorly, has pale stool, or you are seriously worried. Do not wait for an online screening.</section>
  </>;
}

function ProfileEditor({ profile, t, onSaved }) {
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

  return <section className="form-panel"><div><p className="eyebrow">{t("profile.title", "Baby profile")}</p><h2>{t("profile.title", "Save details once")}</h2><p>{t("profile.text", "JaundiCare uses the date and time of birth to make screening guidance safer.")}</p></div><form className="form-grid" onSubmit={submit}>
    <Field label={`${t("profile.baby_name", "Baby's name")} *`}><input required value={form.baby_name} onChange={(event) => setForm({ ...form, baby_name: event.target.value })} /></Field>
    <Field label={t("profile.parent_name", "Parent or caregiver name")}><input value={form.parent_name} onChange={(event) => setForm({ ...form, parent_name: event.target.value })} /></Field>
    <Field label={`${t("profile.date_of_birth", "Date of birth")} *`}><input required type="date" value={form.date_of_birth} onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })} /></Field>
    <Field label={`${t("profile.time_of_birth", "Time of birth")} *`}><input required type="time" value={form.time_of_birth} onChange={(event) => setForm({ ...form, time_of_birth: event.target.value })} /></Field>
    <Field label={t("profile.sex", "Sex")}><select value={form.sex} onChange={(event) => setForm({ ...form, sex: event.target.value })}><option value="">Prefer not to say</option><option value="male">{t("common.male", "Male")}</option><option value="female">{t("common.female", "Female")}</option></select></Field>
    <Field label={t("profile.gestational_age", "Gestational age in weeks")}><input min="20" max="45" type="number" value={form.gestational_age_weeks} onChange={(event) => setForm({ ...form, gestational_age_weeks: event.target.value })} placeholder="e.g. 38" /></Field>
    {error && <p className="notice error form-wide">{error}</p>}<button className="button form-wide" disabled={busy}>{busy ? "Saving…" : t("profile.save", "Save baby profile")}</button>
  </form></section>;
}

function buildScreeningFormData(image, fields, language) {
  const payload = new FormData();
  payload.append("image", image);
  payload.append("feeding", fields.feeding);
  payload.append("ui_language", language);
  payload.append("allow_training_use", String(Boolean(fields.allow_training_use)));
  if (fields.age_hours !== undefined && fields.age_hours !== null && fields.age_hours !== "") payload.append("age_hours", String(fields.age_hours));
  ["user_state", "user_lga", "user_latitude", "user_longitude", "facility_preference"].forEach((key) => {
    if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") payload.append(key, String(fields[key]));
  });
  ["darker_skin_tone", ...symptomFields.map(([key]) => key)].forEach((key) => payload.append(key, String(Boolean(fields[key]))));
  return payload;
}

function ScreeningForm({ profile, language, t, ownerId, communityMode, onQueued, onCompleted }) {
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ feeding: "good", age_hours: "", user_state: "", user_lga: "", darker_skin_tone: false, facility_preference: "nearest", allow_training_use: false });
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

  return <section className="form-panel"><div><p className="eyebrow">{communityMode ? t("chw.actions.screening", "Assisted community screening") : t("nav.screening", "Guided screening")}</p><h2>{communityMode ? t("chw.intro", "Document the newborn signs you observe.") : t("screening.title", "Check what you can see and how your baby is doing.")}</h2><p>{t("trust.body", "Use natural light. A result is support for a care decision, not a diagnosis.")}</p></div><form onSubmit={submit} className="screen-form">
    <Field label={`${t("screening.upload_image", "Baby photo")} *`}><input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /><small>{t("screening.image_helper", "Use a clear photo of the face and eyes. When offline, it is encrypted on this browser until it can be sent.")}</small></Field>
    {!profile && <Field label={`${t("screening.age_hours", "Baby age in hours")} (${t("common.select", "optional")})`}><input type="number" min="0" value={form.age_hours} onChange={(event) => setForm({ ...form, age_hours: event.target.value })} placeholder="e.g. 72" /></Field>}
    <Field label={t("screening.feeding", "How is the baby feeding?")}><div className="choice-row">{[["good", t("feeding.good", "Feeding well")], ["poor", t("feeding.poor", "Feeding poorly")]].map(([value, label]) => <label key={value}><input type="radio" name="feeding" checked={form.feeding === value} onChange={() => setForm({ ...form, feeding: value })} /> {label}</label>)}</div></Field>
    <div className="location-row"><Field label={`${t("screening.state", "State")} (${t("common.select", "optional")})`}><input value={form.user_state} onChange={(event) => setForm({ ...form, user_state: event.target.value })} placeholder={t("screening.state_placeholder", "e.g. Ogun")} /></Field><Field label="LGA (optional)"><input value={form.user_lga} onChange={(event) => setForm({ ...form, user_lga: event.target.value })} placeholder="e.g. Abeokuta South" /></Field><Field label="Facility preference"><select value={form.facility_preference} onChange={(event) => setForm({ ...form, facility_preference: event.target.value })}><option value="nearest">Nearest suitable care</option><option value="government">Government facility</option><option value="clinic">Private clinic</option></select></Field><button className="button button-secondary location-button" type="button" onClick={location}>{t("screening.use_location", "Use location")}</button></div>
    <fieldset className="symptom-set"><legend>{t("screening.signs", "Signs to check")}</legend>{symptomFields.map(([key, labelKey, fallback]) => <label className="check-row" key={key}><input type="checkbox" checked={Boolean(symptoms[key])} onChange={(event) => setSymptoms({ ...symptoms, [key]: event.target.checked })} /><span>{t(labelKey, fallback)}</span></label>)}</fieldset>
    <label className="consent-card"><span><strong>{t("web.consent.title", "Optional: help improve JaundiCare")}</strong><small>{t("web.consent.text", "If you choose yes, this photo may be placed in protected training storage to validate and improve the model. It is not needed for this result or care guidance. You can remove it later.")}</small></span><input type="checkbox" checked={form.allow_training_use} onChange={(event) => setForm({ ...form, allow_training_use: event.target.checked })} aria-label={t("web.consent.title", "Allow this photo to be used for model improvement")} /></label>
    {error && <p className="notice error">{error}</p>}<button className="button full-width" disabled={busy}>{busy ? "Analysing safely…" : t("screening.submit", "Review screening")}</button>
  </form>{result && <ScreeningResult result={result} t={t} />}</section>;
}

function nextStepsFor(decision, t) {
  if (decision?.includes("URGENT")) return [t("next.urgent.1"), t("next.urgent.2"), t("next.urgent.3")];
  if (decision?.includes("SAME_DAY")) return [t("next.same_day.1"), t("next.same_day.2"), t("next.same_day.3")];
  if (decision?.includes("RECHECK")) return [t("next.recheck.1"), t("next.recheck.2"), t("next.recheck.3")];
  return [t("next.monitor.1"), t("next.monitor.2"), t("next.monitor.3")];
}

function ScreeningResult({ result, t }) {
  const facilities = result.recommended_facilities || [];
  const tone = decisionTone(result.final_decision);
  const needsCareToday = tone === "urgent" || tone === "same-day";
  const title = tone === "urgent" ? t("web.result.urgent_heading", "Please seek care now") : tone === "same-day" ? t("web.result.same_day_heading", "Please arrange care today") : t("web.result.monitor_heading", "Keep monitoring closely");
  const primaryFacility = facilities.find((facility) => facility.latitude != null && facility.longitude != null);
  return <section className={`screen-result ${tone}`}><div className="result-hero"><span className="result-icon" aria-hidden="true">{tone === "urgent" ? "!" : tone === "same-day" ? "→" : "✓"}</span><div><p className="eyebrow">{t("result.title", "Your baby’s next step")}</p><span className="result-pill">{decisionLabel(result.final_decision, t)}</span><h2>{title}</h2><p className="result-message">{result.parent_message}</p></div></div>{result.pending_sync && <p className="offline-result-note"><strong>Queued for secure review.</strong> This offline guidance is based on reported signs only. Keep the browser open and reconnect so the photo can be analysed.</p>}{needsCareToday && <section className="care-now-card"><div><strong>{tone === "urgent" ? t("parent.message.urgent", "Do not delay.") : t("parent.message.same_day", "Choose a suitable facility before you leave.")}</strong><p>{tone === "urgent" ? t("web.result.urgent_detail", "A newborn danger sign needs medical assessment now.") : t("web.result.same_day_detail", "A health worker should assess your baby today.")}</p></div>{primaryFacility && <a className="button button-secondary" href={`https://www.google.com/maps/search/?api=1&query=${primaryFacility.latitude},${primaryFacility.longitude}`} target="_blank" rel="noreferrer">{t("web.result.directions", "Get directions")}</a>}</section>}<section className="next-steps"><h3>{t("result.what_next", "What to do next")}</h3>{nextStepsFor(result.final_decision, t).map((step, index) => <div className="next-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</section>{facilities.length > 0 && <div className="facility-list"><h3>{needsCareToday ? t("result.facilities", "Suitable care nearby") : t("result.facilities", "Places that may be able to help")}</h3>{facilities.map((facility) => <article className="facility-card" key={facility.id}><div><strong>{facility.name}</strong><p>{facility.address || [facility.lga, facility.state].filter(Boolean).join(", ")}</p><small>{facility.services?.join(" · ")}</small></div>{facility.latitude != null && facility.longitude != null && <a href={`https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">{t("web.result.directions", "Directions")}</a>}</article>)}</div>}{result.notes?.length > 0 && <section className="result-notes"><h3>{t("result.notes", "Additional notes")}</h3><ul>{result.notes.map((note) => <li key={note}>{note}</li>)}</ul></section>}{result.training_image_stored && <WithdrawTrainingConsent screeningId={result.screening_id} t={t} />}</section>;
}

function WithdrawTrainingConsent({ screeningId, t }) {
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");
  const removeConsent = async () => {
    if (!window.confirm(t("web.consent.remove_prompt", "Remove this training photo? Your screening result will remain available."))) return;
    try {
      await request(`/screening/${screeningId}/training-consent`, { method: "DELETE" });
      setRemoved(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  if (removed) return <p className="notice success">{t("web.consent.removed", "Training photo removed.")}</p>;
  return <section className="training-status"><p>{t("web.consent.stored", "This photo was stored with your permission to help improve the model.")}</p><button className="text-button" onClick={removeConsent}>{t("web.consent.remove", "Remove this training photo")}</button>{error && <p className="notice error">{error}</p>}</section>;
}

function HistoryList({ items, t }) {
  if (!items.length) return <section className="empty-panel"><h2>{t("history.empty", "No screening history yet")}</h2><p>{t("history.text", "Your completed screening results will appear here for follow-up.")}</p></section>;
  return <section className="history-list"><div><p className="eyebrow">{t("nav.history", "Private screening history")}</p><h2>{t("history.title", "Previous checks")}</h2></div>{items.map((item) => <article className="history-card" key={item.screening_id}><span className={`status-dot ${decisionTone(item.final_decision)}`} /><div><strong>{decisionLabel(item.final_decision, t)}</strong>{item.pending_sync && <span className="pending-pill">Awaiting photo review</span>}<p>{item.parent_message}</p><small>{new Date(item.created_at).toLocaleString()}</small></div></article>)}</section>;
}

function CareGuide({ t }) {
  const sections = {
    warning: {
      title: t("edu.urgent.title", "Warning signs"),
      intro: t("next.urgent.3", "Seek urgent medical care if you notice any of these signs."),
      items: [
        [t("edu.urgent.2", "Baby is very hard to wake"), t("next.urgent.3", "A baby who cannot be woken for feeds or is limp needs urgent assessment.")],
        [t("edu.urgent.1", "Yellowing in the first 24 hours"), t("next.urgent.1", "Any yellowing in the first day needs hospital assessment today.")],
        [t("edu.urgent.5", "Dark urine or pale stool"), t("next.urgent.3", "Dark urine or very pale stool can point to a serious problem and needs urgent review.")],
      ],
    },
    feeding: {
      title: t("care.feeding.title", "Feeding support"),
      intro: t("care.feeding.body", "Frequent effective feeding helps newborns clear bilirubin."),
      items: [
        [t("care.feeding.1", "Feed regularly"), t("care.feeding.body", "Offer breastfeeds often. Wake a sleepy baby for feeds.")],
        [t("care.feeding.2", "Watch for poor sucking"), t("next.same_day.2", "Water does not treat jaundice and can reduce milk intake.")],
        [t("care.feeding.3", "Seek help early if feeds are being missed"), t("next.same_day.1", "A midwife or nurse can help if feeds are painful, short, or ineffective.")],
      ],
    },
    education: {
      title: t("education.title", "Newborn care"),
      intro: t("edu.what_is.body", "Simple facts can prevent harmful delays."),
      items: [
        [t("edu.what_not_to_do.3", "Do not use direct sunlight as treatment"), t("edu.what_not_to_do.3", "Sunlight is not a controlled substitute for prescribed phototherapy.")],
        [t("edu.dark_skin.title", "Check eyes and gums on darker skin"), t("edu.dark_skin.body", "Yellowing can be harder to see on the skin. Check eyes, gums, palms and soles too.")],
        [t("edu.what_to_do.title", "What parents should do"), t("edu.what_to_do.4", "Seek same-day review if warning signs appear.")],
      ],
    },
  };
  const [active, setActive] = useState("warning");
  const [open, setOpen] = useState(null);
  const section = sections[active];
  return <section className="guide-panel"><div><p className="eyebrow">Care guide</p><h2>Short guidance for the moments that matter.</h2></div><div className="guide-tabs">{Object.entries(sections).map(([key, value]) => <button className={key === active ? "guide-tab-active" : ""} onClick={() => { setActive(key); setOpen(null); }} key={key}>{value.title}</button>)}</div><p className="guide-intro">{section.intro}</p>{section.items.map(([title, body], index) => <article className="guide-item" key={title}><button onClick={() => setOpen(open === index ? null : index)}><strong>{title}</strong><span>{open === index ? "−" : "+"}</span></button>{open === index && <p>{body}</p>}</article>)}</section>;
}

function CommunityCare({ history, queueCount, setTab, t }) {
  const urgent = history.filter((item) => item.final_decision?.includes("URGENT")).length;
  const sameDay = history.filter((item) => item.final_decision?.includes("SAME_DAY") || item.final_decision?.includes("RECHECK")).length;
  return <section className="community-panel"><div className="community-hero"><div><p className="eyebrow">{t("chw.tag", "Community care workflow")}</p><h2>{t("chw.title", "One guided conversation. One safe next step.")}</h2><p>{t("chw.intro", "Use this workspace for assisted checks. It stores only screenings created by this community account; it does not reveal another parent’s private records.")}</p></div><button className="button" onClick={() => setTab("screen")}>{t("chw.actions.screening", "Start assisted screening")}</button></div><div className="metric-grid"><Metric label="Checks recorded" value={history.length} tone="monitor" /><Metric label="Urgent outcomes" value={urgent} tone="urgent" /><Metric label="Same-day outcomes" value={sameDay} tone="same-day" /><Metric label="Queued offline" value={queueCount} tone="monitor" /></div><section className="care-reminder"><strong>For every urgent result:</strong> explain the next action simply, support the caregiver to reach an appropriate facility, and do not wait for an assistant response.</section>{history.length > 0 && <HistoryList items={history.slice(0, 5)} t={t} />}</section>;
}

function Metric({ label, value, tone }) {
  return <article className={`metric-card ${tone}`}><strong>{value}</strong><span>{label}</span></article>;
}

function CommunityAnalytics({ history, t }) {
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

function BhutaniReference({ t }) {
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

  return <aside className={`chat-widget ${open ? "chat-open" : ""}`}><button className="chat-toggle" onClick={() => setOpen(!open)}>{open ? t("web.chat.close", "Close assistants") : t("web.chat.open", "Ask an assistant")}</button>{open && <div className="chat-body"><div className="assistant-tabs"><button className={assistant === "mamabot" ? "assistant-active" : ""} onClick={() => setAssistant("mamabot")}>MamaBot</button><button className={assistant === "vaxai" ? "assistant-active" : ""} onClick={() => setAssistant("vaxai")}>VaxAI</button></div><p><strong>{labels[assistant]}</strong><br />{assistant === "mamabot" ? "Newborn-care education support." : "Childhood vaccination education support."}</p><div className="suggestion-row">{suggestions.map((suggestion) => <button disabled={busy} key={suggestion} onClick={() => void sendQuestion(suggestion)}>{suggestion}</button>)}</div><div className="chat-messages" aria-live="polite">{chats[assistant].length === 0 && <span>{t("web.chat.empty", "Choose a suggested question or type your own below.")}</span>}{chats[assistant].map((item, index) => <p className={item.role} key={`${item.role}-${index}`}>{item.text}</p>)}{busy && <span>{t("web.chat.thinking", "Thinking…")}</span>}</div><form onSubmit={(event) => { event.preventDefault(); void sendQuestion(message); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("web.chat.placeholder", "Type your question")} disabled={busy} /><button aria-label="Send question" disabled={busy}>↑</button></form><small>{t("trust.title", "This is a screening support tool.")}</small></div>}</aside>;
}

function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function LoadingCard({ label }) { return <section className="loading-card"><span className="spinner" />{label}</section>; }
function decisionTone(value) { return value?.includes("URGENT") ? "urgent" : value?.includes("SAME_DAY") || value?.includes("RECHECK") ? "same-day" : "monitor"; }
function decisionLabel(value, t = (_key, fallback) => fallback) { return ({ URGENT_HOSPITAL_REVIEW: t("status.urgent", "Seek urgent hospital care"), SAME_DAY_CLINIC_REVIEW: t("status.same_day", "Arrange same-day assessment"), RECHECK_SOON_OR_CLINIC_IF_CONCERNED: t("status.same_day", "Arrange same-day assessment"), HOME_MONITORING: t("status.monitor", "Monitor closely at home") })[value] || t("result.title", "Review screening guidance"); }

function LegalPage({ type, navigate, t, language }) {
  const content = legalContent[language]?.[type] || legalContent.en[type];
  return <main className="legal-page"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="legal-updated">{content.updated}</p>{content.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<button className="button" onClick={() => navigate("/")}>{t("ui.legal.back", "Back to JaundiCare")}</button></main>;
}

function SiteFooter({ navigate, t }) {
  const contact = import.meta.env.VITE_CONTACT_EMAIL;
  const parentCompany = import.meta.env.VITE_PARENT_COMPANY_NAME?.trim();
  return <footer className="site-footer"><div><button className="brand footer-brand" onClick={() => navigate("/")}><span className="brand-mark">J</span><span><strong>JaundiCare</strong><small>{t("app.support", "Newborn care support")}</small></span></button><p>{t("trust.body", "Screening support, not medical diagnosis.")}</p></div><div className="footer-links"><button onClick={() => navigate("/privacy")}>{t("ui.legal.privacy", "Privacy Notice")}</button><button onClick={() => navigate("/terms")}>{t("ui.legal.terms", "Terms of Use")}</button>{contact && <a href={`mailto:${contact}`}>Contact</a>}</div><address className="business-address"><strong>{t("ui.company.address", "Business address")}</strong><span>Adenekan Street, Alakuko, Ifako-Ijaye, Lagos, Nigeria</span>{parentCompany && <span>{t("ui.company.product_of", "A product of")} {parentCompany}</span>}</address><small>© {new Date().getFullYear()} JaundiCare. {t("trust.title", "Screening support, not medical diagnosis.")}</small></footer>;
}

export default App;
