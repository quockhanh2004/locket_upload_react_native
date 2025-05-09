/* eslint-disable no-useless-escape */
import axios, {AxiosProgressEvent} from 'axios';
import {uploadHeaders} from './constrain';
import RNFS from 'react-native-fs';
import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {t} from '../languages/i18n';

export const UPLOAD_PROGRESS_STAGE = {
  PROCESSING_IMAGE: t('processing_image'), // Xử lý ảnh (resize, convert, v.v.)
  INITIATING_UPLOAD: t('initiating_upload'), // Khởi tạo link upload
  UPLOADING: t('uploading_image'), // Đang tải lên
  FETCHING_DOWNLOAD_URL: t('fetching_download_url'), // Lấy link download
  CREATING_MOMENT: t('creating_moment'), // Tạo moment
  COMPLETED: t('upload_complete'), // Hoàn tất
  FAILED: t('upload_failed'), // Thất bại
};

export const initiateUpload = async (
  idUser: string,
  idToken: string,
  fileSize: number,
  nameImg: string,
  progress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<string> => {
  const startUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}?uploadType=resumable&name=users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}`;

  const startHeaders = {
    'content-type': 'application/json; charset=UTF-8',
    authorization: `Bearer ${idToken}`,
    'x-goog-upload-protocol': 'resumable',
    accept: '*/*',
    'x-goog-upload-command': 'start',
    'x-goog-upload-content-length': fileSize,
    'accept-language': 'vi-VN,vi;q=0.9',
    'x-firebase-storage-version': 'ios/10.13.0',
    'user-agent':
      'com.locket.Locket/1.43.1 iPhone/17.3 hw/iPhone15_3 (GTMSUF/1)',
    'x-goog-upload-content-type': 'image/webp',
    'x-firebase-gmpid': '1:641029076083:ios:cc8eb46290d69b234fa609',
  };

  const startData = JSON.stringify({
    name: `users/${idUser}/moments/thumbnails/${nameImg}`,
    contentType: 'image/*',
    bucket: '',
    metadata: {creator: idUser, visibility: 'private'},
  });

  const response = await axios.post(startUrl, startData, {
    headers: startHeaders,
    validateStatus: status => status < 500,
    onDownloadProgress: progress,
  });

  if (response.status >= 400) {
    throw new Error(`Error: ${response?.statusText}`);
  }

  return response.headers['x-goog-upload-url'];
};

export const uploadImage = async (
  uploadUrl: string,
  blobImage: Uint8Array<ArrayBuffer> | undefined,
  token: string,
  progress?: (progressEvent: AxiosProgressEvent) => void,
) => {
  const response = await axios.put(uploadUrl, blobImage, {
    headers: {
      ...uploadHeaders,
      Authorization: 'Firebase ' + token,
    },
    onUploadProgress: progress,
  });
  return response.data;
};

export const getDownloadUrl = async (
  idUser: string,
  idToken: string,
  nameImg: string,
  progress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<string> => {
  const getUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}`;

  const getHeaders = {
    'content-type': 'application/json; charset=UTF-8',
    authorization: `Bearer ${idToken}`,
  };

  const response = await axios.get(getUrl, {
    headers: getHeaders,
    onUploadProgress: progress,
  });

  if (response.status >= 400) {
    throw new Error(`Error: Get failed - ${response?.data}`);
  }

  const downloadToken = response.data.downloadTokens;
  return `${getUrl}?alt=media&token=${downloadToken}`;
};

export const resizeImage = async (
  uri: string,
): Promise<{uri: string} | null> => {
  if (!uri) {
    return null;
  }
  FFmpegKitConfig.disableLogs();

  const inputPath = uri.replace('file://', '');
  const outputPath = `${RNFS.CachesDirectoryPath}/resized_${Date.now()}.jpg`;

  const ffmpegCommand = `-y -i "${inputPath}" -vf "crop='if(gt(in_w\,in_h)\,in_h\,in_w)':'if(gt(in_w\,in_h)\,in_h\,in_w)':(in_w-if(gt(in_w\\,in_h)\\,in_h\\,in_w))/2:(in_h-if(gt(in_w\\,in_h)\\,in_h\\,in_w))/2,scale=1020:1020" -q:v 5 "${outputPath}"`;

  const session = await FFmpegKit.execute(ffmpegCommand);
  const returnCode = await session.getReturnCode();

  if (!returnCode?.isValueSuccess()) {
    console.error('❌ Resize image failed');
    return null;
  }

  return {uri: `file://${outputPath}`};
};

export const clearAppCache = async () => {
  try {
    const cacheDir = RNFS.CachesDirectoryPath; // Đường dẫn đến thư mục cache

    // Kiểm tra xem thư mục cache có tồn tại không
    const exists = await RNFS.exists(cacheDir);
    if (!exists) {
      console.log('Thư mục cache không tồn tại.');
      return;
    }

    // Xóa thư mục cache (và tất cả file/thư mục con)
    await RNFS.unlink(cacheDir); // Hoặc RNFS.rmdir(cacheDir) nếu muốn xóa thư mục rỗng.
    console.log('Đã xóa thư mục cache.');

    // Tạo lại thư mục cache (nếu cần)
    await RNFS.mkdir(cacheDir);
    console.log('Đã tạo lại thư mục cache.');
  } catch (error) {
    console.error('Lỗi khi xóa cache:', error);
    // Xử lý lỗi
  }
};
