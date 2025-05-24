import axios from 'axios';

export const BASE_URL_LOCKET = 'https://api.locketcamera.com';

export const instanceLocket = axios.create({
  baseURL: BASE_URL_LOCKET,
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});

export const BASE_URL_FIREBASE =
  'https://www.googleapis.com/identitytoolkit/v3/relyingparty';

export const instanceFirebase = axios.create({
  baseURL: BASE_URL_FIREBASE,
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});

// export const MY_SERVER_URL = 'https://locket.quockhanh020924.id.vn';
export const MY_SERVER_URL = 'http://192.168.1.25:3001';
export const instanceMyServer = axios.create({
  baseURL: MY_SERVER_URL,
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});
