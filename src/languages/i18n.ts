import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en.json';
import vi from './vi.json';
import {Language} from '../models/language.model';

const resources = {
  en: {translation: en},
  vi: {translation: vi},
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: Language.VI,
    fallbackLng: Language.VI,
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => console.log('i18n initialized'));

export default i18n;
export const t = i18n.t.bind(i18n);
