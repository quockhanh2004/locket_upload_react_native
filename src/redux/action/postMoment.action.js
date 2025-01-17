import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {setMessage} from '../slice/message.slice';
import {uploadHeaders} from '../../util/header';
import {createBlobFromUri} from '../../util/getBufferFile';
import {setToken} from '../slice/user.slice';
import {getAccessToken} from '../../api/user.api';

const validateImageInfo = (imageInfo, thunkApi) => {
  if (!imageInfo) {
    thunkApi.dispatch(
      setMessage({message: 'No image info provided', type: 'Error'}),
    );
    return false;
  }
  return true;
};

const createImageBlob = async (imageInfo, thunkApi) => {
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

const initiateUpload = async (idUser, idToken, fileSize, nameImg) => {
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

const uploadImage = async (uploadUrl, blobImage) => {
  const response = await axios.put(uploadUrl, blobImage, {
    headers: uploadHeaders,
    validateStatus: status => status < 500,
  });

  if (response.status >= 400) {
    throw new Error(`Error: Upload failed - ${JSON.stringify(response.data)}`);
  }
};

const getDownloadUrl = async (idUser, idToken, nameImg) => {
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

export const uploadImageToFirebaseStorage = createAsyncThunk(
  'uploadImage',
  async (data, thunkApi) => {
    const {idUser, idToken, imageInfo, caption, refreshToken} = data;
    let currentToken = idToken;
    try {
      if (!validateImageInfo(imageInfo, thunkApi)) {
        return thunkApi.rejectWithValue();
      }

      const {image, fileSize} = await createImageBlob(imageInfo, thunkApi);
      const nameImg = `${Date.now()}_vtd182.webp`;

      const tryUpload = async token => {
        try {
          const uploadUrl = await initiateUpload(
            idUser,
            token,
            fileSize,
            nameImg,
          );

          await uploadImage(uploadUrl, image);

          const downloadUrl = await getDownloadUrl(idUser, token, nameImg);
          const bodyPostMoment = {
            data: {
              caption,
              thumbnail_url: downloadUrl,
              recipients: [],
            },
          };
          const response = await axios.post(
            'https://api.locketcamera.com/postMomentV2',
            bodyPostMoment,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.status === 200) {
            console.log(response.data);
            return response.data;
          } else {
            thunkApi.dispatch(
              setMessage({
                message: `Error: ${response?.data?.error?.message}`,
                type: 'Error',
              }),
            );
            throw new Error('Post failed with status other than 200'); // Throw error to exit tryUpload
          }
        } catch (error) {
          if (error.message.includes('403')) {
            const newToken = await getAccessToken({
              refreshToken,
            });
            thunkApi.dispatch(setToken(newToken));
            currentToken = newToken.id_token;
            //retry with new token
            throw new Error('Retry with new token');
          } else {
            throw error; //rethrow
          }
        }
      };

      let success = false;
      let result;
      try {
        result = await tryUpload(currentToken);
        success = true;
      } catch (error) {
        if (error.message === 'Retry with new token') {
          try {
            result = await tryUpload(currentToken);
            success = true;
          } catch (retryError) {
            thunkApi.dispatch(
              setMessage({
                message: `Error: ${
                  retryError?.response?.data?.error?.message ||
                  retryError.message
                }`,
                type: 'Error',
              }),
            );
            return thunkApi.rejectWithValue();
          }
        } else {
          thunkApi.dispatch(
            setMessage({
              message: `Error: ${
                error?.response?.data?.error?.message || error.message
              }`,
              type: 'Error',
            }),
          );
          return thunkApi.rejectWithValue();
        }
      }

      if (success) {
        return result;
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${
            error?.response?.data?.error?.message || error.message
          }`,
          type: 'Error',
        }),
      );
      return thunkApi.rejectWithValue();
    }
  },
);
