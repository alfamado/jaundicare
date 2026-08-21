/**
 * Translations for browser-only controls. These mirror the native app's
 * concise onboarding and authentication wording, but live in the web bundle
 * so a Vercel deployment never depends on the mobile source directory.
 */
export const uiTranslations = {
  en: {
    ui: {
      auth: {
        welcome: "Welcome to JaundiCare",
        phone_title: "Enter your phone number",
        phone_number: "Phone number",
        phone_intro: "Enter your phone number to get started. We'll send you a verification code.",
        invalid_phone: "Enter a valid 11-digit Nigerian phone number starting with 0.",
        send_code: "Send verification code",
        phone_privacy: "Your phone number is used only for verification. We never share it with third parties.",
        enter_code: "Enter verification code",
        sent_code: "We sent a 6-digit code to",
        verifying: "Verifying…",
        resend: "Use a different number",
        network_error: "Network error. Please check your connection.",
      },
      onboarding: {
        choose_language: "Choose your language",
        tap_audio: "Tap to hear a welcome message",
        continue: "Continue",
        parent: "Parent or caregiver",
        health_worker: "Health worker or CHW",
        safety: "This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.",
      },
      legal: {
        privacy: "Privacy Notice",
        terms: "Terms of Use",
        back: "Back to JaundiCare",
      },
      company: {
        address: "Business address",
        product_of: "A product of",
      },
    },
  },
  yo: {
    ui: {
      auth: {
        welcome: "Káàbọ̀ sí JaundiCare",
        phone_title: "Tẹ nọ́mbà fóònù rẹ sílẹ̀",
        phone_number: "Nọ́mbà fóònù",
        phone_intro: "Tẹ nọ́mbà fóònù rẹ sílẹ̀ láti bẹ̀rẹ̀. A ó fi kóòdù ìmúdájú ránṣẹ́ sí ọ.",
        invalid_phone: "Tẹ nọ́mbà fóònù ilẹ̀ Nàìjíríà tó pé, tó bẹ̀rẹ̀ pẹ̀lú 0, sílẹ̀.",
        send_code: "Fi kóòdù ìmúdájú ránṣẹ́",
        phone_privacy: "A ń lo nọ́mbà fóònù rẹ fún ìmúdájú nìkan. A kì í pín in fún ẹlòmíràn.",
        enter_code: "Tẹ kóòdù ìmúdájú sílẹ̀",
        sent_code: "A ti fi kóòdù oní-nọ́mbà 6 ránṣẹ́ sí",
        verifying: "Ń jẹ́rìísí…",
        resend: "Lo nọ́mbà mìíràn",
        network_error: "Ìsopọ̀ ayélujára kò ṣiṣẹ́. Jọ̀wọ́ ṣàyẹ̀wò ìsopọ̀ rẹ.",
      },
      onboarding: {
        choose_language: "Yan èdè rẹ",
        tap_audio: "Fọwọ́ kan láti gbọ́ ìfiranṣẹ́ ìkíni",
        continue: "Tẹ̀síwájú",
        parent: "Òbí tàbí olùtọ́jú",
        health_worker: "Òṣìṣẹ́ ìlera tàbí CHW",
        safety: "Èyí jẹ́ irinṣẹ́ ìrànlọ́wọ́ fún ayẹ̀wò. Kò lè rọ́pò dókítà, agbẹbi, tàbí àyẹ̀wò bilirubin.",
      },
      legal: {
        privacy: "Àkíyèsí nípa àṣírí",
        terms: "Àwọn òfin ìlò",
        back: "Padà sí JaundiCare",
      },
      company: {
        address: "Àdírẹ́sì ilé iṣẹ́",
        product_of: "Ọjà tí",
      },
    },
  },
  ha: {
    ui: {
      auth: {
        welcome: "Barka da zuwa JaundiCare",
        phone_title: "Shigar da lambar wayarka",
        phone_number: "Lambar waya",
        phone_intro: "Shigar da lambar wayarka don farawa. Za mu turo maka da lambar tabbatarwa.",
        invalid_phone: "Shigar da ingantacciyar lambar Najeriya mai lambobi 11 da ta fara da 0.",
        send_code: "Aika lambar tabbatarwa",
        phone_privacy: "Ana amfani da lambar wayarka ne kawai don tabbatarwa. Ba ma raba ta da wasu.",
        enter_code: "Shigar da lambar tabbatarwa",
        sent_code: "Mun tura lambar lambobi 6 zuwa",
        verifying: "Ana tabbatarwa…",
        resend: "Yi amfani da wata lamba",
        network_error: "Matsalar hanyar sadarwa. Da fatan a duba haɗinka.",
      },
      onboarding: {
        choose_language: "Zaɓi harshenka",
        tap_audio: "Danna don jin saƙon maraba",
        continue: "Ci gaba",
        parent: "Uba, uwa ko mai kula",
        health_worker: "Ma'aikacin lafiya ko CHW",
        safety: "Wannan kayan aikin taimakon gwaji ne. Ba ya maye gurbin likita, ungozoma, ko gwajin bilirubin.",
      },
      legal: {
        privacy: "Bayanin sirri",
        terms: "Sharuɗɗan amfani",
        back: "Koma JaundiCare",
      },
      company: {
        address: "Adireshin kasuwanci",
        product_of: "Samfuri ne na",
      },
    },
  },
  ig: {
    ui: {
      auth: {
        welcome: "Nnọọ na JaundiCare",
        phone_title: "Tinye nọmba ekwentị gị",
        phone_number: "Nọmba ekwentị",
        phone_intro: "Tinye nọmba ekwentị gị ka ịmalite. Anyị ga-ezitere gị koodu nkwado.",
        invalid_phone: "Tinye nọmba Naịjirịa ziri ezi nke nwere ọnụọgụ 11 ma bido na 0.",
        send_code: "Zipu koodu nkwado",
        phone_privacy: "A na-eji nọmba ekwentị gị naanị maka nkwado. Anyị anaghị ekekọrịta ya na ndị ọzọ.",
        enter_code: "Tinye koodu nkwado",
        sent_code: "Anyị zigara koodu mkpụrụ ọnụọgụ 6 na",
        verifying: "Na-akwado…",
        resend: "Jiri nọmba ọzọ",
        network_error: "Nsogbu netwọkụ. Biko lelee njikọ gị.",
      },
      onboarding: {
        choose_language: "Họrọ asụsụ gị",
        tap_audio: "Pịa ka ịnụ ozi nnabata",
        continue: "Gaa n'ihu",
        parent: "Nne, nna ma ọ bụ onye nlekọta",
        health_worker: "Onye ọrụ ahụike ma ọ bụ CHW",
        safety: "Nke a bụ ngwaọrụ enyemaka nyocha. Ọ naghị dochie dọkịta, onye midwife, ma ọ bụ nnwale bilirubin.",
      },
      legal: {
        privacy: "Ọkwa nzuzo",
        terms: "Usoro ojiji",
        back: "Laghachi na JaundiCare",
      },
      company: {
        address: "Adreesị azụmahịa",
        product_of: "Ngwaahịa nke",
      },
    },
  },
  pcm: {
    ui: {
      auth: {
        welcome: "Welcome to JaundiCare",
        phone_title: "Put your phone number",
        phone_number: "Phone number",
        phone_intro: "Put your phone number make you fit start. We go send verification code give you.",
        invalid_phone: "Put correct 11-digit Naija phone number wey start with 0.",
        send_code: "Send verification code",
        phone_privacy: "Na only to verify you we dey use your phone number. We no dey share am with anybody.",
        enter_code: "Put verification code",
        sent_code: "We don send 6-digit code go",
        verifying: "We dey verify am…",
        resend: "Use another number",
        network_error: "Network no connect. Abeg check your connection.",
      },
      onboarding: {
        choose_language: "Choose your language",
        tap_audio: "Tap am make you hear welcome message",
        continue: "Continue",
        parent: "Parent or person wey dey care for pikin",
        health_worker: "Health worker or CHW",
        safety: "Na screening support tool be this. E no fit replace doctor, midwife, or bilirubin test.",
      },
      legal: {
        privacy: "Privacy notice",
        terms: "Terms of use",
        back: "Go back to JaundiCare",
      },
      company: {
        address: "Business address",
        product_of: "Na product of",
      },
    },
  },
};
