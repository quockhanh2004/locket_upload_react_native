import {resetIcon, setIcon} from 'react-native-app-icon-changer';

type AliasName = 'AlternativeIcon' | 'Default';

export const switchAppIcon = (aliasName: AliasName) => {
  console.log(`Switching app icon to: ${aliasName}`);
  if (aliasName === 'Default') {
    resetIcon();
    return;
  }
  setIcon('AlternativeIcon');
};
