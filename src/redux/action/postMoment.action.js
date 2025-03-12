import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {setMessage} from '../slice/message.slice';
import {setToken} from '../slice/user.slice';
import {getAccessToken} from '../../api/user.api';
import {
  createImageBlob,
  getDownloadUrl,
  initiateUpload,
  UPLOAD_PROGRESS_STAGE,
  uploadImage,
  validateImageInfo,
} from '../../util/uploadImage';
import {loginHeader} from '../../util/header';
import {setProgressUpload} from '../slice/postMoment.slice';

export const uploadImageToFirebaseStorage = createAsyncThunk(
  'uploadImage',
  async (data, thunkApi) => {
    const {idUser, idToken, imageInfo, caption, refreshToken} = data;
    let currentToken = idToken;
    try {
      // xử lý ảnh
      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_PROGRESS_STAGE.PROCESSING_IMAGE,
          progress: 0,
        }),
      );
      validateImageInfo(imageInfo);
      const {image, fileSize} = await createImageBlob(imageInfo);
      const nameImg = `${Date.now()}_vtd182.webp`;

      //khởi tạo upload
      setTimeout(() => {
        thunkApi.dispatch(
          setProgressUpload({
            state: UPLOAD_PROGRESS_STAGE.INITIATING_UPLOAD,
            progress: 24,
          }),
        );
      }, 100);
      const uploadUrl = await initiateUpload(
        idUser,
        currentToken,
        fileSize,
        nameImg,
      );

      //upload ảnh
      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_PROGRESS_STAGE.UPLOADING,
          progress: 42,
        }),
      );
      await uploadImage(uploadUrl, image, currentToken);

      //lấy link download ảnh
      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          progress: 66,
        }),
      );
      const downloadUrl = await getDownloadUrl(idUser, currentToken, nameImg);

      // tạo moment
      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
          progress: 80,
        }),
      );
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
        thunkApi.dispatch(
          setProgressUpload({
            state: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
            progress: 100,
          }),
        );
        setTimeout(() => {
          thunkApi.dispatch(setProgressUpload(null));
          return response.data;
        }, 400);
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
