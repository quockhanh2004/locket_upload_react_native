import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {requestCameraPermission} from './permission';
import {requestMediaPermission} from './permission';

export const selectMedia = async isMultiple => {
  try {
    await requestMediaPermission();
    const result = await launchImageLibrary({
      mediaType: 'mixed', // Chọn chỉ ảnh
      quality: 1, // Chất lượng ảnh (0.0 - 1.0)
      selectionLimit: isMultiple ? 4 : 1, // 0 cho phép chọn nhiều ảnh
    });
    if (result.didCancel) {
      return undefined;
    }

    return result.assets || [];
  } catch (error) {
    console.log('error select image', error);
    return undefined;
  }
};

export const takePhoto = async () => {
  try {
    await requestCameraPermission();
    const result = await launchCamera({
      mediaTypes: 'photo',
      quality: 1,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      return result.assets;
    }
  } catch (error) {
    console.log('Error taking photo', error);
  }
  return null;
};
