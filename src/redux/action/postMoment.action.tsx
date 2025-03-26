import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {setMessage} from '../slice/message.slice';
import {setToken} from '../slice/user.slice';
import {getAccessToken} from '../../api/user.api';
import {
  getDownloadUrl,
  initiateUpload,
  UPLOAD_PROGRESS_STAGE,
  uploadImage,
} from '../../util/uploadImage';
import {loginHeader} from '../../util/header';
import {
  compressVideo,
  cretateBody,
  getDownloadVideoUrl,
  getVideoThumbnail,
  initiateUploadVideo,
  UPLOAD_VIDEO_PROGRESS_STAGE,
  uploadVideo,
} from '../../util/uploadVideo';
import {readFileAsBytes} from '../../util/getBufferFile';

interface DataPostMoment {
  idUser: string;
  idToken: string;
  imageInfo?: any;
  caption: string;
  refreshToken: string;
  videoInfo?: any;
}

export const uploadImageToFirebaseStorage = createAsyncThunk(
  'uploadImage',
  async (data: DataPostMoment, thunkApi) => {
    const {idUser, idToken, imageInfo, caption, refreshToken} = data;
    let currentToken = idToken;
    try {
      // xử lý ảnh
      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.PROCESSING_IMAGE,
          type: 'info',
          hideButton: true,
          progress: 0,
        }),
      );

      const imageBlob = await readFileAsBytes(imageInfo);
      if (!imageBlob) {
        throw new Error('Failed to read file');
      }
      const fileSize = imageBlob.byteLength;

      const nameImg = `${Date.now()}_vtd182.webp`;

      //khởi tạo upload
      setTimeout(() => {
        thunkApi.dispatch(
          setMessage({
            message: UPLOAD_PROGRESS_STAGE.INITIATING_UPLOAD,
            type: 'info',
            hideButton: true,
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
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.UPLOADING,
          type: 'info',
          hideButton: true,
          progress: 42,
        }),
      );
      await uploadImage(uploadUrl, imageBlob, currentToken);

      //lấy link download ảnh
      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          type: 'info',
          hideButton: true,
          progress: 66,
        }),
      );
      const downloadUrl = await getDownloadUrl(idUser, currentToken, nameImg);

      // tạo moment
      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
          type: 'info',
          hideButton: true,
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

      if (response.status < 400) {
        thunkApi.dispatch(
          setMessage({
            message: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
            type: 'info',
            hideButton: true,
            progress: 100,
          }),
        );
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
    } catch (error: any) {
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
      return thunkApi.rejectWithValue(
        error?.response?.data?.error || error.message,
      );
    }
  },
);

export const uploadVideoToFirebase = createAsyncThunk(
  'upload-video',
  async (data: DataPostMoment, thunkApi) => {
    const {idUser, idToken, videoInfo, caption} = data;
    thunkApi.dispatch(
      setMessage({
        message: `${UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING}`,
        type: 'info',
        hideButton: true,
        progress: 0,
      }),
    );

    const newVideo = await compressVideo(
      videoInfo,
      id => {
        console.log('cancel id', id);
      },
      progress => {
        thunkApi.dispatch(
          setMessage({
            message: UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING,
            type: 'info',
            hideButton: true,
            progress: progress * 100,
          }),
        );
      },
    );

    const videoBlob = await readFileAsBytes(newVideo.uri);

    if (!videoBlob) {
      thunkApi.dispatch(
        setMessage({
          message: 'Error read video file',
          type: 'Error',
        }),
      );
      throw new Error('Error read video file');
    }

    const nameVideo = `${Date.now()}_vtd182.mp4`;

    thunkApi.dispatch(
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.INITIATING_UPLOAD,
        type: 'info',
        hideButton: true,
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
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING,
          type: 'info',
          hideButton: true,
          progress: 26,
        }),
      );

      await uploadVideo(uploadUrl, videoBlob, idToken);

      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          type: 'info',
          hideButton: true,
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
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING_THUMBNAIL,
          type: 'info',
          hideButton: true,
          progress: 60,
        }),
      );

      const thumbnailUrl = await uploadThumbnail(videoInfo, idToken, idUser);
      console.log('thumbnail url', thumbnailUrl);

      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.CREATING_MOMENT,
          type: 'info',
          hideButton: true,
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

      const response: any = await axios.post(
        'https://api.locketcamera.com/postMomentV2',
        bodyPostMoment,
        {headers: postHeaders},
      );

      thunkApi.dispatch(
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
          type: 'info',
          hideButton: true,
          progress: 100,
        }),
      );
      return response.data;
    } catch (error: any) {
      console.log('error', error.response.data);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error.response.data || error.message}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue(error);
    }
  },
);

const uploadThumbnail = async (
  uriVideo: string,
  idToken: string,
  idUser: string,
) => {
  const thumbnail = await getVideoThumbnail(uriVideo);

  if (!thumbnail) {
    throw new Error("Can't create thumbnail from video");
  }
  const nameThumbnail = `${Date.now()}_vtd182.jpg`;

  const blobThumbnail = await readFileAsBytes(thumbnail.path);
  const size = blobThumbnail?.byteLength;
  if (!blobThumbnail || !size) {
    throw new Error("Can't create blob from thumbnail");
  }
  const upload_url = await initiateUpload(idUser, idToken, size, nameThumbnail);

  await uploadImage(upload_url, blobThumbnail, idToken);

  const downloadUrl = await getDownloadUrl(idUser, idToken, nameThumbnail);
  return downloadUrl;
};
