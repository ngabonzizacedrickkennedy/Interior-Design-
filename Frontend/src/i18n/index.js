import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enMarketing from "./locales/en/marketing.json";
import enAuth from "./locales/en/auth.json";
import enPortal from "./locales/en/portal.json";
import enStaff from "./locales/en/staff.json";

import frCommon from "./locales/fr/common.json";
import frMarketing from "./locales/fr/marketing.json";
import frAuth from "./locales/fr/auth.json";
import frPortal from "./locales/fr/portal.json";
import frStaff from "./locales/fr/staff.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        marketing: enMarketing,
        auth: enAuth,
        portal: enPortal,
        staff: enStaff,
      },
      fr: {
        common: frCommon,
        marketing: frMarketing,
        auth: frAuth,
        portal: frPortal,
        staff: frStaff,
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    ns: ["common", "marketing", "auth", "portal", "staff"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "sdg_language",
    },
  });

export default i18n;
