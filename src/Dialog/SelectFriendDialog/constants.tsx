import {Colors} from 'react-native-ui-lib';
import {t} from '../../languages/i18n';

export const options = [
  {label: t('all_friend'), value: 'all'},
  {label: t('custom_list'), value: 'custom_list'},
  {label: t('manual'), value: 'manual'},
];

export const stylesSelected = {
  borderWidth: 2,
  borderColor: Colors.primary,
  borderRadius: 99,
  padding: 2,
};
