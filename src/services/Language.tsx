import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import i18n from '../languages/i18n';

export const LanguageService = () => {
  const currentLanguage = useSelector(
    (state: RootState) => state.language.language,
  );

  useEffect(() => {
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  return null;
};
