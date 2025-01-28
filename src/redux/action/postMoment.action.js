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
import {loginHeader} from '../../util/header';

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

      const uploadUrl = await initiateUpload(
        idUser,
        currentToken,
        fileSize,
        nameImg,
      );

      await uploadImage(uploadUrl, image, currentToken);

      const downloadUrl = await getDownloadUrl(idUser, currentToken, nameImg);
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
            ...loginHeader,
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );
      if (response.status === 200) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response?.data?.error?.message}`,
            type: 'Error',
          }),
        );
        throw new Error('Post failed with status other than 200');
      }
    } catch (error) {
      const refresh = await getAccessToken({
        refreshToken: refreshToken,
      });
      thunkApi.dispatch(
        setToken({
          access_token: refresh.access_token,
          refresh_token: refresh.refresh_token,
        }),
      );
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(
            error?.response?.data?.error || error.message,
          )}`,
          type: 'Error',
        }),
      );
      return thunkApi.rejectWithValue();
    }
  },
);
