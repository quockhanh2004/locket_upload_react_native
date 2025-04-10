// components/SelectFriendDialog/constants.ts
import {Colors} from 'react-native-ui-lib';

export const options = [
  {label: 'All Friend', value: 'all'},
  {label: 'Custom list', value: 'custom_list'},
  {label: 'Manual', value: 'manual'},
];

export const stylesSelected = {
  borderWidth: 2,
  borderColor: Colors.primary,
  borderRadius: 99,
  padding: 2,
};
