import axios from 'axios';

export const BASE_URL = 'https://api.locketcamera.com';

const instanceLocket = axios.create({
  baseURL: BASE_URL,
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});

export default instanceLocket;
