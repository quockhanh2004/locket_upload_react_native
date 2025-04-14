/* eslint-disable @typescript-eslint/no-unused-vars */
import RNFS from 'react-native-fs';
import axios from 'axios';
import MD5 from 'crypto-js/md5';

import {uploadHeaders} from './header';
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  MediaInformation,
  Statistics,
  StreamInformation,
} from 'ffmpeg-kit-react-native';

export type VideoInfo = {
  extension: string;
  size: number; // in bytes
  duration: number; // in seconds
  width: number;
  height: number;
};

export const compressVideo = async (
  videoUri: string,
  cancelid?: (cancellationId: number) => void,
  progress?: (progress: number) => void,
  onError?: (error: string) => void,
  signal?: AbortSignal,
): Promise<{
  width: number;
  height: number;
  size: number;
  duration: number;
  uri: any;
  thumbnail: string;
  type: any;
}> => {
  const MAX_SIZE_MB = 5;
  let cancelId: number | null;
  const rawVideoInfo = await getInfoVideo(videoUri);
  const duration =
    typeof rawVideoInfo.duration === 'string'
      ? parseFloat(rawVideoInfo.duration)
      : typeof rawVideoInfo.duration === 'number'
      ? rawVideoInfo.duration
      : 0;

  if (!duration || isNaN(duration)) {
    throw new Error('Không thể lấy thời lượng video');
  }
  const bitrate = Math.floor((MAX_SIZE_MB * 1024 * 1024 * 8) / duration); // bit/s
  const bitrateKbps = Math.floor(bitrate / 1000); // chuyển sang kbps

  const randomNumber = Math.floor(Math.random() * 1000000);
  const outputPath = `${RNFS.DocumentDirectoryPath}/${randomNumber}.mp4`;
  const ffmpegCommand = `-hide_banner -i "${videoUri}" -vf "scale='min(720,iw)':-2" -c:v h264_mediacodec -b:v ${bitrateKbps}k -maxrate ${bitrateKbps}k -bufsize ${bitrateKbps}k -threads 0 -an "${outputPath}"`;

  let totalDuration = 0;
  let pendingDurationNextLine = false;

  FFmpegKitConfig.enableLogs();

  if (signal) {
    signal.addEventListener('abort', () => {
      if (cancelId) {
        FFmpegKit.cancel(cancelId);
      }
    });
  }

  return new Promise((resolve, reject) => {
    FFmpegKit.executeAsync(
      ffmpegCommand,
      async session => {
        const returnCode = await session.getReturnCode();
        if (returnCode?.isValueSuccess()) {
          const fileUri = `file://${outputPath}`;
          const videoInfo = await getInfoVideo(fileUri);
          const thumbnail = await getVideoThumbnail(videoUri);

          resolve({
            ...videoInfo,
            uri: fileUri,
            type: 'video/mp4',
            thumbnail: thumbnail.path,
          });

          //khi hủy
        } else if (returnCode?.isValueCancel()) {
          if (onError) {
            onError('Video compression was cancelled');
          }

          //khi có lỗi
        } else {
          if (onError) {
            onError('Video compression failed');
          }
        }
      },
      log => {
        const message = log.getMessage();
        console.log('[FFmpeg LOG]', message);

        if (message.includes(': No such file or directory') && onError) {
          onError('No such file or directory');
        }

        //trong log sẽ có dòng "Duration: "
        const durationLineMatch = message.match(/Duration:/);
        if (durationLineMatch) {
          pendingDurationNextLine = true;
          return;
        }

        // 📌 Nếu dòng trước là "Duration:" → parse dòng này
        if (pendingDurationNextLine) {
          const durationMatch = message.match(/(\d{2}):(\d{2}):([\d.]+)/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1], 10);
            const minutes = parseInt(durationMatch[2], 10);
            const seconds = parseFloat(durationMatch[3]);
            totalDuration = hours * 3600 + minutes * 60 + seconds;
            console.log('✅ Parsed duration:', totalDuration, 'seconds');
          }
          pendingDurationNextLine = false; // reset lại
        }

        // 🎯 Parse progress từ dòng: time=00:00:01.36
        const timeMatch = message.match(/time=(\d{2}):(\d{2}):([\d.]+)/);
        if (progress && totalDuration > 0 && timeMatch) {
          const h = parseInt(timeMatch[1], 10);
          const m = parseInt(timeMatch[2], 10);
          const s = parseFloat(timeMatch[3]);
          const currentTime = h * 3600 + m * 60 + s;

          const percent = Math.min((currentTime / totalDuration) * 100, 100);
          progress(Math.round(percent));
          console.log(`📊 Progress: ${Math.round(percent)}%`);
        }
      },
      (statistics: Statistics) => {
        cancelId = statistics.getSessionId();
        if (cancelid) {
          cancelid(cancelId);
        }
      },
    );
  });
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

