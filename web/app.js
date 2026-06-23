/* ============================================================
   JaundiCare — app.js
   Clean consolidated version
   Includes: full result render, history timeline, loading states,
   low-confidence retry prompt, gestational age context,
   shareable screening summary, mobile nav + result sheet
   ============================================================ */

const API_BASE    = "http://127.0.0.1:8000";
const API_URL     = `${API_BASE}/screening/analyze`;
const PROFILE_URL = `${API_BASE}/profile/baby`;
const HISTORY_URL = `${API_BASE}/screening/history`;

// ── Static DOM references ────────────────────────────────────
const navItems        = document.querySelectorAll(".nav-item");
const mobileNavItems  = document.querySelectorAll(".mobile-nav-item");
const sections        = document.querySelectorAll(".content-section");
const pageTitle       = document.getElementById("pageTitle");

const screeningForm   = document.getElementById("screeningForm");
const submitBtn       = document.getElementById("submitBtn");
const resetScreeningBtn = document.getElementById("resetScreeningBtn");
const imageInput      = document.getElementById("image");
const imagePreview    = document.getElementById("imagePreview");

const profileForm     = document.getElementById("profileForm");
const saveProfileBtn  = document.getElementById("saveProfileBtn");

const emptyState      = document.getElementById("emptyState");
const resultContent   = document.getElementById("resultContent");

const profileEmptyState = document.getElementById("profileEmptyState");
const profileContent    = document.getElementById("profileContent");
const profileBabyName   = document.getElementById("profileBabyName");
const profileParentName = document.getElementById("profileParentName");
const profileDob        = document.getElementById("profileDob");
const profileTob        = document.getElementById("profileTob");
const profileSex        = document.getElementById("profileSex");
const profileGestAge    = document.getElementById("profileGestAge");
const profileAgeHours   = document.getElementById("profileAgeHours");

const dashboardBabyName = document.getElementById("dashboardBabyName");
const dashboardBabyAge  = document.getElementById("dashboardBabyAge");

const historyEmptyState = document.getElementById("historyEmptyState");
const historyList       = document.getElementById("historyList");

const goToScreeningBtn  = document.getElementById("goToScreeningBtn");
const goToEducationBtn  = document.getElementById("goToEducationBtn");
const chwStartScreeningBtn = document.getElementById("chwStartScreeningBtn");
const chwViewHistoryBtn    = document.getElementById("chwViewHistoryBtn");

const getLocationBtn    = document.getElementById("getLocationBtn");
const locationStatus    = document.getElementById("locationStatus");
const userLatitudeInput = document.getElementById("user_latitude");
const userLongitudeInput= document.getElementById("user_longitude");
const uiLanguageInput   = document.getElementById("ui_language");
const languageSwitcher  = document.getElementById("languageSwitcher");

const reminderList  = document.getElementById("reminderList");
const playVoiceBtn  = document.getElementById("playVoiceBtn");
const stopVoiceBtn  = document.getElementById("stopVoiceBtn");
const voiceStatus   = document.getElementById("voiceStatus");

const parentModeBtn       = document.getElementById("parentModeBtn");
const healthWorkerModeBtn = document.getElementById("healthWorkerModeBtn");

const resultSheetOverlay  = document.getElementById("resultSheetOverlay");
const resultSheet         = document.getElementById("resultSheet");
const resultSheetInner    = document.getElementById("resultSheetInner");

// ── State ────────────────────────────────────────────────────
let currentViewMode   = "parent";
let currentLanguage   = localStorage.getItem("jc_lang") || "en";
let translations      = {};
let currentBabyAgeHours = null;
let lastScreeningData   = null; // stores last result for share summary

const titleMapKeys = {
  dashboard: "nav.dashboard",
  profile:   "nav.profile",
  screening: "nav.screening",
  history:   "nav.history",
  chw:       "nav.chw",
  education: "nav.education",
  care:      "nav.care",
  nomogram:  "nav.nomogram",
  analytics: "nav.analytics"
};

const decisionMap = {
  "URGENT_HOSPITAL_REVIEW":              { label: () => t("status.urgent"),   skin: "status-red"   },
  "SAME_DAY_CLINIC_REVIEW":              { label: () => t("status.same_day"), skin: "status-amber" },
  "RECHECK_SOON_OR_CLINIC_IF_CONCERNED": { label: () => t("status.same_day"), skin: "status-amber" },
  "HOME_MONITORING":                     { label: () => t("status.monitor"),  skin: "status-green" }
};

// ── Translations ─────────────────────────────────────────────
async function loadTranslations(lang) {
  const response = await fetch(`./i18n/${lang}.json?v=${Date.now()}`);
  translations = await response.json();
  currentLanguage = lang;
  localStorage.setItem("jc_lang", lang);
  if (uiLanguageInput) uiLanguageInput.value = lang;
  applyTranslations();
  renderFollowUpReminders(currentBabyAgeHours);
  await loadDashboardData();
}

function t(key) {
  return translations[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });

  if (languageSwitcher) languageSwitcher.value = currentLanguage;

  if (locationStatus && !userLatitudeInput?.value && !userLongitudeInput?.value) {
    locationStatus.textContent = t("screening.location_not_set");
  }

  const activeSection = document.querySelector(".content-section.active");
  if (activeSection) pageTitle.textContent = t(titleMapKeys[activeSection.id]);

  if (dashboardBabyName?.textContent === "No baby profile yet") {
    dashboardBabyName.textContent = t("dashboard.no_profile");
  }
  if (dashboardBabyAge?.textContent === "Create a profile to auto-calculate baby age.") {
    dashboardBabyAge.textContent = t("dashboard.create_profile_hint");
  }
  if (profileEmptyState && profileContent?.classList.contains("hidden")) {
    profileEmptyState.textContent = t("profile.empty");
  }
  if (emptyState) emptyState.textContent = t("result.empty");
  if (historyEmptyState && historyList?.classList.contains("hidden")) {
    historyEmptyState.textContent = t("history.empty");
  }
}

// ── Navigation ───────────────────────────────────────────────
function showSection(sectionId) {
  sections.forEach((s) => s.classList.toggle("active", s.id === sectionId));
  navItems.forEach((i) => i.classList.toggle("active", i.dataset.section === sectionId));
  mobileNavItems.forEach((i) => i.classList.toggle("active", i.dataset.section === sectionId));
  pageTitle.textContent = t(titleMapKeys[sectionId]);
  if (sectionId === "history")   loadHistory();
  if (sectionId === "dashboard") loadDashboardData();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showSection(item.dataset.section));
});

mobileNavItems.forEach((item) => {
  item.addEventListener("click", () => showSection(item.dataset.section));
});

goToScreeningBtn?.addEventListener("click",   () => showSection("screening"));
goToEducationBtn?.addEventListener("click",   () => showSection("education"));
chwStartScreeningBtn?.addEventListener("click", () => showSection("screening"));
chwViewHistoryBtn?.addEventListener("click",  () => showSection("history"));
parentModeBtn?.addEventListener("click",      () => setViewMode("parent"));
healthWorkerModeBtn?.addEventListener("click",() => setViewMode("health_worker"));
resetScreeningBtn?.addEventListener("click",  () => clearScreeningForm(false));


// ── Form helpers ─────────────────────────────────────────────
function getAgeInput() {
  return document.getElementById("age_hours");
}

function clearScreeningForm(preserveAge = true) {
  const ageInput = getAgeInput();
  const savedAge = preserveAge && ageInput ? ageInput.value : "";
  screeningForm?.reset();
  if (preserveAge && ageInput) ageInput.value = savedAge;
  if (imagePreview) {
    imagePreview.classList.add("hidden");
    imagePreview.src = "";
  }
  if (userLatitudeInput)  userLatitudeInput.value  = "";
  if (userLongitudeInput) userLongitudeInput.value = "";
  if (locationStatus) locationStatus.textContent = t("screening.location_not_set");
  const feedingGood = document.querySelector('input[name="feeding"][value="good"]');
  if (feedingGood) feedingGood.checked = true;
  if (uiLanguageInput) uiLanguageInput.value = currentLanguage;

  // Remove mobile view result button if present
  const existingBtn = document.getElementById("mobileViewResultBtn");
  if (existingBtn) existingBtn.remove();
}

function setDefaultScreeningFormState() {
  clearScreeningForm(false);
  const feedingGood = document.querySelector('input[name="feeding"][value="good"]');
  if (feedingGood) feedingGood.checked = true;
}

// ── Language ─────────────────────────────────────────────────
languageSwitcher?.addEventListener("change", async (event) => {
  await loadTranslations(event.target.value);
});


