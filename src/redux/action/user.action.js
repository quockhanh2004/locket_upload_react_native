import {createAsyncThunk} from '@reduxjs/toolkit';
import {loginHeader} from '../../util/header';
import {setMessage} from '../slice/message.slice';
import instanceFirebase from '../../util/axios_firebase';
import instanceLocket from '../../util/axios_locketcamera';
import axios from 'axios';
import {clearStatus, logout} from '../slice/user.slice';
import {
  createImageBlob,
  getDownloadUrl,
  initiateUpload,
  uploadImage,
  validateImageInfo,
} from '../../util/uploadImage';

export const login = createAsyncThunk('login', async (data, thunkApi) => {
  try {
    const {email, password} = data;
    const body = {
      email: email,
      password: password,
      clientType: 'CLIENT_TYPE_IOS',
      returnSecureToken: true,
    };
    const response = await instanceFirebase.post(
      `verifyPassword?key=${process.env.GOOGLE_API_KEY}`,
      body,
      {headers: loginHeader},
    );
    if (response.status === 200) {
      return response.data;
    } else {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${response.statusMessage}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  } catch (error) {
    if (error?.response) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error?.response?.data?.error?.message}`,
          type: 'Error',
        }),
      );
    } else {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error?.message}`,
          type: 'Error',
        }),
      );
    }

    thunkApi.dispatch(clearStatus());
    thunkApi.rejectWithValue();
  }
});

export const resetPassword = createAsyncThunk(
  'resetPassword',
  async (data, thunkApi) => {
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
            message: 'Password reset email has been sent',
            type: 'Success',
          }),
        );
        return '';
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.statusMessage}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error?.response?.data?.error}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  },
);

export const getAccountInfo = createAsyncThunk(
  'getAccountInfo',
  async (data, thunkApi) => {
    const {idToken, refreshToken} = data;

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
      if (response.status === 200) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(getToken({refreshToken}));
      thunkApi.rejectWithValue();
    }
  },
);

export const getToken = createAsyncThunk(
  'refreshToken',
  async (data, thunkApi) => {
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
      if (response.status === 200) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(error?.response?.data?.error)}`,
          type: 'Error',
        }),
      );
      thunkApi.dispatch(logout());
      thunkApi.rejectWithValue();
    }
  },
);

export const updateDisplayName = createAsyncThunk(
  'updateDisplayName',
  async (data, thunkApi) => {
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

      if (response.status === 200) {
        thunkApi.dispatch(
          setMessage({
            message: 'Display Name updated successfully',
            type: 'Success',
          }),
        );
        thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data?.error}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(error?.response?.data?.error)}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  },
);

export const updateAvatar = createAsyncThunk(
  'updateAvatar',
  async (data, thunkApi) => {
    const {imageInfo, idUser, idToken, refreshToken} = data;
    let currentToken = idToken;

    try {
      // Validate image information
      if (!validateImageInfo(imageInfo, thunkApi)) {
        return thunkApi.rejectWithValue();
      }

      // Prepare image for upload
      const {image, fileSize} = await createImageBlob(imageInfo);
      const imageName = `${Date.now()}_vtd182.webp`;

      // Upload logic
      const uploadAvatar = async token => {
        const uploadUrl = await initiateUpload(
          idUser,
          token,
          fileSize,
          imageName,
        );
        await uploadImage(uploadUrl, image, token);
        return await getDownloadUrl(idUser, token, imageName);
      };

      // Update avatar on server
      const updateAvatarOnServer = async (downloadUrl, token) => {
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
          throw new Error(response.data?.error?.message || 'Update failed');
        }

        return response;
      };

      // Handle token and retry logic
      const handleUpload = async () => {
        try {
          const downloadUrl = await uploadAvatar(currentToken);
          await updateAvatarOnServer(downloadUrl, currentToken);

          // Dispatch success actions
          thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
          thunkApi.dispatch(
            setMessage({
              message: 'Avatar updated successfully',
              type: 'Success',
            }),
          );
          return true;
        } catch (error) {
          if (error.message.includes('403')) {
            console.log(JSON.stringify(error));

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
    } catch (error) {
      // Dispatch error messages
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${
            error?.response?.data?.error?.message || error.message
          }`,
          type: 'Error',
        }),
      );
      return thunkApi.rejectWithValue();
    }
  },
);

export const enableLocketGold = createAsyncThunk(
  'enableLocketGold',
  async (data, thunkApi) => {
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
          type: 'Success',
        }),
      );
      thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
      return response.data;
    } catch (error) {
      console.log(error.response.data);

      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error?.response?.data?.error?.message}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  },
);
