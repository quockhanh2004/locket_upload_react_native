/* eslint-disable @typescript-eslint/no-unused-vars */
import {getVideoMetaData, Video} from 'react-native-compressor';
import {createThumbnail, Thumbnail} from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import axios from 'axios';

import {uploadHeaders} from './header';
import {readFileAsBytes} from './getBufferFile';

export const compressVideo = async (
  videoUri: string,
  cancelid?: (cancellationId: string) => void,
  progress?: (progress: number) => void,
): Promise<{
  width: number;
  height: number;
  size: number;
  duration: number;
  uri: any;
  type: any;
}> => {
  console.log('debug here', videoUri);
  // const uriNewVideo = videoUri;
  const uriNewVideo = await Video.compress(
    videoUri,
    {
      maxSize: 1020,
      compressionMethod: 'auto',
      getCancellationId: cancelid,
    },
    progress,
  );

  return await getInfoVideo(uriNewVideo, 'video/mp4');
};

export const deleteAllMp4Files = async (directoryPath: string) => {
  try {
    const files = await RNFS.readDir(directoryPath); // Lấy danh sách file trong thư mục
    let totalSize = 0;
    const mp4Files = files.filter(
      file => file.isFile() && file.name.endsWith('.mp4'),
    );

    if (mp4Files.length === 0) {
      console.log('Không có file .mp4 nào để xóa.');
      return;
    }

    for (const file of mp4Files) {
      totalSize = (totalSize || 0) + file.size;
      await RNFS.unlink(file.path);
      console.log('Đã xóa:', file.name);
    }

    console.log(
      `✅ Đã xóa ${mp4Files.length} file .mp4 trong thư mục: ${directoryPath}`,
    );
    //return totalsize dạng mb
    const totalSizeMb = totalSize / 1024 / 1024;
    return totalSizeMb;
  } catch (error) {
    console.error('Lỗi khi xóa file .mp4:', error);
  }
};

export const cancelCompressVideo = (cancelId: string): void => {
  Video.cancelCompression(cancelId);
};

export const UPLOAD_VIDEO_PROGRESS_STAGE = {
  PROCESSING: 'Processing video', // Xử lý video (resize, convert, v.v.)
  INITIATING_UPLOAD: 'Initiating upload', // Khởi tạo link upload
  UPLOADING: 'Uploading video', // Đang tải lên
  UPLOADING_THUMBNAIL: 'Uploading video thumbnail', // Đang tải lên
  FETCHING_DOWNLOAD_URL: 'Fetching download URL', // Lấy link download
  CREATING_MOMENT: 'Creating moment', // Tạo moment
  COMPLETED: 'Upload completed', // Hoàn tất
  FAILED: 'Upload failed', // Thất bại
};

export const getInfoVideo = async (videoUri: string, videoType: string) => {
  const videoMetaData = await getVideoMetaData(videoUri);

  return {
    ...videoMetaData,
    uri: videoUri,
    type: videoType,
  };
};

export const initiateUploadVideo = async (
  idUser: string,
  idToken: string,
  fileSize: number,
  nameVideo: string,
  process?: (progress: number) => void,
) => {
  const url = `https://firebasestorage.googleapis.com/v0/b/locket-video/o/users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}?uploadType=resumable&name=users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}`;

  const headers = {
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
    'x-goog-upload-content-type': 'video/mp4',
    'x-firebase-gmpid': '1:641029076083:ios:cc8eb46290d69b234fa609',
  };

  const body = {
    name: `users/${idUser}/moments/videos/${nameVideo}`,
    contentType: 'video/mp4',
    bucket: '',
    metadata: {creator: idUser, visibility: 'private'},
  };

  const response = await axios.post(url, body, {
    headers: headers,
  });

  return response.headers['x-goog-upload-url'];
};

export const uploadVideo = async (
  uploadUrl: string,
  blobVideo: Uint8Array<ArrayBuffer>,
  token: string,
) => {
  const response = await axios.put(uploadUrl, blobVideo, {
    headers: uploadHeaders,
  });

  return response.data;
};

export const getDownloadVideoUrl = async (
  idUser: string,
  idToken: string,
  nameVideo: string,
) => {
  const getUrl = `https://firebasestorage.googleapis.com/v0/b/locket-video/o/users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}`;

  const getHeaders = {
    'content-type': 'application/json; charset=UTF-8',
    authorization: `Bearer ${idToken}`,
  };

  const response = await axios.get(getUrl, {
    headers: getHeaders,
  });

  const downloadToken = response.data.downloadTokens;
  return `${getUrl}?alt=media&token=${downloadToken}`;
};

export const getVideoThumbnail = async (
  videoUri: string,
): Promise<Thumbnail> => {
  const response = await createThumbnail({
    url: videoUri,
    timeStamp: 1000, // Lấy thumbnail tại giây thứ 1 (1000ms)
  });

  return response; // Trả về đường dẫn ảnh thumbnail
};

export const cretateBody = (
  caption: string,
  thumbnailUrl: string,
  downloadVideoUrl: string,
) => {
  const bodyPostMoment = {
    data: {
      thumbnail_url: thumbnailUrl,
      video_url: downloadVideoUrl,
      recipients: [],
      analytics: {
        experiments: {
          flag_4: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '43',
          },
          flag_10: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '505',
          },
          flag_23: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '400',
          },
          flag_22: {
            value: '1203',
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
          },
          flag_19: {
            value: '52',
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
          },
          flag_18: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '1203',
          },
          flag_16: {
            value: '303',
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
          },
          flag_15: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '501',
          },
          flag_14: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '500',
          },
          flag_25: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '23',
          },
        },
        amplitude: {
          device_id: 'BF5D1FD7-9E4D-4F8B-AB68-B89ED20398A6',
          session_id: {
            value: '1722437166613',
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
          },
        },
        google_analytics: {
          app_instance_id: '5BDC04DA16FF4B0C9CA14FFB9C502900',
        },
        platform: 'ios',
      },
      sent_to_all: true,
      caption: caption,
      overlays: [
        {
          data: {
            text: caption,
            text_color: '#FFFFFFE6',
            type: 'standard',
            max_lines: {
              '@type': 'type.googleapis.com/google.protobuf.Int64Value',
              value: '4',
            },
            background: {material_blur: 'ultra_thin', colors: []},
          },
          alt_text: caption,
          overlay_id: 'caption:standard',
          overlay_type: 'caption',
        },
      ],
    },
  };

  return bodyPostMoment;
};
