import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
export const hapticFeedback = () => {
  ReactNativeHapticFeedback.trigger('keyboardTap', {
    ignoreAndroidSystemSettings: false,
  });
};
