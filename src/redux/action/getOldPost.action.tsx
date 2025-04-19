import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';

interface DataParam {
  token: string;
  userId: string;
}

const urlGetPosts = 'https://locket.quockhanh020924.id.vn/posts';
const urlgetLatestMomentV2 = 'https://api.locketcamera.com/getLatestMomentV2';

export const getOldPosts = createAsyncThunk(
  'getListOldPost',
  async (data: DataParam, thunkApi) => {
    try {
      const response = await axios.post(urlGetPosts, data);
      const listOldPosts = response.data.post;
      return listOldPosts;
    } catch (error: any) {
      console.error('Error fetching list old posts', error);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error.message}`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);

interface DataGetLatestPosts {
  sync_token: string;
}

export const getLatestPosts = createAsyncThunk(
  'getListLatestPost',
  async (data: DataGetLatestPosts, thunkApi) => {
    try {
      const body = {
        data: {
          should_count_missed_moments: true,
          last_fetch: 10,
          sync_token: data.sync_token,
        },
      };
      const response = await axios.post(urlgetLatestMomentV2, body);
      const listLatestPosts = response.data.result;
      return listLatestPosts;
    } catch (error: any) {
      console.error('Error fetching list latest posts', error);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error.message}`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);
