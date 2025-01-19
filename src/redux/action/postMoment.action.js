import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {setMessage} from '../slice/message.slice';
import {setToken} from '../slice/user.slice';
import {getAccessToken} from '../../api/user.api';
import {
  createImageBlob,
  getDownloadUrl,
  initiateUpload,
  uploadImage,
  validateImageInfo,
} from '../../util/uploadImage';

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
