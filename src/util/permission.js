import {PermissionsAndroid, Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const requestMediaPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13 (API level 33) trở lên
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      } else if (Platform.Version >= 13) {
        // Android từ 13 đến 32
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }
      // Android < 13 không cần xin quyền
    }
    // iOS và các platform khác không cần yêu cầu quyền media
    return true;
  } catch (err) {
    console.warn(err);
    return false; // Trả về false nếu có lỗi xảy ra
  }
};

export const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // Yêu cầu quyền cho Android
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
        return true;
      } else {
        console.log('Camera permission denied');
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // Yêu cầu quyền cho iOS
      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);

      if (cameraStatus === RESULTS.GRANTED) {
        console.log('Camera permission granted');
        return true;
      } else {
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
        if (requestStatus === RESULTS.GRANTED) {
          console.log('Camera permission granted after request');
          return true;
        }
        console.log('Camera permission denied after request');
        return false;
      }
    } else {
      console.log('Not Android or IOS');
      return false;
    }
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};
