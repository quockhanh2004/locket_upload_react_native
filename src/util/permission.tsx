/* eslint-disable @typescript-eslint/no-unused-vars */
import {PermissionsAndroid, Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Camera} from 'react-native-vision-camera';

export const requestMediaPermission = async (): Promise<boolean> => {
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

export const requestCameraPermission = async (): Promise<boolean> => {
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

      const micro = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      // = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
      // );
      console.log('sdk: ' + Platform.Version);
      let manager_file;
      if (Platform.Version >= 33) {
        manager_file = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
      } else if (Platform.Version >= 30) {
        manager_file = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
        );
      } else {
        manager_file = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }

      if (
        granted === PermissionsAndroid.RESULTS.GRANTED &&
        micro === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        console.log('Camera permission denied');
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // Yêu cầu quyền cho iOS
      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);

      if (cameraStatus === RESULTS.GRANTED) {
        return true;
      } else {
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
        if (requestStatus === RESULTS.GRANTED) {
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

export const checkPermissions = async () => {
  await Camera.getCameraPermissionStatus();

  // Kiểm tra và yêu cầu quyền cho cả camera và microphone (Android)
  if (Platform.OS === 'android') {
    try {
      await check(PERMISSIONS.ANDROID.CAMERA);
      await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    } catch (err) {
      console.warn('Error requesting permissions:', err);
    }
  }
};
