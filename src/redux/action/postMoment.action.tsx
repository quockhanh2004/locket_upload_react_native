import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {setMessage, setTask} from '../slice/message.slice';
import {
  getDownloadUrl,
  initiateUpload,
  UPLOAD_PROGRESS_STAGE,
  uploadImage,
} from '../../util/uploadImage';
import {loginHeader} from '../../util/constrain';
import {
  compressVideo,
  getDownloadVideoUrl,
  getVideoThumbnail,
  initiateUploadVideo,
  UPLOAD_VIDEO_PROGRESS_STAGE,
  uploadVideo,
} from '../../util/uploadVideo';
import {readFileAsBytes} from '../../util/getBufferFile';
import {wrapCancelable} from '../../helper/wrapCancelable';
import {
  createBodyVideo,
  createOverlay,
  OverLayCreate,
} from '../../util/bodyMoment';
import {t} from 'i18next';

export interface DataPostMoment {
  idUser: string;
  idToken: string;
  imageInfo?: any;
  refreshToken: string;
  videoInfo?: any;
  friend?: string[];
  overlay: OverLayCreate;
}

export const uploadImageToFirebaseStorage = createAsyncThunk(
  'uploadImage',
  async (data: DataPostMoment, thunkApi) => {
    const {idUser, idToken, imageInfo, friend, overlay} = data;
    try {
      // Bắt đầu xử lý ảnh (hiển thị tiến trình)
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.PROCESSING_IMAGE, 0);

      // Đọc dữ liệu ảnh từ file
      const imageBlob = await wrapCancelable(
        readFileAsBytes(imageInfo.uri),
        thunkApi.signal,
      );

      if (!imageBlob) {
        throw new Error(t('error_read_file'));
      }

      const fileSize = imageBlob.byteLength;
      const nameImg = `${Date.now()}_moment.jpg`;

      // Hiển thị khởi tạo upload (thêm delay cho cảm giác tự nhiên)
      setTimeout(() => {
        showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.INITIATING_UPLOAD, 24);
      }, 100);

      // Gọi API khởi tạo upload
      const uploadUrl = await wrapCancelable(
        initiateUpload(idUser, idToken, fileSize, nameImg),
        thunkApi.signal,
      );

      // Upload ảnh lên server
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.UPLOADING, 42);
      await wrapCancelable(
        uploadImage(uploadUrl, imageBlob, idToken),
        thunkApi.signal,
      );

      // Lấy URL tải về của ảnh đã upload
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL, 66);
      const downloadUrl = await wrapCancelable(
        getDownloadUrl(idUser, idToken, nameImg),
        thunkApi.signal,
      );

      // Gửi yêu cầu tạo moment chứa ảnh
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.CREATING_MOMENT, 80);

      const bodyPostMoment = {
        data: {
          thumbnail_url: downloadUrl,
          recipients: friend || [],
          overlays: overlay?.text?.length === 0 ? [] : [createOverlay(overlay)],
        },
      };

      const response = await wrapCancelable(
        axios.post(
          'https://api.locketcamera.com/postMomentV2',
          bodyPostMoment,
          {
            headers: {
              ...loginHeader,
              Authorization: `Bearer ${idToken}`,
            },
          },
        ),
        thunkApi.signal,
      );
      console.log(JSON.stringify(response.data));

      // Kiểm tra phản hồi từ server
      if (!response.data.result || response.data.result.status >= 400) {
        throw new Error(
          JSON.stringify(response?.data?.result?.errors || t('unknow_error')),
        );
      }

      // Hiển thị hoàn tất
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.CREATING_MOMENT, 100);
      thunkApi.dispatch(setTask(null));
      return response.data;
    } catch (error: any) {
      // Nếu có lỗi thì hiển thị lỗi và reject thunk
      thunkApi.dispatch(setTask(null));
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: t('error'),
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
    try {
      const {idUser, idToken, videoInfo, friend, overlay} = data;

      // Hiển thị bước bắt đầu xử lý video
      showProgress(thunkApi, UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING, 0.1);

      // Nén video và theo dõi tiến trình
      const newVideo = await compressVideo(
        videoInfo,
        undefined, // cancelId (không cần ở đây)
        progress => {
          showProgress(
            thunkApi,
            UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING,
            progress,
          );
        },
        err => {
          thunkApi.dispatch(
            setMessage({
              message: `${JSON.stringify(err)}`,
              type: t('error'),
            }),
          );
          return thunkApi.rejectWithValue(err);
        },
        thunkApi.signal, // truyền vào để có thể cancel
      );

      // Đọc nội dung file video ra buffer
      const videoBlob = await wrapCancelable(
        readFileAsBytes(newVideo.uri),
        thunkApi.signal,
      );

      if (!videoBlob) {
        thunkApi.dispatch(
          setMessage({
            message: t('error_read_file'),
            type: t('error'),
          }),
        );
        throw new Error(t('error_read_file'));
      }

      const nameVideo = `${Date.now()}_vtd182.mp4`;

      // Hiển thị tiến trình khởi tạo upload
      showProgress(thunkApi, UPLOAD_VIDEO_PROGRESS_STAGE.INITIATING_UPLOAD, 10);

      // Lấy URL để upload video
      const uploadUrl = await wrapCancelable(
        initiateUploadVideo(idUser, idToken, newVideo.size, nameVideo),
        thunkApi.signal,
      );

      // Bắt đầu upload video
      showProgress(thunkApi, UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING, 26);
      await wrapCancelable(
        uploadVideo(uploadUrl, videoBlob, idToken),
        thunkApi.signal,
      );

      // Lấy đường dẫn tải video
      showProgress(
        thunkApi,
        UPLOAD_VIDEO_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
        48,
      );
      const downloadVideoUrl = await wrapCancelable(
        getDownloadVideoUrl(idUser, idToken, nameVideo),
        thunkApi.signal,
      );

      // Upload thumbnail của video
      showProgress(
        thunkApi,
        UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING_THUMBNAIL,
        60,
      );
      const thumbnailUrl = await wrapCancelable(
        uploadThumbnail(videoInfo, idToken, idUser),
        thunkApi.signal,
      );

      // Gửi yêu cầu tạo moment mới
      showProgress(thunkApi, UPLOAD_VIDEO_PROGRESS_STAGE.CREATING_MOMENT, 88);
      const postHeaders = {
        'content-type': 'application/json',
        authorization: `Bearer ${idToken}`,
      };

      const bodyPostMoment = createBodyVideo(
        thumbnailUrl,
        downloadVideoUrl,
        friend || [],
        overlay,
      );
      const response = await wrapCancelable(
        axios.post(
          'https://api.locketcamera.com/postMomentV2',
          bodyPostMoment,
          {headers: postHeaders},
        ),
        thunkApi.signal,
      );

      // Nếu thành công, cập nhật tiến trình hoàn tất
      showProgress(thunkApi, UPLOAD_PROGRESS_STAGE.CREATING_MOMENT, 100);
      thunkApi.dispatch(setTask(null));
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi và hiển thị thông báo lỗi
      thunkApi.dispatch(setTask(null));
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(
        error?.response?.data?.error || error.message,
      );
    }
  },
);

