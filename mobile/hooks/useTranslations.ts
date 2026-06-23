/**
 * JaundiCare — useTranslations hook
 * Loads the correct language JSON and exposes a t() function.
 * Mirrors the loadTranslations / t() logic from the web app.js.
 */

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../store/appStore";

// Import all language files statically so they bundle with the app
// (no network request needed — works offline)
const translations: Record<string, Record<string, string>> = {
  en:  require("../i18n/en.json"),
  yo:  require("../i18n/yo.json"),
  ha:  require("../i18n/ha.json"),
  ig:  require("../i18n/ig.json"),
  pcm: require("../i18n/pcm.json"),
};

export function useTranslations() {
  const language    = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>(
    translations[language] ?? translations.en
  );

  useEffect(() => {
    setCurrentTranslations(translations[language] ?? translations.en);
  }, [language]);

  // t() returns the translation for a key, or the key itself if missing
  const t = useCallback(
    (key: string): string => currentTranslations[key] ?? key,
    [currentTranslations]
  );

  const switchLanguage = useCallback(
    (lang: string) => {
      if (translations[lang]) setLanguage(lang);
    },
    [setLanguage]
  );

  return { t, language, switchLanguage };
}