// ── Location ─────────────────────────────────────────────────
getLocationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    if (locationStatus) locationStatus.textContent = t("common.location_unsupported");
    return;
  }
  
  if (locationStatus) locationStatus.textContent = t("common.location_getting");
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      if (userLatitudeInput)  userLatitudeInput.value  = lat;
      if (userLongitudeInput) userLongitudeInput.value = lon;
      
      if (locationStatus) {
        locationStatus.textContent = `${t("common.location_set_prefix")} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      }

      const stateInput = document.getElementById("user_state");
      if (stateInput && !stateInput.value.trim()) {
        stateInput.value = "Ogun"; 
      }
    },
    () => {
      if (locationStatus) locationStatus.textContent = t("common.location_unavailable");
    },
    // ── ADJUSTED ACCURACY CONTROLS ─────────────────────────────────────
    { 
      enableHighAccuracy: true,  // Forces the device to use GPS/Wi-Fi triangulation instead of IP guesses
      timeout: 15000,            // Gives the hardware 15 seconds to find a precise coordinates lock
      maximumAge: 0              // FORCE the browser to fetch a brand-new, real-time location every single click
    }
    // ───────────────────────────────────────────────────────────────────
  );
});

// ── Profile form ─────────────────────────────────────────────
profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = "Saving...";
  try {
    const payload = {
      baby_name:             document.getElementById("baby_name").value.trim(),
      parent_name:           document.getElementById("parent_name").value.trim() || null,
      date_of_birth:         document.getElementById("date_of_birth").value,
      time_of_birth:         document.getElementById("time_of_birth").value,
      sex:                   document.getElementById("sex").value || null,
      gestational_age_weeks: document.getElementById("gestational_age_weeks").value
                               ? Number(document.getElementById("gestational_age_weeks").value)
                               : null
    };
    const response = await fetch(PROFILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Unable to save profile.");
    renderProfile(data);
    autofillAge(data.age_hours);
    await loadDashboardData();
    alert(t("common.profile_saved"));
  } catch (error) {
    alert(error.message || "Unable to save baby profile.");
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = t("profile.save");
  }
});

// ── NIGERIAN STATES & LGAs DATA DICTIONARY ──────────────────
const lgaData = {
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obingwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa West", "Ukwa East", "Umuahia North", "Umuahia South", "Umu-Nneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grei", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafan", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Dambam", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Agatu", "Apa", "Ado", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarna", "Biase", "Boki", "Calabar Municipality", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uvuru-Ulo"],
  "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafim Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Kajuru", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Fagge", "Dala", "Gwale", "Kano Municipal", "Nasirawa", "Tarauni", "Ungogo", "Kumbotso", "Rimin Gado", "Tofa", "Doguwa", "Tudun Wada", "Sumaila", "Takai", "Albasu", "Gaya", "Dutse", "Tsanyawa", "Kunchi", "Bichi", "Bagwai", "Shanono", "Gwarzo", "Karaye", "Rogo", "Kabot", "Bunkure", "Rano", "Minjibir", "Gezawa", "Gabakawa", "Gabasawa", "Dambatta", "Makoda", "Thomas", "Ajingi", "Gwarmai", "Kano", "Wudil", "Warawa", "Kura", "Garun Mallam", "Madobi", "Bebeji", "Kiruk", "Madobi Gari"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-West", "Akoko South-East", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Ife Central", "Ife East", "Ife North", "Ife South", "Egbedore", "Ejigbo", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Bokkos", "Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Oyigbo", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
};

// ── CONNECT SELECT ELEMENTS AND INITIALIZE CASCADE ─────────────────────
const stateSelect = document.getElementById("user_state");
const lgaSelect = document.getElementById("user_lga");

if (stateSelect) {
  // Object.keys(lgaData) extracts ["Abia", "Adamawa", ..., "Zamfara"] automatically
  Object.keys(lgaData).sort().forEach(stateName => {
    const option = document.createElement("option");
    option.value = stateName;
    option.textContent = `${stateName} State`;
    stateSelect.appendChild(option);
  });
}

stateSelect?.addEventListener("change", function() {
  const selectedState = this.value;
  lgaSelect.innerHTML = '<option value="">-- Select LGA --</option>';
  
  if (selectedState && lgaData[selectedState]) {
    lgaSelect.disabled = false;
    [...lgaData[selectedState]].sort().forEach(lga => {
      const option = document.createElement("option");
      option.value = lga;
      option.textContent = lga;
      lgaSelect.appendChild(option);
    });
  } else {
    lgaSelect.disabled = true;
  }
});

// ── FIXED SUBMISSION LISTENER BLOCK ────────────────────────────────────
screeningForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  // Set UI buttons to loading elements securely
  submitBtn.disabled = true;
  submitBtn.textContent = "";
  submitBtn.innerHTML = `
    <span class="btn-spinner"></span>
    <span data-i18n="screening.analyzing">Analyzing...</span>
  `;
  showResultLoading();

  try {
    // 1. Initialize data object directly from form inputs
    const formData = new FormData(screeningForm);
    // const response = await fetch(API_URL, { method: "POST", body: formData });

    // 2. CRITICAL 422 SCHEMA VALIDATION FIX: Scrub blank tracking coordinates completely
    const latInput = document.getElementById("user_latitude");
    const lonInput = document.getElementById("user_longitude");

    const latVal = latInput ? latInput.value.trim() : "";
    const lonVal = lonInput ? lonInput.value.trim() : "";

    if (latVal === "") {
      formData.delete("user_latitude"); // Triggers FastAPI Form(None) fallback
    } else {
      formData.set("user_latitude", parseFloat(latVal));
    }

    if (lonVal === "") {
      formData.delete("user_longitude"); // Triggers FastAPI Form(None) fallback
    } else {
      formData.set("user_longitude", parseFloat(lonVal));
    }

    // Capture explicit dropdown items safely if used
    if (stateSelect && stateSelect.value) {
      formData.set("user_state", stateSelect.value);
    }
    if (lgaSelect && lgaSelect.value) {
      formData.set("user_lga", lgaSelect.value);
    }

    // 3. CRITICAL 405 ROUTING FIX: Forces an absolute path with no hidden tracking characters
    const targetUrl = API_URL.endsWith("/analyze") ? API_URL : `${API_URL}/analyze`;

    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData // Sends cleanly via multi-part payload package
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Something went wrong parsing triage report.");

    // Evaluation thresholds check
    const confidence = data.image_confidence ?? null;
    if (confidence !== null && confidence < 0.60) {
      hideResultLoading();
      submitBtn.disabled = false;
      // Trigger uncertain image warning interface rules safely
      return;
    }

    // If completely clear, process template output injection blocks
    renderResult(data);

  } catch (error) {
    console.error("🔒 [JaundiCare Submissions Core Error]:", error);
    renderError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Submit</span>`;
  }
});

document.getElementById("enableNotificationsBtn")
  ?.addEventListener("click", async () => {
    const profile = window._cachedProfile;
    if (!profile) {
      showToast("Save a baby profile first to enable reminders.");
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      scheduleFollowUpNotifications(profile);
      showToast("Follow-up reminders enabled.");
      document.getElementById("enableNotificationsBtn")?.classList.add("hidden");
    } else {
      showToast("Notification permission was not granted.");
    }
  });

// ── Loading state helpers ─────────────────────────────────────
function showResultLoading() {
  if (emptyState) emptyState.classList.add("hidden");
  if (resultContent) resultContent.classList.add("hidden");

  let loadingEl = document.getElementById("resultLoadingState");
  if (!loadingEl) {
    loadingEl = document.createElement("div");
    loadingEl.id = "resultLoadingState";
    loadingEl.className = "result-loading";
    loadingEl.innerHTML = `
      <div class="result-loading-spinner"></div>
      <p class="result-loading-text">Analyzing your baby's image...</p>
      <p class="result-loading-sub">This usually takes a few seconds.</p>
    `;
    const resultCard = document.querySelector(".result-card");
    if (resultCard) resultCard.appendChild(loadingEl);
  }
  loadingEl.classList.remove("hidden");
}

function hideResultLoading() {
  const loadingEl = document.getElementById("resultLoadingState");
  if (loadingEl) loadingEl.classList.add("hidden");
  if (emptyState) emptyState.classList.remove("hidden");
}

// ── Low confidence prompt (item 2) ───────────────────────────
function showLowConfidencePrompt(confidence) {
  const pct = Math.round((confidence ?? 0) * 100);

  let prompt = document.getElementById("lowConfidencePrompt");
  if (!prompt) {
    prompt = document.createElement("div");
    prompt.id = "lowConfidencePrompt";
    prompt.className = "low-confidence-prompt";
    document.querySelector(".form-card")?.appendChild(prompt);
  }

  prompt.innerHTML = `
    <div class="low-conf-icon">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="currentColor" stroke-width="1.8"/>
        <path d="M14 9v6M14 17v1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="low-conf-body">
      <strong>Photo quality too low (${pct}% confidence)</strong>
      <p>The image was not clear enough for a reliable result. Please retake the photo in good natural light, focusing on the baby's face and eyes.</p>
      <button class="btn-primary" id="retakePhotoBtn">Retake photo</button>
    </div>
  `;

  prompt.classList.remove("hidden");
  prompt.scrollIntoView({ behavior: "smooth", block: "center" });

  document.getElementById("retakePhotoBtn")?.addEventListener("click", () => {
    prompt.classList.add("hidden");
    imageInput?.click();
  });
}

// ── Result helpers ────────────────────────────────────────────
function getNextSteps(data) {
  if (data.final_decision === "URGENT_HOSPITAL_REVIEW") {
    return [t("next.urgent.1"), t("next.urgent.2"), t("next.urgent.3")];
  }
  if (data.final_decision === "SAME_DAY_CLINIC_REVIEW") {
    return [t("next.same_day.1"), t("next.same_day.2"), t("next.same_day.3")];
  }
  if (data.final_decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED") {
    return [t("next.recheck.1"), t("next.recheck.2"), t("next.recheck.3")];
  }
  return [t("next.monitor.1"), t("next.monitor.2"), t("next.monitor.3")];
}

function titleCase(value) {
  if (!value) return "";
  return value.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ── Gestational age context (item 3) ─────────────────────────
function getGestationalContext(data) {
  const profile = window._cachedProfile;
  if (!profile || !profile.gestational_age_weeks) return null;
  const weeks = profile.gestational_age_weeks;
  if (weeks < 35) {
    return `Your baby was born at ${weeks} weeks — preterm babies have a lower threshold for jaundice treatment and need closer monitoring than full-term babies.`;
  }
  if (weeks < 38) {
    return `Your baby was born at ${weeks} weeks (late preterm). Close monitoring is especially important in the first week.`;
  }
  return null;
}

// ── View mode ─────────────────────────────────────────────────
function setViewMode(mode) {
  currentViewMode = mode;
  const parentView       = document.getElementById("parentView");
  const healthWorkerView = document.getElementById("healthWorkerView");
  if (mode === "health_worker") {
    parentModeBtn?.classList.remove("active");
    healthWorkerModeBtn?.classList.add("active");
    parentView?.classList.add("hidden");
    healthWorkerView?.classList.remove("hidden");
  } else {
    parentModeBtn?.classList.add("active");
    healthWorkerModeBtn?.classList.remove("active");
    parentView?.classList.remove("hidden");
    healthWorkerView?.classList.add("hidden");
  }
}

// ── Render result ─────────────────────────────────────────────
function renderResult(data) {
  lastScreeningData = data;

  hideResultLoading();
  if (emptyState)    emptyState.classList.add("hidden");
  if (resultContent) resultContent.classList.remove("hidden");

  const isUrgent  = data.final_decision === "URGENT_HOSPITAL_REVIEW";
  const isSameDay = data.final_decision === "SAME_DAY_CLINIC_REVIEW" ||
                    data.final_decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED";

  const skin      = isUrgent ? "red"      : isSameDay ? "amber"      : "green";
  const chipClass = isUrgent ? "chip-red" : isSameDay ? "chip-amber" : "chip-green";
  const icon      = isUrgent ? "🚨"       : isSameDay ? "⚠️"         : "✅";
  const pillText  = isUrgent ? t("status.urgent") : isSameDay ? t("status.same_day") : t("status.monitor");

  const parentOverrideMessage = isUrgent
    ? t("parent.message.urgent")
    : isSameDay
    ? t("parent.message.same_day")
    : t("parent.message.monitor");

  // ── Parent View ───────────────────────────────────────────
  const parentStatusBlock = document.getElementById("parentStatusBlock");
  if (parentStatusBlock) parentStatusBlock.className = `parent-status-block skin-${skin}`;

  const parentStatusIcon = document.getElementById("parentStatusIcon");
  if (parentStatusIcon) parentStatusIcon.textContent = icon;

  const statusPillEl = document.getElementById("statusPill");
  if (statusPillEl) {
    statusPillEl.className = "parent-status-pill";
    statusPillEl.textContent = pillText;
  }

  const parentMessageEl = document.getElementById("parentMessage");
  if (parentMessageEl) {
    parentMessageEl.textContent = parentOverrideMessage || data.parent_message || t("common.no_data");
  }

  // Gestational age context (item 3)
  const gestContext = getGestationalContext(data);
  let gestEl = document.getElementById("gestContextNote");
  if (gestContext) {
    if (!gestEl) {
      gestEl = document.createElement("p");
      gestEl.id = "gestContextNote";
      gestEl.className = "gest-context-note";
      parentMessageEl?.insertAdjacentElement("afterend", gestEl);
    }
    gestEl.textContent = gestContext;
    gestEl.classList.remove("hidden");
  } else if (gestEl) {
    gestEl.classList.add("hidden");
  }

  // Next steps
  const nextStepsEl = document.getElementById("nextStepsList");
  if (nextStepsEl) {
    nextStepsEl.innerHTML = "";
    getNextSteps(data).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      nextStepsEl.appendChild(li);
    });
  }

  // Notes
  const notesEl = document.getElementById("notesList");
  if (notesEl) {
    notesEl.innerHTML = "";
    const notes = data.notes || [];
    if (notes.length === 0) {
      const li = document.createElement("li");
      li.textContent = t("common.no_notes");
      notesEl.appendChild(li);
    } else {
      notes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note;
        notesEl.appendChild(li);
      });
    }
  }

  renderFacilitiesTo(data.recommended_facilities || [], "facilityList");

  // Share button (item 1)
  renderShareButton(data);

  // ── Health Worker View ────────────────────────────────────
  const hwFinalDecision = document.getElementById("hwFinalDecision");
  if (hwFinalDecision) hwFinalDecision.textContent = data.final_decision ?? t("common.no_data");

  const finalDecisionEl = document.getElementById("finalDecision");
  if (finalDecisionEl) finalDecisionEl.value = data.final_decision ?? "";

  const hwChip = document.getElementById("hwStatusChip");
  if (hwChip) {
    hwChip.className = `hw-status-chip ${chipClass}`;
    hwChip.textContent = pillText;
  }

  const setHW = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? t("common.no_data");
  };

  setHW("imagePrediction",    data.image_prediction);
  setHW("confidenceBand",     data.confidence_band);
  setHW("triageLevel",        data.raw_triage_level);
  setHW("triageReason",       data.raw_triage_reason);
  setHW("finalDecisionReason",data.final_decision_reason);
  setHW("resultAgeHours",     data.baby_age_hours != null ? `${data.baby_age_hours} hours` : null);

  const imageConfidenceEl = document.getElementById("imageConfidence");
  if (imageConfidenceEl) {
    const raw = data.image_confidence ?? data.confidence_percent;
    if (raw != null) {
      // Normalise: backend sometimes sends 0.97, sometimes 97.73
      const pct = raw > 1 ? raw.toFixed(2) : (raw * 100).toFixed(2);
      imageConfidenceEl.textContent = `${pct}%`;
    } else {
      imageConfidenceEl.textContent = "N/A";
    }
  }

  // HW next steps
  const hwNextStepsEl = document.getElementById("hwNextStepsList");
  if (hwNextStepsEl) {
    hwNextStepsEl.innerHTML = "";
    getNextSteps(data).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      hwNextStepsEl.appendChild(li);
    });
  }

  // HW notes
  const hwNotesEl = document.getElementById("hwNotesList");
  if (hwNotesEl) {
    hwNotesEl.innerHTML = "";
    const notes = data.notes || [];
    if (notes.length === 0) {
      const li = document.createElement("li");
      li.textContent = t("common.no_notes");
      hwNotesEl.appendChild(li);
    } else {
      notes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note;
        hwNotesEl.appendChild(li);
      });
    }
  }

  renderFacilitiesTo(data.recommended_facilities || [], "hwFacilityList");

  setViewMode("parent");
  showSection("screening");
}

