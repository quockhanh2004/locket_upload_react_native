import axios from 'axios';
import {uploadHeaders} from './header';
import {setMessage} from '../redux/slice/message.slice';
import {createBlobFromUri} from './getBufferFile';

export const validateImageInfo = (imageInfo, thunkApi) => {
  if (!imageInfo) {
    thunkApi.dispatch(
      setMessage({message: 'No image info provided', type: 'Error'}),
    );
    return false;
  }
  return true;
};

export const createImageBlob = async (imageInfo, thunkApi) => {
  const {blob: image, fileSize} = await createBlobFromUri(imageInfo);
  if (!image) {
    thunkApi.dispatch(
      setMessage({
        message: 'Failed to create Blob from image info',
        type: 'Error',
      }),
    );
    throw new Error('Failed to create Blob');
  }
  return {image, fileSize};
};

export const initiateUpload = async (idUser, idToken, fileSize, nameImg) => {
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
  });

  if (response.status >= 400) {
    throw new Error(`Error: ${response?.statusText}`);
  }

  return response.headers['x-goog-upload-url'];
};

export const uploadImage = async (uploadUrl, blobImage, token) => {
  const response = await axios.put(uploadUrl, blobImage, {
    headers: {
      ...uploadHeaders,
      Authorization: 'Firebase ' + token,
    },
  });
  return response.data;
};

export const getDownloadUrl = async (idUser, idToken, nameImg) => {
  const getUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}`;

  const getHeaders = {
    'content-type': 'application/json; charset=UTF-8',
    authorization: `Bearer ${idToken}`,
  };

  const response = await axios.get(getUrl, {
    headers: getHeaders,
  });

  if (response.status >= 400) {
    throw new Error(`Error: Get failed - ${response?.data}`);
  }

  const downloadToken = response.data.downloadTokens;
  return `${getUrl}?alt=media&token=${downloadToken}`;
};
