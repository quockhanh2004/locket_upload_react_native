import axios from 'axios';
import {loginHeader} from '../util/constrain';
import instance from '../util/axios_locketcamera';

export const login = async data => {
  try {
    const {email, password} = data;
    const body = {
      email,
      password,
      clientType: 'CLIENT_TYPE_ANDROID',
      returnSecureToken: true,
    };

    const response = await axios.post(
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyB5dTd-xiLD5dEfWq5OpptnQtnMpE0W0u8',
      body,
      {headers: loginHeader},
    );

    if (response.status < 400) {
      return response.data;
    } else {
      console.warn(JSON.stringify(response.data));
    }
  } catch (error) {
    console.warn(JSON.stringify(error.response.data));
  }
};

export const resetPassword = async data => {
  try {
    const {email} = data;
    const body = {
      data: {email: email},
    };
    const response = await instance.post('sendPasswordResetEmail', body);
    const statusCode = response.data?.result?.status;
    const res =
      response.statusCode === 200 && statusCode !== 401 && statusCode !== 500;
    if (res) {
      return 'Reset Password Email Sent Successfully.';
    } else {
    }
  } catch (error) {
    console.warn(error.response.data.error.message);
  }
};

export const getAccessToken = async data => {
  try {
    const {refreshToken} = data;
    const body = {
      grant_type: 'refresh_token',
      refreshToken,
    };
    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.GOOGLE_API_KEY}`,
      body,
      {headers: loginHeader},
    );
    return response.data;
  } catch (error) {
    console.warn(error?.response?.data?.error?.message);
    return null;
  }
};

export const fetchUser = async (user_uid, token) => {
  return await axios.post(
    'https://api.locketcamera.com/fetchUserV2',
    {
      data: {
        user_uid,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
};
