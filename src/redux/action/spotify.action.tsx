import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {parseSpotifyTrack, SpotifyAuth} from '../../services/Spotify';
import {clearTokenData} from '../slice/spotify.slice';

interface DataParam {
  code?: string | null;
}

export const getAccessToken = createAsyncThunk(
  'getAccessToken',
  async (data: DataParam, thunkApi) => {
    try {
      const {code} = data;
      const response = await axios.post(
        'https://locket.quockhanh020924.id.vn/spotify/exchange-code',
        {
          code,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error Authorization spotify', error);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${
            JSON.stringify(error.response.data?.message) || error.message
          }`,
          type: 'error',
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
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: SpotifyAuth.config.client_id,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error refreshing Spotify access token', error);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${
            JSON.stringify(error.response.data?.message) || error.message
          }`,
          type: 'error',
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
          message: `Error: ${
            JSON.stringify(error.response.data?.message) || error.message
          }`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);
