import {Assets} from 'react-native-ui-lib';

export const AssetsInit = () => {
  Assets.loadAssetsGroup('icons', {
    ic_eye: require('../assets/icons/ic_eye.png'),
    ic_eye_hide: require('../assets/icons/ic_eye_hide.png'),
    ic_cancel: require('../assets/icons/cancel.png'),
    ic_logout: require('../assets/icons/ic_logout.png'),
    ic_add: require('../assets/icons/ic_add.png'),
  });
};
