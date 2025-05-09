import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {parseSpotifyTrack} from '../../services/Spotify';
import {clearTokenData} from '../slice/spotify.slice';
import {t} from '../../languages/i18n';
import {MY_SERVER_URL} from '../../util/constrain';

interface DataParam {
  code?: string | null;
}

export const getAccessToken = createAsyncThunk(
  'getAccessToken',
  async (data: DataParam, thunkApi) => {
    try {
      const {code} = data;
      const response = await axios.post(
        `${MY_SERVER_URL}/spotify/exchange-code`,
        {
          code,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error Authorization spotify', error);
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error.response.data) || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);

interface RefreshTokenParam {
  refreshToken: string | null;
}

export const refreshAccessToken = createAsyncThunk(
  'refreshAccessToken',
  async (data: RefreshTokenParam, thunkApi) => {
    try {
      const {refreshToken} = data;
      const response = await axios.post(`${MY_SERVER_URL}/spotify/refresh`, {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error refreshing Spotify access token', error);
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error.response.data) || error.message}`,
          type: t('error'),
        }),
      );
      thunkApi.dispatch(clearTokenData());
      return thunkApi.rejectWithValue(error);
    }
  },
);

export const getCurrentPlay = createAsyncThunk(
  'getCurrentPlay',
  async (data: {token: string}, thunkApi) => {
    try {
      const {token} = data;
      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return parseSpotifyTrack(response.data);
    } catch (error: any) {
      console.error('Error fetching Spotify current play', error.response.data);
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error.response?.data) || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);