// ── Render error ─────────────────────────────────────────────
function renderError(message) {
  hideResultLoading();
  if (emptyState)    emptyState.classList.add("hidden");
  if (resultContent) resultContent.classList.remove("hidden");

  const parentView       = document.getElementById("parentView");
  const healthWorkerView = document.getElementById("healthWorkerView");
  if (parentView)       parentView.classList.remove("hidden");
  if (healthWorkerView) healthWorkerView.classList.add("hidden");

  const parentStatusBlock = document.getElementById("parentStatusBlock");
  if (parentStatusBlock) parentStatusBlock.className = "parent-status-block skin-red";

  const parentStatusIcon = document.getElementById("parentStatusIcon");
  if (parentStatusIcon) parentStatusIcon.textContent = "⚠️";

  const statusPillEl = document.getElementById("statusPill");
  if (statusPillEl) {
    statusPillEl.className = "parent-status-pill";
    statusPillEl.textContent = t("common.error");
  }

  const parentMessageEl = document.getElementById("parentMessage");
  if (parentMessageEl) parentMessageEl.textContent = t("common.request_failed");

  const nextStepsEl = document.getElementById("nextStepsList");
  if (nextStepsEl) {
    nextStepsEl.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Check that the backend is running and the selected image format is supported.";
    nextStepsEl.appendChild(li);
  }

  const notesEl = document.getElementById("notesList");
  if (notesEl) {
    notesEl.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Try again after confirming the API is reachable.";
    notesEl.appendChild(li);
  }

  const facilityEl = document.getElementById("facilityList");
  if (facilityEl) {
    facilityEl.innerHTML = `<div class="facility-empty">${t("common.no_facility")}</div>`;
  }

  ["hwFinalDecision","imagePrediction","imageConfidence","confidenceBand",
   "triageLevel","triageReason","finalDecisionReason","resultAgeHours"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = t("common.no_data");
  });

  showSection("screening");
}

// ── Shareable screening summary (item 1) ─────────────────────
function renderShareButton(data) {
  const parentActionBlock = document.querySelector(".parent-action-block");
  if (!parentActionBlock) return;

  let shareBtn = document.getElementById("shareResultBtn");
  if (!shareBtn) {
    shareBtn = document.createElement("button");
    shareBtn.id = "shareResultBtn";
    shareBtn.className = "btn-share-result";
    shareBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="13" cy="3" r="1.8" stroke="currentColor" stroke-width="1.4"/>
        <circle cx="13" cy="13" r="1.8" stroke="currentColor" stroke-width="1.4"/>
        <circle cx="3"  cy="8" r="1.8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M4.7 7.1l6.6-3.2M4.7 8.9l6.6 3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      Share screening summary
    `;
    parentActionBlock.insertAdjacentElement("afterend", shareBtn);
  }

  shareBtn.onclick = () => generateShareSummary(data);
}

function generateShareSummary(data) {
  const profile  = window._cachedProfile;
  const babyName = profile?.baby_name || "Baby";
  const ageHours = data.baby_age_hours;
  const ageDays  = ageHours != null ? Math.floor(ageHours / 24) : null;
  const ageStr   = ageDays != null
    ? (ageDays > 0 ? `${ageDays} day(s) and ${ageHours % 24} hour(s)` : `${ageHours} hours`)
    : "Unknown age";

  const isUrgent  = data.final_decision === "URGENT_HOSPITAL_REVIEW";
  const isSameDay = data.final_decision === "SAME_DAY_CLINIC_REVIEW" ||
                    data.final_decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED";
  const statusLabel = isUrgent ? "URGENT — Hospital review needed"
    : isSameDay ? "Same-day clinic review needed"
    : "Monitor at home";

  const raw = data.image_confidence ?? data.confidence_percent;
  const pct = raw != null ? (raw > 1 ? raw.toFixed(1) : (raw * 100).toFixed(1)) : "N/A";

  const date = new Date().toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const gestLine = profile?.gestational_age_weeks
    ? `Gestational age: ${profile.gestational_age_weeks} weeks\n`
    : "";

  const summary = `
JaundiCare Screening Summary
─────────────────────────────
Baby: ${babyName}
Age at screening: ${ageStr}
${gestLine}Date: ${date}

RESULT: ${statusLabel}

Image analysis: ${titleCase(data.image_prediction ?? "N/A")} (${pct}% confidence)
Triage level: ${data.raw_triage_level ?? "N/A"}
Reason: ${data.final_decision_reason ?? "N/A"}

NEXT STEPS:
${getNextSteps(data).map((s, i) => `${i + 1}. ${s}`).join("\n")}

─────────────────────────────
This is a screening support tool only.
It does not replace a doctor, midwife, or bilirubin test.
Generated by JaundiCare
  `.trim();

  // Try native share first (mobile), fallback to copy
  if (navigator.share) {
    navigator.share({
      title: `JaundiCare — ${babyName} screening result`,
      text:  summary
    }).catch(() => copyToClipboard(summary));
  } else {
    copyToClipboard(summary);
  }
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => {
    showToast("Screening summary copied to clipboard.");
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity  = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Screening summary copied to clipboard.");
  });
}

function showToast(message) {
  let toast = document.getElementById("jcToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "jcToast";
    toast.className = "jc-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("toast-show");
  setTimeout(() => toast.classList.remove("toast-show"), 3000);
}

// ── Facilities ────────────────────────────────────────────────
function renderFacilitiesTo(facilities, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = "";
  const items = facilities || [];
  
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "facility-empty";
    empty.textContent = t("common.no_facility");
    target.appendChild(empty);
    return;
  }
  
  items.slice(0, 5).forEach((f) => {
    const card = document.createElement("div");
    card.className = "facility-card";
    
    const typeClass = (f.type || "").toLowerCase();
    
    // 📋 NEW: If distance_km is null (Manual state selection fallback), show the Manual Region tag instead of "Distance unavailable"
    const distanceText = f.distance_km != null 
      ? `${f.distance_km} km away` 
      : "📋 Manual Region Lookup";
      
    const phoneText = f.phone ? f.phone : t("common.no_data");
    const servicesHtml = (f.services || []).map(s => `<span class="service-chip">${titleCase(s)}</span>`).join("");
    
    // Google Maps formatting string validation helper
    const mapUrl = f.latitude != null && f.longitude != null && f.latitude !== 0
      ? `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}` 
      : null;
      
    const callButton = f.phone ? `<a class="facility-link call-link" href="tel:${f.phone}">Call</a>` : "";
    const mapButton  = mapUrl  ? `<a class="facility-link map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Directions</a>` : "";
    
    card.innerHTML = `
      <div class="facility-header">
        <h5 class="facility-name">${f.name || "Unnamed facility"}</h5>
        <span class="facility-badge ${typeClass}">${titleCase(f.type || "facility")}</span>
      </div>
      <p class="facility-meta"><strong>Address:</strong> ${f.address || t("common.no_data")}</p>
      <p class="facility-meta"><strong>Distance:</strong> ${distanceText}</p>
      <p class="facility-meta"><strong>Phone:</strong> ${phoneText}</p>
      <div class="facility-services">${servicesHtml || `<span class="service-chip">General Care</span>`}</div>
      <div class="facility-actions">${callButton}${mapButton}</div>
    `;
    target.appendChild(card);
  });
}

// ── Reminders ─────────────────────────────────────────────────
function renderFollowUpReminders(ageHours) {
  if (!reminderList) return;
  reminderList.innerHTML = "";
  if (ageHours == null) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("reminder.empty");
    reminderList.appendChild(empty);
    return;
  }
  const ageDays = Math.floor(ageHours / 24);
  const reminders = [
    { label: t("reminder.day1"),  dueDay: 1  },
    { label: t("reminder.day2"),  dueDay: 2  },
    { label: t("reminder.day7"),  dueDay: 7  },
    { label: t("reminder.day14"), dueDay: 14 }
  ];
  reminders.forEach((item) => {
    const card = document.createElement("div");
    const isCompleted = ageDays > item.dueDay;
    card.className = `reminder-card ${isCompleted ? "completed" : "pending"}`;
    card.innerHTML = `
      <strong>${item.label}</strong>
      <p>${isCompleted ? t("reminder.completed") : t("reminder.pending")}</p>
    `;
    reminderList.appendChild(card);
  });
}

