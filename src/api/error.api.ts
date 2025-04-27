import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export const uploadLogToServer = async (
  logFilePath: string,
  filename: string,
) => {
  const uri = Platform.OS === 'android' ? `file://${logFilePath}` : logFilePath;
  const cleanPath = logFilePath.replace('file://', '');

  const exists = await RNFS.exists(cleanPath);
  if (!exists) {
    throw new Error('File không tồn tại');
  }

  const formData = new FormData();

  formData.append('files', {
    uri,
    name: filename ?? 'log.txt',
    type: 'text/plain',
  } as any);

  const response = await fetch('https://file.quockhanh020924.id.vn/logs', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload log failed: ${response.status} - ${text}`);
  }

  return await response.json();
};
