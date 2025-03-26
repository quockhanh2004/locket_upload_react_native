import axios from 'axios';

export const BASE_URL =
  'https://www.googleapis.com/identitytoolkit/v3/relyingparty';

const instanceFirebase = axios.create({
  baseURL: BASE_URL,
  httpAgent: 'http',
  httpsAgent: 'https',
  timeout: 30000,
});

export default instanceFirebase;
