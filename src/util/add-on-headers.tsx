import {uploadHeaders} from './header';

export const addTypeImage = (sizeFile: String) => {
  return {
    headers: {
      ...uploadHeaders,
      'x-goog-upload-content-type': 'image/webp',
      'x-goog-upload-content-length': sizeFile.toString(),
    },
  };
};

export const addTypeVideo = (sizeFile: String) => {
  return {
    headers: {
      ...uploadHeaders,
      'x-goog-upload-content-type': 'video/mp4',
      'x-goog-upload-content-length': sizeFile.toString(),
    },
  };
};