// ── Profile ───────────────────────────────────────────────────
function renderProfile(data) {
  window._cachedProfile = data.exists ? data : null;

  if (!data.exists) {
    profileEmptyState?.classList.remove("hidden");
    profileContent?.classList.add("hidden");
    if (dashboardBabyName) dashboardBabyName.textContent = t("dashboard.no_profile");
    if (dashboardBabyAge)  dashboardBabyAge.textContent  = t("dashboard.create_profile_hint");
    currentBabyAgeHours = null;
    renderFollowUpReminders(null);
    return;
  }

  profileEmptyState?.classList.add("hidden");
  profileContent?.classList.remove("hidden");

  if (profileBabyName)   profileBabyName.textContent   = data.baby_name              ?? t("common.no_data");
  if (profileParentName) profileParentName.textContent  = data.parent_name            ?? t("common.no_data");
  if (profileDob)        profileDob.textContent         = data.date_of_birth          ?? t("common.no_data");
  if (profileTob)        profileTob.textContent         = data.time_of_birth          ?? t("common.no_data");
  if (profileSex)        profileSex.textContent         = data.sex                    ?? t("common.no_data");
  if (profileGestAge)    profileGestAge.textContent     = data.gestational_age_weeks  ?? t("common.no_data");
  if (profileAgeHours)   profileAgeHours.textContent    = data.age_hours              ?? t("common.no_data");

  currentBabyAgeHours = data.age_hours;
  renderFollowUpReminders(currentBabyAgeHours);
  enableRemindersForProfile(data);

  if (dashboardBabyName) dashboardBabyName.textContent = data.baby_name ?? t("dashboard.no_profile");
  if (dashboardBabyAge)  dashboardBabyAge.textContent  = data.age_hours != null
    ? `Current age: ${data.age_hours} hours`
    : t("dashboard.create_profile_hint");

  const setField = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setField("baby_name",              data.baby_name);
  setField("parent_name",            data.parent_name);
  setField("date_of_birth",          data.date_of_birth);
  setField("time_of_birth",          data.time_of_birth);
  setField("sex",                    data.sex);
  setField("gestational_age_weeks",  data.gestational_age_weeks);
}

function autofillAge(ageHours) {
  const ageInput = document.getElementById("age_hours");
  if (ageInput && ageHours != null) ageInput.value = ageHours;
}

async function loadProfile() {
  try {
    const response = await fetch(PROFILE_URL);
    const data     = await response.json();
    renderProfile(data);
    autofillAge(data.age_hours);
  } catch {
    renderProfile({ exists: false });
  }
}

// ── Trend chart (item 4) ──────────────────────────────────────
function renderTrendChart(items) {
  const wrap = document.getElementById("trendChartWrap");
  const canvas = document.getElementById("trendCanvas");
  const xLabels = document.getElementById("trendXLabels");

  if (!wrap || !canvas || !xLabels) return;

  // Need at least 2 screenings for a trend
  if (!items || items.length < 2) {
    wrap.classList.add("hidden");
    return;
  }

  wrap.classList.remove("hidden");

  // Reverse so oldest is on left
  const ordered = [...items].reverse();

  const riskScore = (decision) => {
    if (decision === "URGENT_HOSPITAL_REVIEW")             return 3;
    if (decision === "SAME_DAY_CLINIC_REVIEW")             return 2;
    if (decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED") return 2;
    return 1;
  };

  const riskColor = (score) => {
    if (score === 3) return "#c0432a";
    if (score === 2) return "#e8973a";
    return "#5a8a6e";
  };

  const scores = ordered.map(i => riskScore(i.final_decision));
  const colors = scores.map(riskColor);

  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth || 320;
  const H      = 120;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const padL = 10, padR = 10, padT = 16, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = scores.length;

  const xPos = (i) => padL + (i / (n - 1)) * chartW;
  const yPos = (s) => padT + chartH - ((s - 1) / 2) * chartH;

  // Horizontal grid lines
  [1, 2, 3].forEach(s => {
    const y = yPos(s);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(74,44,24,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Gradient fill under line
  const grad = ctx.createLinearGradient(0, padT, 0, H);
  grad.addColorStop(0, "rgba(217,95,59,0.12)");
  grad.addColorStop(1, "rgba(217,95,59,0)");

  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(scores[0]));
  for (let i = 1; i < n; i++) {
    const xMid = (xPos(i - 1) + xPos(i)) / 2;
    ctx.bezierCurveTo(xMid, yPos(scores[i - 1]), xMid, yPos(scores[i]), xPos(i), yPos(scores[i]));
  }
  ctx.lineTo(xPos(n - 1), H - padB);
  ctx.lineTo(xPos(0), H - padB);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(scores[0]));
  for (let i = 1; i < n; i++) {
    const xMid = (xPos(i - 1) + xPos(i)) / 2;
    ctx.bezierCurveTo(xMid, yPos(scores[i - 1]), xMid, yPos(scores[i]), xPos(i), yPos(scores[i]));
  }
  ctx.strokeStyle = "rgba(217,95,59,0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  scores.forEach((s, i) => {
    ctx.beginPath();
    ctx.arc(xPos(i), yPos(s), 6, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = "#fffcf8";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // X labels
  xLabels.innerHTML = "";
  ordered.forEach((item, i) => {
    const label = document.createElement("span");
    label.className = "trend-x-label";
    label.style.left = xPos(i) + "px";
    if (item.created_at) {
      const d = new Date(item.created_at);
      label.textContent = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } else {
      label.textContent = `#${i + 1}`;
    }
    xLabels.appendChild(label);
  });
}

// ── History ───────────────────────────────────────────────────
function renderHistory(items) {
  const dashStatusValue = document.getElementById("dashStatusValue");
  const dashStatusSub   = document.getElementById("dashStatusSub");
  const dashStatusCard  = document.getElementById("dashStatusCard");

  if (!items || items.length === 0) {
    historyEmptyState?.classList.remove("hidden");
    historyList?.classList.add("hidden");
    if (dashStatusValue) dashStatusValue.textContent = t("dashboard.no_screening");
    if (dashStatusSub)   dashStatusSub.textContent   = "Run a screening to see your baby's latest result here.";
    return;
  }

  renderTrendChart(items);
  historyEmptyState?.classList.add("hidden");
  historyList?.classList.remove("hidden");
  if (historyList) historyList.innerHTML = "";

  const latest = items[0];
  const dm     = decisionMap[latest.final_decision] || { label: () => latest.final_decision, skin: "status-green" };

  if (dashStatusValue) dashStatusValue.textContent = dm.label();
  dashStatusCard?.classList.remove("status-red", "status-amber", "status-green");
  dashStatusCard?.classList.add(dm.skin);

  if (dashStatusSub && latest.created_at) {
    const date = new Date(latest.created_at).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric"
    });
    dashStatusSub.textContent = `Last checked ${date}. Tap to run a new screening.`;
  }

  const skinToColors = {
    "status-red":   { bg: "var(--rust-pale)",  border: "var(--rust)",       text: "var(--rust)"       },
    "status-amber": { bg: "var(--amber-pale)", border: "var(--amber)",      text: "var(--amber-dark)" },
    "status-green": { bg: "var(--sage-pale)",  border: "var(--sage-light)", text: "var(--sage)"       }
  };

  items.forEach((item, index) => {
    const itemDm   = decisionMap[item.final_decision] || { label: () => item.final_decision, skin: "status-green" };
    const colors   = skinToColors[itemDm.skin] || skinToColors["status-green"];
    const isFirst  = index === 0;

    let dateStr = "", timeStr = "";
    if (item.created_at) {
      const d = new Date(item.created_at);
      dateStr = d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
      timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    let ageStr = "";
    if (item.baby_age_hours != null) {
      const days  = Math.floor(item.baby_age_hours / 24);
      const hours = item.baby_age_hours % 24;
      ageStr = days > 0 ? `${days}d ${hours}h old` : `${hours}h old`;
    }

    const raw          = item.image_confidence;
    const confidenceStr= raw != null
      ? `${raw > 1 ? raw.toFixed(1) : (raw * 100).toFixed(1)}% confidence`
      : "";

    const predictionStr = item.image_prediction
      ? item.image_prediction.charAt(0).toUpperCase() + item.image_prediction.slice(1)
      : "";

    const card = document.createElement("div");
    card.className = `history-card ${isFirst ? "history-card-latest" : ""}`;
    card.innerHTML = `
      <div class="history-card-top">
        <div class="history-decision-badge" style="background:${colors.bg};border-color:${colors.border};color:${colors.text};">
          ${itemDm.label()}
        </div>
        ${isFirst ? `<div class="history-latest-tag">Latest</div>` : ""}
      </div>
      <div class="history-meta-row">
        <div class="history-meta-item">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          ${dateStr}
        </div>
        <div class="history-meta-item">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          ${timeStr}
        </div>
        ${ageStr ? `<div class="history-meta-item">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 12c0-2.485 2.015-4.5 4.5-4.5S11 9.515 11 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          ${ageStr}
        </div>` : ""}
      </div>
      ${predictionStr || confidenceStr ? `
      <div class="history-prediction-row">
        ${predictionStr ? `<span class="history-prediction-label">${predictionStr}</span>` : ""}
        ${confidenceStr ? `<span class="history-confidence">${confidenceStr}</span>` : ""}
      </div>` : ""}
      <div class="history-reason">${item.final_decision_reason || ""}</div>
    `;
    historyList?.appendChild(card);
  });
}

async function loadHistory() {
  try {
    const response = await fetch(HISTORY_URL);
    const data     = await response.json();
    renderHistory(data);
  } catch {
    renderHistory([]);
  }
}

async function loadDashboardData() {
  await loadProfile();
  await loadHistory();
}

// ── Voice guidance ────────────────────────────────────────────
let activeVoiceAudio = null;

const voiceAudioMap = {
  en:  "assets/audio/english.mp4",
  yo:  "assets/audio/yoruba.mp4",
  ha:  "assets/audio/hausa.mp4",
  ig:  "assets/audio/igbo.mp4",
  pcm: "assets/audio/pidgin.mp4"
};

function playVoiceGuidance() {
  if (activeVoiceAudio) {
    activeVoiceAudio.pause();
    activeVoiceAudio.currentTime = 0;
  }
  const audioPath = voiceAudioMap[currentLanguage] || voiceAudioMap.en;
  activeVoiceAudio = new Audio(audioPath);
  activeVoiceAudio.onplay  = () => { if (voiceStatus) voiceStatus.textContent = t("voice.playing"); };
  activeVoiceAudio.onended = () => { if (voiceStatus) voiceStatus.textContent = t("voice.ready"); };
  activeVoiceAudio.onerror = () => { if (voiceStatus) voiceStatus.textContent = "Audio file not found for this language."; };
  activeVoiceAudio.play().catch(() => {
    if (voiceStatus) voiceStatus.textContent = "Tap play again or check the audio file.";
  });
}

function stopVoiceGuidance() {
  if (activeVoiceAudio) {
    activeVoiceAudio.pause();
    activeVoiceAudio.currentTime = 0;
  }
  if (voiceStatus) voiceStatus.textContent = t("voice.stopped");
}

playVoiceBtn?.addEventListener("click", playVoiceGuidance);
stopVoiceBtn?.addEventListener("click", stopVoiceGuidance);

// ── Mobile result sheet ───────────────────────────────────────
function isMobile() {
  return window.innerWidth <= 768;
}

function openResultSheet() {
  if (!isMobile()) return;
  const resultCard = document.querySelector(".result-card");
  if (!resultCard || !resultSheetInner) return;
  resultSheetInner.innerHTML = "";
  resultSheetInner.appendChild(resultCard.cloneNode(true));
  resultSheetOverlay?.classList.remove("hidden");
  resultSheet?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => resultSheet?.classList.add("sheet-open"), 10);
}

function closeResultSheet() {
  resultSheet?.classList.remove("sheet-open");
  setTimeout(() => {
    resultSheetOverlay?.classList.add("hidden");
    resultSheet?.classList.add("hidden");
    document.body.style.overflow = "";
  }, 320);
}

resultSheetOverlay?.addEventListener("click", closeResultSheet);

// ── Init ──────────────────────────────────────────────────────
async function initializeApp() {
  if (languageSwitcher) languageSwitcher.value = currentLanguage;
  await loadTranslations(currentLanguage);
  setDefaultScreeningFormState();
  await loadDashboardData();
  setViewMode("parent");
  document.getElementById("dashStartCheckBtn")
    ?.addEventListener("click", () => showSection("screening"));
}

initializeApp();

// ── PWA service worker registration ───
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("JaundiCare: offline support active"))
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

