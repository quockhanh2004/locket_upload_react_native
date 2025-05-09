import {createAsyncThunk} from '@reduxjs/toolkit';
import {loginHeader} from '../../util/constrain';
import {setMessage} from '../slice/message.slice';
import instanceFirebase from '../../util/axios_firebase';
import instanceLocket from '../../util/axios_locketcamera';
import axios, {AxiosResponse} from 'axios';
import {clearStatus, logout} from '../slice/user.slice';
import {
  getDownloadUrl,
  initiateUpload,
  uploadImage,
} from '../../util/uploadImage';
import {readFileAsBytes} from '../../util/getBufferFile';
import {fetchUser} from '../../api/user.api';
import {t} from '../../languages/i18n';

interface DataLogin {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  'login',
  async (data: DataLogin, thunkApi) => {
    try {
      const {email, password} = data;
      const body = {
        email: email,
        password: password,
        clientType: 'CLIENT_TYPE_IOS',
        returnSecureToken: true,
      };
      const response: AxiosResponse = await instanceFirebase.post(
        `verifyPassword?key=${process.env.GOOGLE_API_KEY}`,
        body,
        {headers: loginHeader},
      );
      if (
        !response.data.result?.status ||
        response.data?.result?.status < 400
      ) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `${response.data.result.status}`,
            type: t('error'),
          }),
        );
      }
    } catch (error: any) {
      if (error?.response) {
        thunkApi.dispatch(
          setMessage({
            message: `${error?.response?.data?.error?.message}`,
            type: t('error'),
          }),
        );
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `${error?.message}`,
            type: t('error'),
          }),
        );
      }

      thunkApi.dispatch(clearStatus());
      thunkApi.rejectWithValue(error?.message);
    }
  },
);

export const loginPhone = createAsyncThunk(
  'loginPhone',
  async (data: DataLogin, thunkApi) => {
    try {
      const {email, password} = data;
      const bodyVerify = {
        data: {
          phone: email,
          operation: 'sign_in',
          use_password_if_available: true,
        },
      };

      const responseVerify = await instanceLocket.post(
        'sendVerificationCode',
        bodyVerify,
        {
          headers: loginHeader,
        },
      );

      if (responseVerify.data?.result?.status !== 602) {
        console.log('response verify', responseVerify.data);

        thunkApi.dispatch(
          setMessage({
            message: `${responseVerify.data?.result}`,
            type: t('error'),
          }),
        );
        return thunkApi.rejectWithValue({});
      }

      const body = {
        data: {
          phone: email,
          password,
          returnSecureToken: true,
        },
      };
      const response: AxiosResponse = await instanceLocket.post(
        'signInWithPhonePassword',
        body,
        {headers: loginHeader},
      );
      if (
        !response.data.result?.status ||
        response.data?.result?.status < 400
      ) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `${response.data.result.status}`,
            type: t('error'),
          }),
        );
      }
    } catch (error: any) {
      if (error?.response) {
        console.log(error.response);

        thunkApi.dispatch(
          setMessage({
            message: `${error?.response?.data?.error?.message}`,
            type: t('error'),
          }),
        );
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `${error?.message}`,
            type: t('error'),
          }),
        );
      }

      thunkApi.dispatch(clearStatus());
      thunkApi.rejectWithValue(error?.message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  'resetPassword',
  async (data: {email: string}, thunkApi) => {
    try {
      const {email} = data;
      const body = {
        data: {email: email},
      };
      const response = await instanceLocket.post(
        'sendPasswordResetEmail',
        body,
      );
      const statusCode = response.data.result.status;
      const res = statusCode === 200;
      if (res) {
        thunkApi.dispatch(
          setMessage({
            message: t('email_reset_password_send'),
            type: t('success'),
          }),
        );
        return '';
      }
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${error?.response?.data?.error}`,
          type: t('error'),
        }),
      );
      thunkApi.rejectWithValue(error?.response?.data?.error);
    }
  },
);

interface BodyGetAccountInfo {
  idToken: string;
  refreshToken: string;
}
export const getAccountInfo = createAsyncThunk(
  'getAccountInfo',
  async (data: BodyGetAccountInfo, thunkApi) => {
    const {idToken} = data;

    try {
      const body = {
        idToken,
      };

      const response = await instanceFirebase.post(
        `getAccountInfo?key=${process.env.GOOGLE_API_KEY}`,
        body,
        {
          headers: {...loginHeader},
        },
      );

      const fullName = await fetchUser(response.data.users[0].localId, idToken);
      // thêm firsName và lastName vào response.data.users[0]
      const user = response.data.users[0];
      user.firstName = fullName.data.result.data.first_name;
      user.lastName = fullName.data.result.data.last_name;
      return user;
    } catch (error) {
      thunkApi.rejectWithValue(error);
    }
  },
);

export const getToken = createAsyncThunk(
  'refreshToken',
  async (data: {refreshToken: string}, thunkApi) => {
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
      thunkApi.dispatch(
        getAccountInfo({
          idToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        }),
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data?.error)}`,
          type: t('error'),
        }),
      );
      thunkApi.dispatch(logout());
      thunkApi.rejectWithValue(error);
    }
  },
);

