import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {requestMediaPermission} from './permission.ts';

export const selectMedia = async (
  isMultiple?: boolean,
): Promise<Array<Asset> | undefined> => {
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

    return result.assets;
  } catch (error) {
    console.error('error select image', error);
    return undefined;
  }
};