// ── Push notification reminders (item 6) ─────────────────────
async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleFollowUpNotifications(profile) {
  if (!profile || !profile.date_of_birth || !profile.time_of_birth) return;

  const birthDt = new Date(`${profile.date_of_birth}T${profile.time_of_birth}`);
  const now     = Date.now();

  const reminders = [
    { dayOffset: 1,  message: "Day 1 check: Look at your baby's eyes, gums, and soles for yellowing." },
    { dayOffset: 2,  message: "Day 2-3 check: Check eyes, gums, palms and soles. Watch feeding closely." },
    { dayOffset: 7,  message: "Day 7 follow-up: Review feeding, weight and any persistent yellowing." },
    { dayOffset: 14, message: "Day 14: If jaundice is still present or worsening, seek medical advice today." }
  ];

  reminders.forEach(({ dayOffset, message }) => {
    const dueTime = birthDt.getTime() + dayOffset * 24 * 60 * 60 * 1000;
    const delay   = dueTime - now;

    // Only schedule future reminders
    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("JaundiCare follow-up reminder", {
            body: message,
            icon: "./assets/icons/icon-192.png",
            badge: "./assets/icons/icon-192.png",
            tag: `jaundicare-day-${dayOffset}`
          });
        }
      }, delay);
    }
  });
}

async function enableRemindersForProfile(profile) {
  const granted = await requestNotificationPermission();
  if (!granted) return;
  scheduleFollowUpNotifications(profile);
}

// ── CHW data export ──
async function getScreeningData() {
  try {
    const response = await fetch(HISTORY_URL);
    return await response.json();
  } catch {
    return [];
  }
}

function screeningsToCSV(items) {
  if (!items || items.length === 0) return "";

  const headers = [
    "Screening ID", "Date", "Baby Age (hours)",
    "Image Prediction", "Confidence (%)",
    "Raw Triage Level", "Final Decision", "Decision Reason",
    "Feeding", "Yellow Eyes", "Yellow Gums",
    "Yellow Palms", "Dark Urine", "Pale Stool",
    "Difficult to Wake", "Floppy", "Jaundice First 24h",
    "Jaundice Spreading", "Darker Skin"
  ];

  const rows = items.map(item => {
    const conf = item.image_confidence;
    const pct  = conf != null
      ? (conf > 1 ? conf.toFixed(2) : (conf * 100).toFixed(2))
      : "";

    return [
      item.screening_id   ?? "",
      item.created_at     ?? "",
      item.baby_age_hours ?? "",
      item.image_prediction ?? "",
      pct,
      item.raw_triage_level ?? "",
      item.final_decision   ?? "",
      `"${(item.final_decision_reason ?? "").replace(/"/g, "'")}"`,
      item.feeding          ?? "",
      item.yellow_eyes                 ? "Yes" : "No",
      item.yellow_gums                 ? "Yes" : "No",
      item.yellow_palms_or_soles       ? "Yes" : "No",
      item.dark_urine                  ? "Yes" : "No",
      item.pale_stool                  ? "Yes" : "No",
      item.difficult_to_wake           ? "Yes" : "No",
      item.floppy_or_unusually_drowsy  ? "Yes" : "No",
      item.jaundice_first_24h          ? "Yes" : "No",
      item.jaundice_spreading          ? "Yes" : "No",
      item.darker_skin_tone            ? "Yes" : "No"
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showExportSummary(items) {
  const summary = document.getElementById("exportSummary");
  if (!summary || !items.length) return;

  const urgent  = items.filter(i => i.final_decision === "URGENT_HOSPITAL_REVIEW").length;
  const sameDay = items.filter(i =>
    i.final_decision === "SAME_DAY_CLINIC_REVIEW" ||
    i.final_decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
  ).length;
  const monitor = items.length - urgent - sameDay;

  const oldest = items[items.length - 1]?.created_at
    ? new Date(items[items.length - 1].created_at).toLocaleDateString()
    : "N/A";
  const newest = items[0]?.created_at
    ? new Date(items[0].created_at).toLocaleDateString()
    : "N/A";

  summary.classList.remove("hidden");
  summary.innerHTML = `
    <div class="export-stat"><span>${items.length}</span><label>Total screenings</label></div>
    <div class="export-stat export-stat-red"><span>${urgent}</span><label>Urgent</label></div>
    <div class="export-stat export-stat-amber"><span>${sameDay}</span><label>Same-day</label></div>
    <div class="export-stat export-stat-green"><span>${monitor}</span><label>Monitor</label></div>
    <div class="export-range">${oldest} — ${newest}</div>
  `;
}

document.getElementById("exportCsvBtn")?.addEventListener("click", async () => {
  const items = await getScreeningData();
  if (!items.length) { showToast("No screening data to export."); return; }
  const csv  = screeningsToCSV(items);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(csv, `jaundicare-screenings-${date}.csv`, "text/csv");
  showExportSummary(items);
  showToast("CSV exported successfully.");
});

document.getElementById("exportJsonBtn")?.addEventListener("click", async () => {
  const items = await getScreeningData();
  if (!items.length) { showToast("No screening data to export."); return; }
  const date = new Date().toISOString().split("T")[0];
  downloadFile(JSON.stringify(items, null, 2), `jaundicare-screenings-${date}.json`, "application/json");
  showExportSummary(items);
  showToast("JSON exported successfully.");
});

/* ============================================================
   Camera guidance, Skin tone, Onboarding,
   Caregiver handoff, Follow-up loop closure
   ============================================================ */

// ── 1: Camera guidance & image quality check ─────────────
imageInput?.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) {
    imagePreview?.classList.add("hidden");
    if (imagePreview) imagePreview.src = "";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  if (imagePreview) {
    imagePreview.src = objectUrl;
    imagePreview.classList.remove("hidden");
  }

  // Analyse image quality
  analyseImageQuality(file);
});

function analyseImageQuality(file) {
  const bar     = document.getElementById("imageQualityBar");
  const fill    = document.getElementById("qualityFill");
  const text    = document.getElementById("qualityText");
  const tip     = document.getElementById("cameraTip");

  if (!bar || !fill || !text) return;

  const img = new Image();
  img.onload = () => {
    const canvas  = document.createElement("canvas");
    const maxDim  = 200;
    const scale   = Math.min(maxDim / img.width, maxDim / img.height);
    canvas.width  = img.width  * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data      = imageData.data;

    // Calculate brightness and contrast as quality proxies
    let totalBrightness = 0;
    let min = 255, max = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
      totalBrightness += brightness;
      if (brightness < min) min = brightness;
      if (brightness > max) max = brightness;
    }

    const pixels     = data.length / 4;
    const avgBright  = totalBrightness / pixels;
    const contrast   = max - min;

    // Score 0-100
    const brightScore   = avgBright > 60 && avgBright < 220 ? 50 : avgBright > 40 ? 30 : 10;
    const contrastScore = contrast > 60 ? 50 : contrast > 30 ? 30 : 10;
    const score         = Math.min(100, brightScore + contrastScore);

    bar.classList.remove("hidden");
    fill.style.width = score + "%";

    if (score >= 80) {
      fill.style.background = "var(--sage)";
      text.textContent = "Good quality";
      text.style.color = "var(--sage)";
      if (tip) tip.textContent = "Good image — ready to submit";
      updateCameraChecks(true, true, true);
    } else if (score >= 50) {
      fill.style.background = "var(--amber)";
      text.textContent = "Acceptable — natural light would improve accuracy";
      text.style.color = "var(--amber-dark)";
      if (tip) tip.textContent = "Try better lighting for a more accurate result";
      updateCameraChecks(false, true, true);
    } else {
      fill.style.background = "var(--rust)";
      text.textContent = "Too dark or blurry — please retake";
      text.style.color = "var(--rust)";
      if (tip) tip.textContent = "Image too dark — move to natural light";
      updateCameraChecks(false, false, false);
    }

    URL.revokeObjectURL(img.src);
  };

  img.src = URL.createObjectURL(file);
}

function updateCameraChecks(light, focus, eyes) {
  const checkLight = document.getElementById("checkLight");
  const checkFocus = document.getElementById("checkFocus");
  const checkEyes  = document.getElementById("checkEyes");

  [
    [checkLight, light],
    [checkFocus, focus],
    [checkEyes,  eyes]
  ].forEach(([el, pass]) => {
    if (!el) return;
    el.classList.toggle("check-pass", pass);
    el.classList.toggle("check-fail", !pass);
  });
}

// ── 2: Skin tone calibration ─────────────────────────────
document.querySelectorAll('input[name="skin_tone_category"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const note = document.getElementById("skinToneNote");
    if (!note) return;

    const messages = {
      very_light:  "Standard detection sensitivity will be used.",
      light:       "Standard detection sensitivity will be used.",
      medium:      "Sensitivity adjusted slightly — checking gums and eyes is especially important.",
      medium_dark: "Higher sensitivity applied. Pay close attention to eyes, gums, and palms rather than skin colour.",
      dark:        "Maximum sensitivity applied. Skin colour alone is unreliable — focus entirely on eyes, gums, and palms."
    };

    note.textContent = messages[radio.value] || "";
    note.classList.remove("hidden");

    // Auto-check darker_skin_tone if medium dark or dark
    const darkerSkinCheckbox = document.querySelector('input[name="darker_skin_tone"]');
    if (darkerSkinCheckbox) {
      darkerSkinCheckbox.checked = ["medium_dark", "dark"].includes(radio.value);
    }
  });
});

// ── 3: Onboarding flow ───────────────────────────────────
function initOnboarding() {
  const overlay = document.getElementById("onboardingOverlay");
  if (!overlay) return;

  const seen = localStorage.getItem("jc_onboarded");
  if (seen) {
    overlay.classList.add("hidden");
    return;
  }

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function goToOnboardStep(stepNum) {
  document.querySelectorAll(".onboarding-step").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".onboard-dot").forEach(d => {
    d.classList.toggle("active", parseInt(d.dataset.step) === stepNum);
  });
  const step = document.getElementById(`onboardStep${stepNum}`);
  if (step) step.classList.add("active");
}

function finishOnboarding(role) {
  localStorage.setItem("jc_onboarded", "1");
  localStorage.setItem("jc_role", role || "parent");

  const overlay = document.getElementById("onboardingOverlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.style.opacity = "";
      document.body.style.overflow = "";
    }, 300);
  }

  // Direct health workers to CHW section
  if (role === "health_worker") {
    showSection("chw");
  } else {
    showSection("profile");
  }
}

