/* eslint-disable @typescript-eslint/no-unused-vars */
import RNFS, {writeFile} from 'react-native-fs';
import axios from 'axios';
import MD5 from 'crypto-js/md5';

import {uploadHeaders} from './constrain';
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  MediaInformation,
  Statistics,
  StreamInformation,
} from 'ffmpeg-kit-react-native';
import {uploadLogToServer} from '../api/error.api';
import {getTrySoftwareEncode} from './migrateOldPersist';
import {getDeviceInfo} from './deviceInfo';
import {t} from '../languages/i18n';
import {resizeImage} from './uploadImage';

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
    throw new Error(t('can_not_get_duration_video'));
  }
  const bitrate = Math.floor((MAX_SIZE_MB * 1024 * 1024 * 8) / duration); // bit/s
  const bitrateKbps = Math.floor(bitrate / 1000); // chuyển sang kbps

  const randomNumber = Math.floor(Math.random() * 1000000);
  const outputPath = `${RNFS.DocumentDirectoryPath}/${randomNumber}.mp4`;
  const codec = await getAvailableVideoEncoderCodec();
  // const codec = 'mpeg4';

  const ffmpegCommand = `-hide_banner -i "${videoUri}" -vf "scale='min(720,iw)':-2,crop='min(in_w,in_h)':'min(in_w,in_h)'" -c:v ${codec} -b:v ${bitrateKbps}k -maxrate ${bitrateKbps}k -bufsize ${bitrateKbps}k -threads 0 "${outputPath}"`;
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

  let logs = '';
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
        } else if (returnCode?.isValueCancel()) {
          if (onError) {
            onError(t('video_compression_cancelled'));
          }
        } else {
          // Ghi lại lỗi vào file log
          if (onError) {
            onError(t('video_compression_failed'));
          }
          await logErrorAndUpload(logs, t('compression_failed'));
        }
      },
      log => {
        const message = log.getMessage();
        console.log('[FFmpeg LOG]', message);
        logs += message + '\n';
        if (message.includes(': No such file or directory') && onError) {
          onError('No such file or directory');
        }

        const durationLineMatch = message.match(/Duration:/);
        if (durationLineMatch) {
          pendingDurationNextLine = true;
          return;
        }

        if (pendingDurationNextLine) {
          const durationMatch = message.match(/(\d{2}):(\d{2}):([\d.]+)/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1], 10);
            const minutes = parseInt(durationMatch[2], 10);
            const seconds = parseFloat(durationMatch[3]);
            totalDuration = hours * 3600 + minutes * 60 + seconds;
            console.log('✅ Parsed duration:', totalDuration, 'seconds');
          }
          pendingDurationNextLine = false;
        }

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

export const getAvailableVideoEncoderCodec = async (): Promise<
  string | null
