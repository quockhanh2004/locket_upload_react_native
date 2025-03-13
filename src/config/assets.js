import {Assets} from 'react-native-ui-lib';

export const AssetsInit = () => {
  Assets.loadAssetsGroup('icons', {
    ic_eye: require('../assets/icons/ic_eye.png'),
    ic_eye_hide: require('../assets/icons/ic_eye_hide.png'),
    ic_cancel: require('../assets/icons/cancel.png'),
    ic_logout: require('../assets/icons/ic_logout.png'),
    ic_add: require('../assets/icons/ic_add.png'),
    ic_back: require('../assets/icons/ic_back.png'),
    ic_edit: require('../assets/icons/ic_edit.png'),
    ic_github: require('../assets/icons/ic_github.png'),
  });
};
