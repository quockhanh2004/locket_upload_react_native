import {createSlice} from '@reduxjs/toolkit';
import {Post} from '../../models/post.model';
import {getLatestPosts, getOldPosts} from '../action/getOldPost.action';

interface InitialState {
  posts: Post[];
  isLoadPosts: boolean;
}

const oldPostsSlice = createSlice({
  name: 'oldPosts',
  initialState: {
    posts: [],
    isLoadPosts: false,
  } as InitialState,
  reducers: {
    setOldPosts(state, action) {
      state.posts = action.payload;
      state.isLoadPosts = true;
    },

    setIsLoadOldPosts(state, action) {
      state.isLoadPosts = action.payload;
    },

    addPost(state, action) {
      const newPost = action.payload;
      state.posts.unshift(newPost);
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getOldPosts.pending, state => {
        state.isLoadPosts = true;
      })
      .addCase(getOldPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.isLoadPosts = false;
      })
      .addCase(getOldPosts.rejected, state => {
        state.isLoadPosts = false;
      })

      .addCase(getLatestPosts.pending, state => {
        state.isLoadPosts = true;
      })

      .addCase(getLatestPosts.fulfilled, (state, action) => {
        const newPosts = action.payload;
        if (newPosts.sync_token === state.posts[0]?.canonical_uid) {
          return;
        }
        state.posts = [...newPosts.data, ...state.posts];
        state.isLoadPosts = false;
      });
  },
});

export const {setOldPosts, setIsLoadOldPosts} = oldPostsSlice.actions;
export const oldPostsReducer = oldPostsSlice.reducer;