// Onboarding next buttons
document.querySelectorAll(".onboarding-next").forEach(btn => {
  btn.addEventListener("click", () => {
    const next = parseInt(btn.dataset.next);
    goToOnboardStep(next);
  });
});

// Role selection
document.querySelectorAll(".onboarding-role-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".onboarding-role-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const role = btn.dataset.role;
    const title = document.getElementById("onboardStep3Title");
    const body  = document.getElementById("onboardStep3Body");
    const a1    = document.getElementById("onboardAction1");
    const a2    = document.getElementById("onboardAction2");
    const a3    = document.getElementById("onboardAction3");

    if (role === "health_worker") {
      if (title) title.textContent = "You are ready";
      if (body)  body.textContent  = "Go to Community Care Mode to start assisted screenings, manage follow-ups, and use the referral pathway.";
      if (a1) a1.textContent = "Open Community Care Mode";
      if (a2) a2.textContent = "Start an assisted screening";
      if (a3) a3.textContent = "Track follow-up reminders";
    } else {
      if (title) title.textContent = "You are all set";
      if (body)  body.textContent  = "Start by creating a baby profile so the app can track age automatically, then run your first screening.";
      if (a1) a1.textContent = "Create a baby profile";
      if (a2) a2.textContent = "Run a screening";
      if (a3) a3.textContent = "View your result and next steps";
    }

    // Store role for finish
    document.getElementById("onboardFinishBtn").dataset.role = role;
    goToOnboardStep(3);
  });
});

document.getElementById("onboardFinishBtn")?.addEventListener("click", (e) => {
  finishOnboarding(e.target.dataset.role || "parent");
});

initOnboarding();

// ── 4: Caregiver handoff QR ──────────────────────────────
document.getElementById("handoffBtn")?.addEventListener("click", async () => {
  const items = await getScreeningData();
  openHandoffModal(items);
});

document.getElementById("handoffClose")?.addEventListener("click", () => {
  document.getElementById("handoffModalOverlay")?.classList.add("hidden");
  document.body.style.overflow = "";
});

document.getElementById("handoffModalOverlay")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add("hidden");
    document.body.style.overflow = "";
  }
});

function openHandoffModal(items) {
  const overlay = document.getElementById("handoffModalOverlay");
  const summary = document.getElementById("handoffSummary");
  if (!overlay) return;

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const profile  = window._cachedProfile;
  const babyName = profile?.baby_name || "Baby";
  const latest   = items?.[0];

  // Build summary text
  const summaryText = buildHandoffText(profile, items);

  if (summary) {
    const dm = decisionMap[latest?.final_decision] || { label: () => latest?.final_decision || "No screening", skin: "status-green" };
    summary.innerHTML = `
      <div class="handoff-baby-name">${babyName}</div>
      <div class="handoff-status-badge ${dm.skin}">${dm.label()}</div>
      ${latest ? `<div class="handoff-date">Last screened: ${new Date(latest.created_at).toLocaleDateString(undefined, { day:"numeric", month:"long", year:"numeric" })}</div>` : ""}
      <div class="handoff-total">${items?.length || 0} screening(s) on record</div>
    `;
  }

  // Generate QR code using a simple canvas-based approach
  generateQRCode(summaryText);

  document.getElementById("handoffCopyBtn")?.addEventListener("click", () => {
    copyToClipboard(summaryText);
  }, { once: true });
}

function buildHandoffText(profile, items) {
  const babyName = profile?.baby_name || "Baby";
  const gestAge  = profile?.gestational_age_weeks ? `${profile.gestational_age_weeks} weeks gestational age` : "";
  const latest   = items?.[0];
  const dm       = decisionMap[latest?.final_decision];

  return `
JaundiCare — Caregiver Handoff Summary
═══════════════════════════════════════
Baby: ${babyName}
${gestAge}
Total screenings: ${items?.length || 0}

LATEST RESULT:
${dm ? dm.label() : latest?.final_decision || "No screening yet"}
${latest?.created_at ? `Date: ${new Date(latest.created_at).toLocaleDateString()}` : ""}
${latest?.image_prediction ? `AI prediction: ${latest.image_prediction}` : ""}
${latest?.final_decision_reason ? `Reason: ${latest.final_decision_reason}` : ""}

Please review the full screening history
in JaundiCare for detailed clinical data.
═══════════════════════════════════════
  `.trim();
}

function generateQRCode(text) {
  const canvas = document.getElementById("handoffQRCanvas");
  if (!canvas) return;

  // Simple visual placeholder QR — 
  // In production replace with qrcode.js library
  const size = 180;
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);

  // Draw a visual QR-like pattern using the text as seed
  ctx.fillStyle = "#1e0f06";
  const cellSize = 6;
  const cells    = Math.floor(size / cellSize);

  // Deterministic pattern from text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const seed = (hash ^ (r * 31 + c * 17)) & 1;
      if (seed || isQRPositionMarker(r, c, cells)) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  // White quiet zone corners to look like QR
  ctx.fillStyle = "#fff";
  [
    [0,0], [0,cells-7], [cells-7,0]
  ].forEach(([row, col]) => {
    ctx.fillRect(col * cellSize, row * cellSize, 7 * cellSize, 7 * cellSize);
  });

  // Position markers
  ctx.fillStyle = "#1e0f06";
  [[0,0],[0,cells-7],[cells-7,0]].forEach(([row, col]) => {
    ctx.fillRect(col*cellSize, row*cellSize, 7*cellSize, 7*cellSize);
    ctx.fillStyle = "#fff";
    ctx.fillRect((col+1)*cellSize, (row+1)*cellSize, 5*cellSize, 5*cellSize);
    ctx.fillStyle = "#1e0f06";
    ctx.fillRect((col+2)*cellSize, (row+2)*cellSize, 3*cellSize, 3*cellSize);
  });

  // Label
  ctx.fillStyle = "var(--coral)";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Show to health worker", size/2, size - 4);
}

function isQRPositionMarker(r, c, cells) {
  return (r < 7 && c < 7) ||
         (r < 7 && c >= cells - 7) ||
         (r >= cells - 7 && c < 7);
}

document.getElementById("handoffCopyBtn")?.addEventListener("click", () => {
  const profile = window._cachedProfile;
  getScreeningData().then(items => {
    copyToClipboard(buildHandoffText(profile, items));
  });
});

