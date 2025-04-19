import {createSlice} from '@reduxjs/toolkit';
import {Post} from '../../models/post.model';
import {getOldPosts} from '../action/getOldPost.action';
import {savePostsToStorage} from '../../helper/post.storage';

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
        const incomingPosts = action.payload.post;
        const currentUserId = action.payload.currentUserId;

        const existingIds = new Set(state.posts.map(post => post.id));
        const filteredNewPosts = incomingPosts.filter(
          (post: {id: string}) => !existingIds.has(post.id),
        );

        state.posts = [...filteredNewPosts, ...state.posts];
        state.isLoadPosts = false;
        savePostsToStorage('posts_' + currentUserId, state.posts);
      })
      .addCase(getOldPosts.rejected, state => {
        state.isLoadPosts = false;
      });
  },
});

export const {setOldPosts, setIsLoadOldPosts} = oldPostsSlice.actions;
export const oldPostsReducer = oldPostsSlice.reducer;
