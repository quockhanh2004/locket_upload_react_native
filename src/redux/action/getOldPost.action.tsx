import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {loadPostsFromStorage} from '../../helper/post.storage';
import {setOldPosts} from '../slice/oldPosts.slice';

interface DataParam {
  token: string;
  userId: string;
  timestamp?: number | string;
}

const urlGetPosts = 'https://locket.quockhanh020924.id.vn/posts';

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
        isLoadMore: data.timestamp ? true : false,
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