> => {
  console.log('Checking available FFmpeg video encoders...');
  const softwareEncoders = await getTrySoftwareEncode();
  if (softwareEncoders) {
    return 'mpeg4';
  }
  FFmpegKitConfig.enableLogs();

  const session = await FFmpegKit.execute('-codecs');
  const output = await session.getLogsAsString();

  const lines = output.split('\n');

  const findVideoEncodersInternal = (
    codecLines: string[],
    preferHardware = true,
  ): string[] => {
    const separator = ' -------';
    const startIndex = codecLines.findIndex(
      line => line.trim() === separator.trim(),
    );

    if (startIndex === -1) {
      console.error(
        "Không tìm thấy dòng phân cách codec '-------' trong output FFmpeg.",
      );
      return [];
    }

    const videoEncoders = new Set<string>();
    const hardwareKeywords = ['mediacodec', 'v4l2m2m'];

    for (let i = startIndex + 1; i < codecLines.length; i++) {
      const line = codecLines[i].trim();

      if (!line || line.length < 8 || line.startsWith('-')) {
        continue;
      }

      const flags = line.substring(0, 7);
      const canEncode = flags[1] === 'E';
      const isVideo = flags[2] === 'V';

      if (canEncode && isVideo) {
        const descriptionPart = line.substring(7).trim();
        const codecNameMatch = descriptionPart.match(/^(\S+)/);
        const mainCodecName = codecNameMatch ? codecNameMatch[1] : null;

        if (!mainCodecName) {
          continue;
        }

        let addedSpecificEncoder = false;

        if (preferHardware) {
          const encodersMatch = descriptionPart.match(/\(encoders:(.*?)\)/);
          if (encodersMatch && encodersMatch[1]) {
            const specificEncoders = encodersMatch[1].trim().split(/\s+/);
            specificEncoders.forEach(encoder => {
              if (hardwareKeywords.some(keyword => encoder.includes(keyword))) {
                videoEncoders.add(encoder);
                addedSpecificEncoder = true;
              }
            });
          }
          if (
            hardwareKeywords.some(keyword => mainCodecName.includes(keyword))
          ) {
            if (!videoEncoders.has(mainCodecName)) {
              videoEncoders.add(mainCodecName);
              addedSpecificEncoder = true;
            }
          }
        }

        if (!addedSpecificEncoder) {
          const encodersMatch = descriptionPart.match(/\(encoders:(.*?)\)/);
          if (encodersMatch && encodersMatch[1]) {
            const specificEncoders = encodersMatch[1].trim().split(/\s+/);
            if (specificEncoders.length > 0 && specificEncoders[0]) {
              videoEncoders.add(specificEncoders[0]);
            } else {
              videoEncoders.add(mainCodecName);
            }
          } else {
            videoEncoders.add(mainCodecName);
          }
        }
      }
    }
    return Array.from(videoEncoders);
  };

  const availableEncoders = findVideoEncodersInternal(lines, true);

  if (availableEncoders.length === 0) {
    console.error('No available video encoders found.');
    return null; // Trả về null nếu không tìm thấy encoder nào
  }

  console.log(
    'Available video encoders (prioritizing hardware):',
    availableEncoders,
  );

  const priorityOrder = [
    'h264_mediacodec',
    'h264_v4l2m2m',
    'hevc_mediacodec',
    'hevc_v4l2m2m',
    'amf',
    'nvenc',
    'qsv',
    'libx264',
    'libvpx-vp9',
    'vp8_v4l2m2m',
    'mpeg4_v4l2m2m',
    'libtheora',
    'mpeg4',
    'h263_v4l2m2m',
    'h263p',
    'h263',
  ];

  for (const preferredCodec of priorityOrder) {
    if (availableEncoders.includes(preferredCodec)) {
      console.log(`Selected preferred video encoder: ${preferredCodec}`);
      return preferredCodec; // Trả về codec đầu tiên tìm thấy trong danh sách ưu tiên
    }
  }

  // Nếu không có codec nào trong danh sách ưu tiên được tìm thấy,
  // dùng encode software
  const fallbackCodec = 'h264';
  console.error(
    `No preferred codec found, falling back to the first available: ${fallbackCodec}`,
  );
  return fallbackCodec;
};

// Ghi log lỗi vào file và upload
const logErrorAndUpload = async (session: any, errorMessage: string) => {
  //lấy device branch và device model
  const deviceInfo = getDeviceInfo();
  const logFilePath = `${RNFS.DocumentDirectoryPath}/error_log_locket_upload_${
    deviceInfo.model + deviceInfo.fingerprint
  }.txt`;
  const errorDetails = `
  Error: ${errorMessage}
  Device Info: ${deviceInfo}
  Log: ${session}
  `;

  await writeFile(logFilePath, errorDetails);

  try {
    uploadLogToServer(
      logFilePath,
      `error_log_locket_upload_${
        deviceInfo.model + deviceInfo.fingerprint
      }.txt`,
    ); // Giả sử bạn có API này
  } catch (uploadError) {
    console.error('Error uploading log:', uploadError);
  }
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
  PROCESSING: t('processing_video'), // Xử lý video (resize, convert, v.v.)
  INITIATING_UPLOAD: t('initiating_upload'), // Khởi tạo link upload
  UPLOADING: t('uploading_video'), // Đang tải lên
  UPLOADING_THUMBNAIL: t('uploading_thumbnail'), // Đang tải lên
  FETCHING_DOWNLOAD_URL: t('fetching_download_url_video'), // Lấy link download
  CREATING_MOMENT: t('creating_moment'), // Tạo moment
  COMPLETED: t('upload_complete'), // Hoàn tất
  FAILED: t('upload_failed'), // Thất bại
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
      throw new Error(t('error_read_file'));
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
    throw new Error(t('error_read_video_for_thumbnail'));
  }

  const streams: StreamInformation[] = mediaInfo.getStreams() ?? [];
  const videoStream = streams.find(s => s.getType() === 'video');

  if (!videoStream) {
    throw new Error(t('error_read_file'));
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
    throw new Error(t('error_create_thumbnail'));
  }

  const thumbnail = await resizeImage(outputPath);

  return {path: thumbnail?.uri || `file://${outputPath}`};
};

export const getMd5Hash = (str: string) => {
  return MD5(str).toString();
};
