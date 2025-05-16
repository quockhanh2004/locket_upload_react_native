/* eslint-disable curly */
import {PermissionsAndroid, Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Camera} from 'react-native-vision-camera';

export const requestMediaPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const sdk = Platform.Version;

      if (sdk >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (sdk >= 30) {
        // Android 11–12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // Android < 11 (API 30) không cần quyền hoặc xử lý tùy app
    }

    // iOS hoặc platform khác
    return true;
  } catch (err) {
    console.warn('requestMediaPermission error:', err);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const sdk = Platform.Version;

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

      let filePermission: any | null = null;

      if (sdk >= 33) {
        filePermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      } else if (sdk >= 30) {
        // Kiểm tra xem permission có tồn tại trước khi gọi
        filePermission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      } else {
        filePermission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      }

      if (filePermission) {
        const grantedFile = await PermissionsAndroid.request(filePermission);
        console.log('File permission granted:', grantedFile);
      }

      if (
        granted === PermissionsAndroid.RESULTS.GRANTED &&
        micro === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        console.log('Camera or mic permission denied');
        return false;
      }
    } else if (Platform.OS === 'ios') {
      const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraStatus === RESULTS.GRANTED) return true;

      const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
      return requestStatus === RESULTS.GRANTED;
    }

    return false;
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
