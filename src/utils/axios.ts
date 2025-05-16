import axios from 'axios';

export const instanceFirebase = axios.create({
  baseURL: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty',
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});
export const instanceLocket = axios.create({
  baseURL: 'https://api.locketcamera.com',
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});
