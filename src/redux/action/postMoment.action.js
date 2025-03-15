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
import {
  compressVideo,
  cretateBody,
  getDownloadVideoUrl,
  getInfoVideo,
  getVideoThumbnail,
  initiateUploadVideo,
  UPLOAD_VIDEO_PROGRESS_STAGE,
  uploadVideo,
} from '../../util/uploadVideo';
import {readFileAsBytes} from '../../util/getBufferFile';

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

export const uploadVideoToFirebase = createAsyncThunk(
  'upload-video',
  async (data, thunkApi) => {
    const {idUser, idToken, videoInfo, caption} = data;
    thunkApi.dispatch(
      setMessage({
        message: `${UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING}`,
        type: 'Info',
        hideButton: true,
        progress: 0,
      }),
    );
    const newVideo = await compressVideo(videoInfo.uri, null, progress => {
      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING,
          progress: progress * 100,
        }),
      );
    });

    const videoBlob = await readFileAsBytes(newVideo);
    // return;

    const nameVideo = `${Date.now()}_vtd182.mp4`;

    thunkApi.dispatch(
      setProgressUpload({
        state: UPLOAD_VIDEO_PROGRESS_STAGE.INITIATING_UPLOAD,
        progress: 10,
      }),
    );

    try {
      const uploadUrl = await initiateUploadVideo(
        idUser,
        idToken,
        newVideo.size,
        nameVideo,
      );

      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING,
          progress: 26,
        }),
      );

      await uploadVideo(uploadUrl, videoBlob, idToken);

      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_VIDEO_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          progress: 48,
        }),
      );

      const downloadVideoUrl = await getDownloadVideoUrl(
        idUser,
        idToken,
        nameVideo,
      );
      console.log('downloadVideoUrl', downloadVideoUrl);

      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING_THUMBNAIL,
          progress: 60,
        }),
      );

      const thumbnailUrl = await uploadThumbnail(
        videoInfo.uri,
        idToken,
        idUser,
      );
      console.log('thumbnail url', thumbnailUrl);

      thunkApi.dispatch(
        setProgressUpload({
          state: UPLOAD_VIDEO_PROGRESS_STAGE.CREATING_MOMENT,
          progress: 88,
        }),
      );

      const postHeaders = {
        'content-type': 'application/json',
        authorization: `Bearer ${idToken}`,
      };

      const bodyPostMoment = cretateBody(
        caption,
        thumbnailUrl,
        downloadVideoUrl,
      );

      const response = await axios.post(
        'https://api.locketcamera.com/postMomentV2',
        bodyPostMoment,
        {headers: postHeaders},
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
      }
    } catch (error) {
      console.log(error);

      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(
            error?.response?.data?.error || error.message,
          )}`,
          type: 'Error',
        }),
      );
    }
  },
);

const uploadThumbnail = async (uriVideo, idToken, idUser) => {
  const thumbnail = await getVideoThumbnail(uriVideo);
  const nameThumbnail = `${Date.now()}_vtd182.jpg`;

  const upload_url = await initiateUpload(
    idUser,
    idToken,
    thumbnail.size,
    nameThumbnail,
  );

  await uploadImage(upload_url, thumbnail, idToken);

  const downloadUrl = await getDownloadUrl(idUser, idToken, nameThumbnail);
  return downloadUrl;
};