interface BodyUpdateDisplayName {
  last_name: string;
  first_name: string;
  idToken: string;
  refreshToken: string;
}

export const updateDisplayName = createAsyncThunk(
  'updateDisplayName',
  async (data: BodyUpdateDisplayName, thunkApi) => {
    const {last_name, first_name, idToken, refreshToken} = data;
    const body = {
      data: {
        first_name,
        last_name,
      },
    };
    try {
      const response = await instanceLocket.post('changeProfileInfo', body, {
        headers: {
          ...loginHeader,
          Authorization: 'Bearer ' + idToken,
        },
      });

      thunkApi.dispatch(
        setMessage({
          message: t('display_name_updateed_successfully'),
          type: t('success'),
        }),
      );
      thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data?.error)}`,
          type: t('error'),
        }),
      );
      thunkApi.rejectWithValue(error);
    }
  },
);

interface BodyUpdateAvatar {
  imageInfo: any;
  idUser: string;
  idToken: string;
  refreshToken: string;
}

export const updateAvatar = createAsyncThunk(
  'updateAvatar',
  async (data: BodyUpdateAvatar, thunkApi) => {
    const {imageInfo, idUser, idToken, refreshToken} = data;
    let currentToken = idToken;

    try {
      // Prepare image for upload
      const imageBlob = await readFileAsBytes(imageInfo);
      if (!imageBlob) {
        throw new Error(t('error_read_file'));
      }
      const fileSize = imageBlob.byteLength;
      const imageName = `${Date.now()}_vtd182.webp`;

      // Upload logic
      const uploadAvatar = async (token: string) => {
        const uploadUrl = await initiateUpload(
          idUser,
          token,
          fileSize,
          imageName,
        );
        await uploadImage(uploadUrl, imageBlob, token);
        return await getDownloadUrl(idUser, token, imageName);
      };

      // Update avatar on server
      const updateAvatarOnServer = async (
        downloadUrl: string,
        token: string,
      ) => {
        const body = {
          data: {
            profile_picture_url: downloadUrl,
          },
        };

        const response = await instanceLocket.post('changeProfileInfo', body, {
          headers: {
            ...loginHeader,
            Authorization: 'Bearer ' + token,
          },
        });

        if (response.status !== 200) {
          throw new Error(response.data?.error?.message || t('update_failed'));
        }

        return response;
      };

      // Handle token and retry logic
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handleUpload = async () => {
        try {
          const downloadUrl = await uploadAvatar(currentToken);
          await updateAvatarOnServer(downloadUrl, currentToken);

          // Dispatch success actions
          thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
          thunkApi.dispatch(
            setMessage({
              message: t('avatar_update_success'),
              type: t('success'),
            }),
          );
          return true;
        } catch (error: any) {
          if (error.message.includes('403')) {
            console.log('error', JSON.stringify(error));

            throw new Error('Retry with new token');
          }
          throw error;
        }
      };

      // Attempt upload and handle retries
      // try {
      //   await handleUpload();
      // } catch (error) {
      //   if (error.message === 'Retry with new token') {
      //     try {
      //       await handleUpload();
      //     } catch (retryError) {
      //       throw retryError;
      //     }
      //   } else {
      //     throw error;
      //   }
      // }
    } catch (error: any) {
      // Dispatch error messages
      thunkApi.dispatch(
        setMessage({
          message: `${error?.response?.data?.error?.message || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);

interface BodyEnableLocketGold {
  idToken: string;
  refreshToken: string;
  enable: boolean;
}

export const enableLocketGold = createAsyncThunk(
  'enableLocketGold',
  async (data: BodyEnableLocketGold, thunkApi) => {
    const {idToken, refreshToken, enable} = data;
    const body = {
      data: {
        badge: enable ? 'locket_gold' : null,
      },
    };

    try {
      const response = await instanceLocket.post('changeProfileInfo', body, {
        headers: {
          ...loginHeader,
          Authorization: 'Bearer ' + idToken,
        },
      });

      thunkApi.dispatch(
        setMessage({
          message: JSON.stringify(response?.data?.result),
          type: t('success'),
        }),
      );
      thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
      return response.data;
    } catch (error: any) {
      console.log('error', error.response.data);

      thunkApi.dispatch(
        setMessage({
          message: `${error?.response?.data?.error?.message}`,
          type: t('error'),
        }),
      );
      thunkApi.rejectWithValue(error);
    }
  },
);
