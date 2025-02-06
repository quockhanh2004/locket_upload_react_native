/* eslint-disable no-undef */
import RNFS from 'react-native-fs';
import {decode as atob} from 'base-64';

export async function createBlobFromUri(fileInfo) {
  console.log(fileInfo);
  
  try {
    const {uri, type} = fileInfo;

    if (!uri || !type) {
      console.log(uri, type);

      console.error('Invalid file info: URI or type is missing');
      return null;
    }
    const blob = await readFileAsBytes(fileInfo);

    return {blob, fileSize: fileInfo.size};
  } catch (error) {
    console.error('Error creating blob from URI:', error);
    return null;
  }
}

const readFileAsBytes = async file => {
  try {
    const fileContent = await RNFS.readFile(file.uri, 'base64'); // Đọc file dưới dạng base64
    const byteArray = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)); // Chuyển base64 thành byte array
    return byteArray;
  } catch (err) {
    console.error('Error reading file:', err);
  }
};