export const getInfoVideo = async (uri: string): Promise<VideoInfo> => {
  try {
    FFmpegKitConfig.disableLogs();
    const filePath = uri.startsWith('file://')
      ? uri.replace('file://', '')
      : uri;

    // Lấy extension
    const extension = filePath.split('.').pop() || '';

    // Lấy kích thước file
    const stat = await RNFS.stat(filePath);
    const size = Number(stat.size);

    // Lấy thông tin media từ FFmpeg
    const session = await FFprobeKit.getMediaInformation(filePath);
    const info: MediaInformation | null = session.getMediaInformation();

    if (!info) {
      throw new Error('Không thể lấy thông tin video');
    }

    const rawDuration = info.getDuration();
    const duration =
      typeof rawDuration === 'string'
        ? parseFloat(rawDuration)
        : typeof rawDuration === 'number'
        ? rawDuration
        : 0;

    // Tìm stream video
    const streams: StreamInformation[] = info.getStreams() ?? [];
    const videoStream = streams.find(stream => stream.getType() === 'video');

    const width = videoStream?.getWidth() ?? 0;
    const height = videoStream?.getHeight() ?? 0;

    return {
      extension,
      size,
      duration,
      width,
      height,
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin video:', error);
    throw error;
  }
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
    'x-goog-upload-content-length': `${fileSize}`,
    'accept-language': 'vi-VN,vi;q=0.9',
    'x-firebase-storage-version': 'ios/10.13.0',
    'user-agent':
      'com.locket.Locket/1.43.1 iPhone/17.3 hw/iPhone15_3 (GTMSUF/1)',
    'x-goog-upload-content-type': 'video/mp4',
    'x-firebase-gmpid': '1:641029076083:ios:cc8eb46290d69b234fa609',
  };

  const body = JSON.stringify({
    name: `users/${idUser}/moments/videos/${nameVideo}`,
    contentType: 'video/mp4',
    bucket: '',
    metadata: {creator: idUser, visibility: 'private'},
  });

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
): Promise<{path: string}> => {
  FFmpegKitConfig.disableLogs();
  const filePath = videoUri.replace('file://', '');
  const outputPath = `${RNFS.CachesDirectoryPath}/thumb_${Date.now()}.jpg`;

  // Lấy thông tin video để tính fps
  const probeSession = await FFprobeKit.getMediaInformation(filePath);
  const mediaInfo: MediaInformation | null = probeSession.getMediaInformation();
  if (!mediaInfo) {
    throw new Error('Không thể lấy thông tin video để tạo thumbnail.');
  }

  const streams: StreamInformation[] = mediaInfo.getStreams() ?? [];
  const videoStream = streams.find(s => s.getType() === 'video');

  if (!videoStream) {
    throw new Error('Không tìm thấy stream video.');
  }

  const fpsStr =
    videoStream.getAverageFrameRate() || videoStream.getRealFrameRate() || '30';
  const [numerator, denominator] = fpsStr.split('/').map(Number);
  const fps = denominator ? numerator / denominator : Number(fpsStr);

  if (!fps || isNaN(fps)) {
    throw new Error('Không thể xác định FPS.');
  }

  //vì video bị cắt giới hạn tối đa 7 giây
  const timestamp = 7 / fps;
  const formattedTime = timestamp.toFixed(2);

  // Tạo thumbnail bằng FFmpeg
  const ffmpegCmd = `-y -ss ${formattedTime} -i "${filePath}" -frames:v 1 -q:v 2 "${outputPath}"`;
  const session = await FFmpegKit.execute(ffmpegCmd);
  const returnCode = await session.getReturnCode();

  if (!returnCode?.isValueSuccess()) {
    throw new Error('Không thể tạo thumbnail.');
  }

  return {path: `file://${outputPath}`};
};

const getMd5Hash = (str: string) => {
  return MD5(str).toString();
};

export const createBody = (
  caption: string,
  thumbnailUrl: string,
  downloadVideoUrl: string,
  friends?: string[],
) => {
  const bodyPostMoment = {
    data: {
      thumbnail_url: thumbnailUrl,
      video_url: downloadVideoUrl,
      md5: getMd5Hash(downloadVideoUrl),
      recipients: friends || [],
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
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '1203',
          },
          flag_19: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '52',
          },
          flag_18: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '1203',
          },
          flag_16: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '303',
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
            background: {
              material_blur: 'ultra_thin',
              colors: [],
            },
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
