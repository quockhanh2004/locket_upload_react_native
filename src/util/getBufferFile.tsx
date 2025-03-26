import RNFS from 'react-native-fs';
import {decode as atob} from 'base-64';

export const readFileAsBytes = async (
  uri: string,
): Promise<Uint8Array<ArrayBuffer> | undefined> => {
  try {
    const fileContent = await RNFS.readFile(uri, 'base64'); // Đọc file dưới dạng base64
    const byteArray = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)); // Chuyển base64 thành byte array
    return byteArray;
  } catch (err) {
    console.error('Error reading file:', err);
  }
};
