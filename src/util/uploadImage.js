import axios from 'axios';
import {uploadHeaders} from './header';
import {createBlobFromUri} from './getBufferFile';

export const UPLOAD_PROGRESS_STAGE = {
  PROCESSING_IMAGE: 'Processing image', // Xử lý ảnh (resize, convert, v.v.)
  INITIATING_UPLOAD: 'Initiating upload', // Khởi tạo link upload
  UPLOADING: 'Uploading image', // Đang tải lên
  FETCHING_DOWNLOAD_URL: 'Fetching download URL', // Lấy link download
  CREATING_MOMENT: 'Creating moment', // Tạo moment
  COMPLETED: 'Upload completed', // Hoàn tất
  FAILED: 'Upload failed', // Thất bại
};

export const validateImageInfo = imageInfo => {
  if (!imageInfo) {
    throw new Error('No image info provided');
  }
  return;
};

export const createImageBlob = async imageInfo => {
  const {blob: image} = await createBlobFromUri(imageInfo);
  //nếu file size lớn hơn 1mb thì trả lỗi
  if (imageInfo.fileSize > 1024 * 1024) {
    throw new Error('Image size is too large');
  }

  if (!image) {
    throw new Error('Failed to create Blob');
  }
  return {image, fileSize: imageInfo.fileSize};
};

export const initiateUpload = async (
  idUser,
  idToken,
  fileSize,
  nameImg,
  progress,
) => {
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

export const uploadImage = async (uploadUrl, blobImage, token, progress) => {
  const response = await axios.put(uploadUrl, blobImage, {
    headers: {
      ...uploadHeaders,
      Authorization: 'Firebase ' + token,
    },
    onUploadProgress: progress,
  });
  return response.data;
};

export const getDownloadUrl = async (idUser, idToken, nameImg, progress) => {
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

import ImageResizer from 'react-native-image-resizer';
export const resizeImage = async uri => {
  if (!uri) return null;

  try {
    const maxSize = 1020;
    const maxFileSize = 1048576; // 1MB in bytes

    // Lấy thông tin về file ảnh
    const fileInfo = await RNFS.stat(uri.replace('file://', ''));
    const originalFileSize = fileInfo.size;

    let resizedImage;

    if (originalFileSize > maxFileSize) {
      // Giảm kích thước file nếu vượt quá giới hạn
      const compressFormat = 'WEBP'; // Sử dụng WEBP để giảm dung lượng
      let compressQuality = 100; // Chất lượng ban đầu (có thể điều chỉnh)
      let newWidth = maxSize;
      let newHeight = maxSize;

      do {
        resizedImage = await ImageResizer.createResizedImage(
          uri,
          newWidth,
          newHeight,
          compressFormat,
          compressQuality,
          0,
        );

        const resizedFileInfo = await RNFS.stat(
          resizedImage.uri.replace('file://', ''),
        );
        console.log(resizedFileInfo.size, compressQuality);

        if (resizedFileInfo.size <= maxFileSize) break; // Thoát vòng lặp nếu kích thước file đạt yêu cầu
        // Nếu kích thước vẫn lớn hơn 1MB, giảm chất lượng
        compressQuality -= 1;
      } while (compressQuality > 20 && newWidth > 200 && newHeight > 200); // Điều kiện dừng: quality > 20 và size ảnh > 200x200
      //Nếu sau khi giảm kích thước và chất lượng mà vẫn chưa được thì xử lý ở đây
    } else {
      // Nếu file nhỏ hơn 1MB, resize bình thường
      resizedImage = await ImageResizer.createResizedImage(
        uri,
        maxSize,
        maxSize,
        'PNG', // Giữ nguyên định dạng PNG nếu kích thước file nhỏ
        100, // Chất lượng ảnh
        0,
      );
    }

    return resizedImage;
  } catch (error) {
    console.error('Lỗi khi resize ảnh:', error);
    // Xử lý lỗi và trả về null hoặc throw error
    return null;
  }
};

import RNFS from 'react-native-fs';
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