export const momentReaction = createAsyncThunk(
  'momentReaction',
  async (
    data: {emoji: string; postId: string; owner_uid: string; idToken: string},
    thunkApi,
  ) => {
    try {
      const {emoji, postId, owner_uid, idToken} = data;
      const body = {
        data: {
          intensity: 0,
          moment_uid: postId,
          reaction: emoji,
          owner_uid: owner_uid,
        },
      };
      const response = await axios.post(
        'https://api.locketcamera.com/reactToMoment',
        body,
        {
          headers: {
            ...loginHeader,
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(
        error?.response?.data?.error || error.message,
      );
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
    throw new Error(t('can_not_create_thumbnail'));
  }
  const nameThumbnail = `${Date.now()}_vtd182.jpg`;

  const blobThumbnail = await readFileAsBytes(thumbnail.path);
  const size = blobThumbnail?.byteLength;
  if (!blobThumbnail || !size) {
    throw new Error(t('error_read_file'));
  }
  const upload_url = await initiateUpload(idUser, idToken, size, nameThumbnail);

  await uploadImage(upload_url, blobThumbnail, idToken);

  const downloadUrl = await getDownloadUrl(idUser, idToken, nameThumbnail);
  return downloadUrl;
};

const showProgress = (thunkApi: any, message: string, progress: number) => {
  thunkApi.dispatch(
    setMessage({
      message,
      type: t('info'),
      hideButton: true,
      progress,
    }),
  );
};