// ── 5: Follow-up loop closure ────────────────────────────
function checkFollowUpPrompt() {
  const lastResult = localStorage.getItem("jc_last_urgent_decision");
  const lastTime   = localStorage.getItem("jc_last_urgent_time");
  const dismissed  = localStorage.getItem("jc_followup_dismissed");

  if (!lastResult || dismissed) return;

  const isUrgent = lastResult === "URGENT_HOSPITAL_REVIEW" ||
                   lastResult === "SAME_DAY_CLINIC_REVIEW" ||
                   lastResult === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED";

  if (!isUrgent) return;

  // Show after 20 hours
  const elapsed = Date.now() - parseInt(lastTime || "0");
  if (elapsed < 20 * 60 * 60 * 1000) return;

  const modal = document.getElementById("followupModalOverlay");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

// Patch into renderResult — store urgent results
function storeFollowUpData(data) {
  const needsAction = [
    "URGENT_HOSPITAL_REVIEW",
    "SAME_DAY_CLINIC_REVIEW",
    "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
  ].includes(data.final_decision);

  if (needsAction) {
    localStorage.setItem("jc_last_urgent_decision", data.final_decision);
    localStorage.setItem("jc_last_urgent_time", Date.now().toString());
    localStorage.removeItem("jc_followup_dismissed");
  }
}

// Hook into screeningForm submit — call storeFollowUpData after successful result
// Add this call inside the try block of screeningForm submit after renderResult(data):
// storeFollowUpData(data); — add manually below renderResult(data) in the submit handler

document.querySelectorAll(".followup-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".followup-option").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

document.getElementById("followupSubmitBtn")?.addEventListener("click", () => {
  const selected = document.querySelector(".followup-option.selected");
  const outcome  = selected?.dataset.outcome || "unknown";
  const bilirubin= document.getElementById("bilirubinInput")?.value || null;

  // Store outcome locally
  const record = {
    outcome,
    bilirubin: bilirubin ? parseFloat(bilirubin) : null,
    recordedAt: new Date().toISOString()
  };

  const existing = JSON.parse(localStorage.getItem("jc_followup_outcomes") || "[]");
  existing.push(record);
  localStorage.setItem("jc_followup_outcomes", JSON.stringify(existing));
  localStorage.setItem("jc_followup_dismissed", "1");

  const modal = document.getElementById("followupModalOverlay");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";

  // If still concerned — push urgently to screening
  if (outcome === "still_concerned") {
    showToast("Please seek medical help today. Tap Start baby check to run a new screening.");
    setTimeout(() => showSection("screening"), 1500);
  } else {
    showToast("Thank you for the update. Continue monitoring your baby.");
  }
});

document.getElementById("followupDismissBtn")?.addEventListener("click", () => {
  localStorage.setItem("jc_followup_dismissed", "1");
  document.getElementById("followupModalOverlay")?.classList.add("hidden");
  document.body.style.overflow = "";
});

// Check follow-up prompt on app load
setTimeout(checkFollowUpPrompt, 2000);

// ── Accessibility ──────────────────────────────────────
function applyAccessibility() {
  // Landmark roles
  document.querySelector(".sidebar")?.setAttribute("role", "navigation");
  document.querySelector(".sidebar")?.setAttribute("aria-label", "Main navigation");
  document.querySelector(".main-content")?.setAttribute("role", "main");
  document.querySelector(".topbar")?.setAttribute("role", "banner");

  // Nav items
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.setAttribute("role", "menuitem");
  });

  // Section headings — ensure each section has an aria-labelledby
  document.querySelectorAll(".content-section").forEach(section => {
    const h = section.querySelector("h2, h3");
    if (h && !h.id) {
      h.id = `heading-${section.id}`;
      section.setAttribute("aria-labelledby", h.id);
    }
    section.setAttribute("role", "region");
  });

  // Form labels
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    const label = cb.closest("label");
    if (label && !cb.getAttribute("aria-label")) {
      const text = label.textContent.trim();
      if (text) cb.setAttribute("aria-label", text);
    }
  });

  // Buttons without visible text
  document.querySelectorAll("button:not([aria-label])").forEach(btn => {
    const text = btn.textContent.trim();
    if (!text || text.length < 2) {
      const title = btn.getAttribute("title");
      if (title) btn.setAttribute("aria-label", title);
    }
  });

  // Image preview alt
  const preview = document.getElementById("imagePreview");
  if (preview) preview.setAttribute("alt", "Uploaded baby photo for screening analysis");

  // Live region for results
  const resultContent = document.getElementById("resultContent");
  if (resultContent) {
    resultContent.setAttribute("aria-live", "polite");
    resultContent.setAttribute("aria-atomic", "false");
  }

  // Skip to content link — add programmatically
  if (!document.getElementById("skipToContent")) {
    const skip = document.createElement("a");
    skip.id   = "skipToContent";
    skip.href = "#dashboard";
    skip.className = "skip-link";
    skip.textContent = "Skip to content";
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // Focus management — trap focus in modals when open
  const modals = [
    "onboardingOverlay",
    "handoffModalOverlay",
    "followupModalOverlay"
  ];

  modals.forEach(id => {
    const modal = document.getElementById(id);
    if (!modal) return;

    const observer = new MutationObserver(() => {
      if (!modal.classList.contains("hidden")) {
        const firstFocusable = modal.querySelector(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
  });
}

// Run after init
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(applyAccessibility, 500);
});

/* ============================================================
   Caseload, Nomogram, Analytics, Accessibility
   ============================================================ */

// ── CHW Caseload management ──────────────────────────
function getCaseload() {
  return JSON.parse(localStorage.getItem("jc_caseload") || "[]");
}

function saveCaseload(cases) {
  localStorage.setItem("jc_caseload", JSON.stringify(cases));
}

function calculateAgeHours(dob, tob) {
  if (!dob || !tob) return null;
  try {
    const birth = new Date(`${dob}T${tob}`);
    const diff  = Date.now() - birth.getTime();
    return Math.max(0, Math.floor(diff / 3600000));
  } catch { return null; }
}

function renderCaseload() {
  const cases       = getCaseload();
  const list        = document.getElementById("caseloadList");
  const emptyState  = document.getElementById("caseloadEmpty");

  if (!list) return;

  if (cases.length === 0) {
    emptyState?.classList.remove("hidden");
    list.classList.add("hidden");
    return;
  }

  emptyState?.classList.add("hidden");
  list.classList.remove("hidden");
  list.innerHTML = "";

  cases.forEach((baby, index) => {
    const ageHours = calculateAgeHours(baby.dob, baby.tob);
    const ageDays  = ageHours != null ? Math.floor(ageHours / 24) : null;
    const ageStr   = ageDays != null
      ? (ageDays > 0 ? `Day ${ageDays}` : `${ageHours}h old`)
      : "Age unknown";

    // Determine follow-up urgency
    const followupDays = [1, 3, 7, 14];
    const nextFollowup = followupDays.find(d => ageDays != null && ageDays < d);
    const isOverdue    = ageDays != null && ageDays > 14;

    const card = document.createElement("div");
    card.className = "caseload-card";
    card.innerHTML = `
      <div class="caseload-card-top">
        <div class="caseload-baby-info">
          <div class="caseload-baby-name">${baby.name}</div>
          <div class="caseload-household">${baby.household || ""}</div>
        </div>
        <div class="caseload-age-badge ${isOverdue ? "overdue" : ""}">${ageStr}</div>
      </div>
      <div class="caseload-followup">
        ${nextFollowup != null
          ? `<span class="caseload-next-visit">Next follow-up: Day ${nextFollowup}</span>`
          : isOverdue
          ? `<span class="caseload-next-visit overdue-text">Follow-up period complete</span>`
          : `<span class="caseload-next-visit">Monitoring ongoing</span>`
        }
        ${baby.gestAge ? `<span class="caseload-gest">${baby.gestAge}wk gestation</span>` : ""}
      </div>
      <div class="caseload-actions">
        <button class="btn-primary caseload-screen-btn" data-index="${index}">
          Screen this baby
        </button>
        <button class="btn-clear caseload-remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });

  // Screen button — loads baby into profile and goes to screening
  document.querySelectorAll(".caseload-screen-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const baby = getCaseload()[parseInt(btn.dataset.index)];
      if (!baby) return;

      // Pre-fill age
      const ageInput = document.getElementById("age_hours");
      const ageHours = calculateAgeHours(baby.dob, baby.tob);
      if (ageInput && ageHours != null) ageInput.value = ageHours;

      showSection("screening");
      showToast(`Screening pre-filled for ${baby.name}`);
    });
  });

  // Remove button
  document.querySelectorAll(".caseload-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cases = getCaseload();
      cases.splice(parseInt(btn.dataset.index), 1);
      saveCaseload(cases);
      renderCaseload();
    });
  });
}

document.getElementById("addCaseBtn")?.addEventListener("click", () => {
  document.getElementById("addCaseForm")?.classList.toggle("hidden");
});

document.getElementById("cancelCaseBtn")?.addEventListener("click", () => {
  document.getElementById("addCaseForm")?.classList.add("hidden");
});

document.getElementById("saveCaseBtn")?.addEventListener("click", () => {
  const name      = document.getElementById("caseNameInput")?.value.trim();
  const household = document.getElementById("caseHouseholdInput")?.value.trim();
  const dob       = document.getElementById("caseDobInput")?.value;
  const tob       = document.getElementById("caseTobInput")?.value;
  const gestAge   = document.getElementById("caseGestInput")?.value;

  if (!name) { showToast("Please enter a baby name."); return; }
  if (!dob || !tob) { showToast("Please enter date and time of birth."); return; }

  const cases = getCaseload();
  cases.unshift({
    id:        Date.now().toString(),
    name,
    household,
    dob,
    tob,
    gestAge:   gestAge ? parseInt(gestAge) : null,
    addedAt:   new Date().toISOString()
  });

  saveCaseload(cases);
  renderCaseload();

  // Reset form
  ["caseNameInput","caseHouseholdInput","caseDobInput","caseTobInput","caseGestInput"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

  document.getElementById("addCaseForm")?.classList.add("hidden");
  showToast(`${name} added to caseload.`);
});

const chwSection = document.getElementById("chw");
if (chwSection) {
  new MutationObserver(() => {
    if (chwSection.classList.contains("active")) renderCaseload();
  }).observe(chwSection, { attributes: true, attributeFilter: ["class"] });
}

// ── Bilirubin nomogram ────────────────────────────────
let nomoUnit = "mgdl"; // or "umol"

// Bhutani nomogram zone boundaries (mg/dL) at key hours
// [hour, lowRiskThreshold, lowIntThreshold, highIntThreshold]
const bhutaniZones = [
  [0,   4,  5,  8],
  [12,  6,  8,  11],
  [24,  8,  10, 13],
  [36,  10, 12, 15],
  [48,  12, 15, 17],
  [60,  13, 16, 18],
  [72,  14, 17, 19],
  [84,  14, 17, 19.5],
  [96,  14, 17, 20],
  [120, 14, 17, 20],
  [144, 14, 17, 20],
  [168, 14, 17, 20]
];

function getBilirubin() {
  const raw = parseFloat(document.getElementById("nomoBilirubin")?.value);
  if (isNaN(raw)) return null;
  return nomoUnit === "umol" ? raw / 17.1 : raw; // convert µmol/L to mg/dL
}

function getZoneBoundaries(ageHours) {
  // Interpolate between data points
  let lower = bhutaniZones[0];
  let upper = bhutaniZones[bhutaniZones.length - 1];

  for (let i = 0; i < bhutaniZones.length - 1; i++) {
    if (ageHours >= bhutaniZones[i][0] && ageHours <= bhutaniZones[i+1][0]) {
      lower = bhutaniZones[i];
      upper = bhutaniZones[i+1];
      break;
    }
  }

  const t = lower[0] === upper[0] ? 0 :
    (ageHours - lower[0]) / (upper[0] - lower[0]);

  return {
    lowRisk:    lower[1] + (upper[1] - lower[1]) * t,
    lowInt:     lower[2] + (upper[2] - lower[2]) * t,
    highInt:    lower[3] + (upper[3] - lower[3]) * t
  };
}

function classifyZone(bili, ageHours, gestCategory) {
  const bounds = getZoneBoundaries(ageHours);

  // Adjust for preterm — lower thresholds
  const adjust = gestCategory === "late_preterm" ? 0.85
               : gestCategory === "early_preterm" ? 0.70
               : 1.0;

  const adj = {
    lowRisk:  bounds.lowRisk  * adjust,
    lowInt:   bounds.lowInt   * adjust,
    highInt:  bounds.highInt  * adjust
  };

  if (bili < adj.lowRisk)  return "low";
  if (bili < adj.lowInt)   return "low_intermediate";
  if (bili < adj.highInt)  return "high_intermediate";
  return "high";
}

function drawNomogramChart(plotBili, plotAge) {
  const canvas = document.getElementById("nomoCanvas");
  if (!canvas) return;

  const dpr   = window.devicePixelRatio || 1;
  const W     = canvas.parentElement.clientWidth - 40 || 340;
  const H     = 220;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const padL = 8, padR = 8, padT = 10, padB = 10;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  const maxHours = 168;
  const maxBili  = 22;

  const xScale = (h) => padL + (h / maxHours) * cW;
  const yScale = (b) => padT + cH - (b / maxBili) * cH;

  // Draw zone fills
  const zones = [
    { key: "low",              color: "rgba(90,138,110,0.15)",  upper: (h) => getZoneBoundaries(h).lowRisk,  lower: () => 0 },
    { key: "low_intermediate", color: "rgba(232,151,58,0.12)",  upper: (h) => getZoneBoundaries(h).lowInt,   lower: (h) => getZoneBoundaries(h).lowRisk },
    { key: "high_intermediate",color: "rgba(232,151,58,0.22)",  upper: (h) => getZoneBoundaries(h).highInt,  lower: (h) => getZoneBoundaries(h).lowInt },
    { key: "high",             color: "rgba(192,67,42,0.18)",   upper: () => maxBili,                        lower: (h) => getZoneBoundaries(h).highInt }
  ];

  zones.forEach(zone => {
    ctx.beginPath();
    bhutaniZones.forEach(([h], i) => {
      const x = xScale(h);
      const y = yScale(zone.upper(h));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    for (let i = bhutaniZones.length - 1; i >= 0; i--) {
      const [h] = bhutaniZones[i];
      ctx.lineTo(xScale(h), yScale(zone.lower(h)));
    }
    ctx.closePath();
    ctx.fillStyle = zone.color;
    ctx.fill();
  });

  // Draw zone boundary lines
  const lineColors = ["#5a8a6e", "#e8973a", "#c0432a"];
  const lineKeys   = ["lowRisk", "lowInt", "highInt"];

  lineColors.forEach((color, li) => {
    ctx.beginPath();
    bhutaniZones.forEach(([h], i) => {
      const x = xScale(h);
      const y = yScale(getZoneBoundaries(h)[lineKeys[li]]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });

  // Plot user's data point
  if (plotBili != null && plotAge != null) {
    const px = xScale(plotAge);
    const py = yScale(plotBili);

    // Pulse ring
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(217,95,59,0.18)";
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = var_color("--coral");
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Crosshairs
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(217,95,59,0.4)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px, padT);
    ctx.lineTo(px, padT + cH);
    ctx.moveTo(padL, py);
    ctx.lineTo(padL + cW, py);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function var_color(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#d95f3b";
}

// Unit toggle
document.querySelectorAll(".nomo-unit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nomo-unit-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    nomoUnit = btn.dataset.unit;
  });
});

document.getElementById("nomoCalcBtn")?.addEventListener("click", () => {
  const bili    = getBilirubin();
  const age     = parseFloat(document.getElementById("nomoAgeHours")?.value);
  const gestCat = document.getElementById("nomoGestAge")?.value || "term";

  if (bili == null || isNaN(bili)) { showToast("Please enter a bilirubin level."); return; }
  if (isNaN(age) || age < 0 || age > 168) { showToast("Please enter age between 0 and 168 hours."); return; }

  const zone = classifyZone(bili, age, gestCat);

  const zoneData = {
    low: {
      label:   "Low risk zone",
      color:   "zone-low",
      message: "Bilirubin level is in the low risk zone for this age. Continue monitoring and feeding regularly.",
      action:  "No immediate intervention needed. Recheck if baby develops warning signs."
    },
    low_intermediate: {
      label:   "Low intermediate risk zone",
      color:   "zone-low-int",
      message: "Bilirubin is in the low intermediate zone. This baby needs closer monitoring.",
      action:  "Arrange follow-up within 24 hours. Ensure feeding is adequate and watch for worsening."
    },
    high_intermediate: {
      label:   "High intermediate risk zone",
      color:   "zone-high-int",
      message: "Bilirubin is in the high intermediate zone. This requires same-day medical review.",
      action:  "Seek same-day review with a doctor or paediatrician. Do not delay if baby shows any warning signs."
    },
    high: {
      label:   "High risk zone",
      color:   "zone-high",
      message: "Bilirubin is in the high risk zone. This baby needs urgent medical attention.",
      action:  "Go to hospital immediately. This level may require phototherapy or further treatment."
    }
  };

  const zd      = zoneData[zone];
  const result  = document.getElementById("nomoResult");
  const badge   = document.getElementById("nomoZoneBadge");
  const message = document.getElementById("nomoZoneMessage");
  const action  = document.getElementById("nomoZoneAction");

  if (result)  result.classList.remove("hidden");
  if (badge)   { badge.textContent = zd.label; badge.className = `nomo-result-zone ${zd.color}`; }
  if (message) message.textContent = zd.message;
  if (action)  action.textContent  = zd.action;

  drawNomogramChart(bili, age);
  result?.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Draw empty nomogram on section open
const nomogramSection = document.getElementById("nomogram");
if (nomogramSection) {
  new MutationObserver(() => {
    if (nomogramSection.classList.contains("active")) {
      setTimeout(() => drawNomogramChart(null, null), 100);
    }
  }).observe(nomogramSection, { attributes: true, attributeFilter: ["class"] });
}

// ── Population analytics dashboard ────────────────────
async function loadAnalytics() {
  const items = await getScreeningData();
  if (!items || items.length === 0) {
    showToast("No screening data available yet.");
    return;
  }

  const urgent  = items.filter(i => i.final_decision === "URGENT_HOSPITAL_REVIEW");
  const sameDay = items.filter(i =>
    i.final_decision === "SAME_DAY_CLINIC_REVIEW" ||
    i.final_decision === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
  );
  const monitor = items.filter(i =>
    !["URGENT_HOSPITAL_REVIEW","SAME_DAY_CLINIC_REVIEW","RECHECK_SOON_OR_CLINIC_IF_CONCERNED"]
      .includes(i.final_decision)
  );

  // Stats
  document.getElementById("statTotal")?.textContent   !== undefined &&
    (document.getElementById("statTotal").textContent   = items.length);
  document.getElementById("statUrgent")?.textContent  !== undefined &&
    (document.getElementById("statUrgent").textContent  = urgent.length);
  document.getElementById("statSameDay")?.textContent !== undefined &&
    (document.getElementById("statSameDay").textContent = sameDay.length);
  document.getElementById("statMonitor")?.textContent !== undefined &&
    (document.getElementById("statMonitor").textContent = monitor.length);

  // Donut chart
  drawDonut(urgent.length, sameDay.length, monitor.length);

  // Confidence distribution
  drawConfidenceChart(items);

  // Age bar chart
  drawAgeBarChart(items);

  // Timeline
  drawTimelineChart(items);

  // Report text
  generateAnalyticsReport(items, urgent, sameDay, monitor);
}

function drawDonut(u, s, m) {
  const canvas = document.getElementById("donutCanvas");
  const center = document.getElementById("donutCenter");
  if (!canvas) return;

  const ctx   = canvas.getContext("2d");
  const total = u + s + m;
  if (!total) return;

  const cx = 90, cy = 90, r = 70, inner = 44;
  ctx.clearRect(0, 0, 180, 180);

  const slices = [
    { value: u, color: "#c0432a" },
    { value: s, color: "#e8973a" },
    { value: m, color: "#5a8a6e" }
  ];

  let startAngle = -Math.PI / 2;
  slices.forEach(slice => {
    if (!slice.value) return;
    const angle = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    startAngle += angle;
  });

  // Inner circle (donut hole)
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = "#fdf8f2";
  ctx.fill();

  if (center) {
    center.innerHTML = `<strong>${total}</strong><span>total</span>`;
  }
}

function drawConfidenceChart(items) {
  const wrap = document.getElementById("confidenceWrap");
  if (!wrap) return;

  const buckets = { "90-100%": 0, "70-89%": 0, "50-69%": 0, "<50%": 0 };

  items.forEach(item => {
    const raw = item.image_confidence;
    if (raw == null) return;
    const pct = raw > 1 ? raw : raw * 100;
    if (pct >= 90)      buckets["90-100%"]++;
    else if (pct >= 70) buckets["70-89%"]++;
    else if (pct >= 50) buckets["50-69%"]++;
    else                buckets["<50%"]++;
  });

  const max = Math.max(...Object.values(buckets), 1);

  wrap.innerHTML = Object.entries(buckets).map(([label, count]) => `
    <div class="conf-bar-row">
      <span class="conf-bar-label">${label}</span>
      <div class="conf-bar-track">
        <div class="conf-bar-fill" style="width:${(count/max)*100}%"></div>
      </div>
      <span class="conf-bar-count">${count}</span>
    </div>
  `).join("");
}

function drawAgeBarChart(items) {
  const canvas = document.getElementById("ageBarCanvas");
  if (!canvas) return;

  const buckets = { "0-24h": 0, "24-48h": 0, "48-72h": 0, "72-96h": 0, "96h+": 0 };

  items.forEach(item => {
    const h = item.baby_age_hours;
    if (h == null) return;
    if (h < 24)       buckets["0-24h"]++;
    else if (h < 48)  buckets["24-48h"]++;
    else if (h < 72)  buckets["48-72h"]++;
    else if (h < 96)  buckets["72-96h"]++;
    else              buckets["96h+"]++;
  });

  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth || 300;
  const H      = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx    = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const labels = Object.keys(buckets);
  const values = Object.values(buckets);
  const max    = Math.max(...values, 1);
  const barW   = (W - 40) / labels.length;
  const padB   = 28;

  values.forEach((val, i) => {
    const barH = ((val / max) * (H - padB - 10));
    const x    = 20 + i * barW + barW * 0.15;
    const y    = H - padB - barH;

    ctx.fillStyle = "rgba(217,95,59,0.75)";
    ctx.beginPath();
    ctx.roundRect?.(x, y, barW * 0.7, barH, 4) ||
      ctx.rect(x, y, barW * 0.7, barH);
    ctx.fill();

    ctx.fillStyle = "#8a6a54";
    ctx.font = `${10 * dpr / dpr}px Outfit, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barW * 0.35, H - 8);

    if (val > 0) {
      ctx.fillStyle = "#4a2c18";
      ctx.fillText(val, x + barW * 0.35, y - 4);
    }
  });
}

function drawTimelineChart(items) {
  const canvas = document.getElementById("timelineCanvas");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.clientWidth || 300;
  const H   = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const sorted = [...items].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (sorted.length < 2) {
    ctx.fillStyle = "#8a6a54";
    ctx.font = "13px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Need 2+ screenings for timeline", W/2, H/2);
    return;
  }

  const padL = 10, padR = 10, padT = 14, padB = 28;
  const cW   = W - padL - padR;
  const cH   = H - padT - padB;

  const times  = sorted.map(i => new Date(i.created_at).getTime());
  const minT   = times[0];
  const maxT   = times[times.length - 1];
  const tRange = maxT - minT || 1;

  const xPos = (t) => padL + ((t - minT) / tRange) * cW;
  const riskY = (d) => {
    if (d === "URGENT_HOSPITAL_REVIEW") return padT + cH * 0.1;
    if (d === "SAME_DAY_CLINIC_REVIEW" || d === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED") return padT + cH * 0.4;
    return padT + cH * 0.75;
  };

  const riskColor = (d) => {
    if (d === "URGENT_HOSPITAL_REVIEW") return "#c0432a";
    if (d === "SAME_DAY_CLINIC_REVIEW" || d === "RECHECK_SOON_OR_CLINIC_IF_CONCERNED") return "#e8973a";
    return "#5a8a6e";
  };

  // Grid lines
  [0.1, 0.4, 0.75].forEach(yFrac => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(74,44,24,0.07)";
    ctx.setLineDash([3, 3]);
    ctx.moveTo(padL, padT + cH * yFrac);
    ctx.lineTo(W - padR, padT + cH * yFrac);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Connect line
  ctx.beginPath();
  sorted.forEach((item, i) => {
    const x = xPos(times[i]);
    const y = riskY(item.final_decision);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "rgba(74,44,24,0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dots
  sorted.forEach((item, i) => {
    const x = xPos(times[i]);
    const y = riskY(item.final_decision);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = riskColor(item.final_decision);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Y labels
  const yLabels = [
    { label: "Urgent",   y: padT + cH * 0.1  },
    { label: "Same-day", y: padT + cH * 0.4  },
    { label: "Monitor",  y: padT + cH * 0.75 }
  ];

  ctx.fillStyle = "#8a6a54";
  ctx.font = "9px Outfit, sans-serif";
  ctx.textAlign = "left";
  yLabels.forEach(({ label, y }) => ctx.fillText(label, 0, y + 3));
}

function generateAnalyticsReport(items, urgent, sameDay, monitor) {
  const report = document.getElementById("analyticsReport");
  if (!report) return;

  const now  = new Date().toLocaleDateString(undefined, { day:"numeric", month:"long", year:"numeric" });
  const pct  = (n) => items.length ? `${Math.round((n/items.length)*100)}%` : "0%";

  const avgConf = items.reduce((sum, i) => {
    const raw = i.image_confidence;
    return sum + (raw != null ? (raw > 1 ? raw : raw * 100) : 0);
  }, 0) / (items.length || 1);

  report.textContent = `
JaundiCare — Screening Analytics Report
Generated: ${now}
══════════════════════════════════════════

SUMMARY
Total screenings recorded:  ${items.length}
Urgent (hospital review):   ${urgent.length} (${pct(urgent.length)})
Same-day clinic review:     ${sameDay.length} (${pct(sameDay.length)})
Monitor at home:            ${monitor.length} (${pct(monitor.length)})

AI MODEL PERFORMANCE
Average confidence score:   ${avgConf.toFixed(1)}%

RISK BREAKDOWN
${urgent.length > 0  ? `⚠  ${urgent.length} screening(s) required urgent hospital review` : ""}
${sameDay.length > 0 ? `⚠  ${sameDay.length} screening(s) required same-day clinic review` : ""}
${monitor.length > 0 ? `✓  ${monitor.length} screening(s) were suitable for home monitoring` : ""}

══════════════════════════════════════════
Generated by JaundiCare
AI-powered newborn jaundice screening
  `.trim();
}

document.getElementById("refreshAnalyticsBtn")?.addEventListener("click", loadAnalytics);

document.getElementById("copyReportBtn")?.addEventListener("click", () => {
  const text = document.getElementById("analyticsReport")?.textContent;
  if (text) copyToClipboard(text);
});

// Load analytics when section opens
const analyticsSection = document.getElementById("analytics");
if (analyticsSection) {
  new MutationObserver(() => {
    if (analyticsSection.classList.contains("active")) loadAnalytics();
  }).observe(analyticsSection, { attributes: true, attributeFilter: ["class"] });
}