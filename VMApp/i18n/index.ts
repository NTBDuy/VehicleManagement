import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en-US/translation.json";
import translationVI from "./locales/vi-VN/translation.json";

const resources = {
  "en-US": { translation: translationEN },
  "vi-VN": { translation: translationVI }
};

i18next.use(initReactI18next).init({
  lng: "en-US",
  debug: true,
  resources
});
