import {headers} from './header';

export const addTypeImage = sizeFile => {
  return {
    headers: {
      ...headers,
      'x-goog-upload-content-type': 'image/webp',
      'x-goog-upload-content-length': sizeFile.toString(),
    },
  };
};

export const addTypeVideo = sizeFile => {
  return {
    headers: {
      ...headers,
      'x-goog-upload-content-type': 'video/mp4',
      'x-goog-upload-content-length': sizeFile.toString(),
    },
  };
};
