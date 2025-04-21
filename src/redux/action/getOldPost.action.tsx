import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {loginHeader} from '../../util/header';
import {loadPostsFromStorage} from '../../helper/post.storage';
import {setOldPosts} from '../slice/oldPosts.slice';

interface DataParam {
  token: string;
  userId: string;
  timestamp?: number | string;
}

const urlGetPosts = 'https://locket.quockhanh020924.id.vn/posts';
const urlgetLatestMomentV2 = 'https://api.locketcamera.com/getLatestMomentV2';

export const getOldPosts = createAsyncThunk(
  'getListOldPost',
  async (data: DataParam, thunkApi) => {
    try {
      const oldPosts = await loadPostsFromStorage('posts_' + data.userId);
      thunkApi.dispatch(setOldPosts(oldPosts));
      const response = await axios.post(urlGetPosts, data);
      const listOldPosts = response.data.post;
      return {
        post: listOldPosts,
        currentUserId: data.userId,
        deleted: response.data.deleted,
      };
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
  token: string;
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
      const response = await axios.post(urlgetLatestMomentV2, body, {
        headers: {
          ...loginHeader,
          Authorization: `Bearer ${data.token}`,
        },
      });
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
