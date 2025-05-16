import {createSlice} from '@reduxjs/toolkit';
import {Post, Reaction} from '../../models/post.model';
import {
  cleanOldPostAsync,
  getOldPosts,
  getReaction,
} from '../action/getOldPost.action';
import {savePostsToStorage} from '../../helper/post.storage';
import {Friend} from '../../models/friend.model';

interface InitialState {
  posts: Post[];
  isLoadPosts: boolean;
  deleted: string[];
  isLoadingReaction: boolean;
  reaction?: {
    [key: string]: Reaction[];
  };
  response: {
    post: Post[];
    currentUserId?: string;
    deleted?: string[];
    isLoadMore?: boolean;
    byUserId?: string;
  } | null;
  filterFriendShow: Friend | null;
}

const oldPostsSlice = createSlice({
  name: 'oldPosts',
  initialState: {
    posts: [],
    isLoadPosts: false,
    deleted: [],
    reaction: {},
    isLoadingReaction: false,
    response: null,
    filterFriendShow: null,
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

    removePost(state, action) {
      const postId = action.payload;
      state.posts = state.posts.filter(post => post.id !== postId);
      if (!state.deleted.includes(postId)) {
        state.deleted.push(postId);
      }
    },

    setFilterFriendShow(state, action) {
      state.filterFriendShow = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getOldPosts.pending, state => {
        state.isLoadPosts = true;
      })
      .addCase(getOldPosts.fulfilled, (state, action) => {
        const incomingPosts = action.payload.post;
        const deletedPosts = action.payload.deleted;
        const currentUserId = action.payload.currentUserId;

        state.response = action.payload;
        if (incomingPosts?.length === 0) {
          state.isLoadPosts = false;
          return;
        }

        const isLoadMore = action.payload.isLoadMore;
        let existingIds: Set<string> = new Set();
        if (state.posts.length > 0) {
          existingIds = new Set(state.posts.map(post => post.id));
        }
        const filteredNewPosts = incomingPosts.filter(
          (post: {id: string}) => !existingIds.has(post.id),
        );
        let temp;

        if (isLoadMore) {
          temp = [...state.posts, ...filteredNewPosts];
        } else {
          temp = [...filteredNewPosts, ...state.posts];
        }

        temp.sort((a: {date: number}, b: {date: number}) => {
          return b.date - a.date;
        });

        state.posts = temp.filter(
          (post: {id: string}) => !deletedPosts.includes(post.id),
        );
        state.isLoadPosts = false;
        savePostsToStorage('posts_' + currentUserId, state.posts);
      })
      .addCase(getOldPosts.rejected, state => {
        state.isLoadPosts = false;
      })

      .addCase(cleanOldPostAsync.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.isLoadPosts = false;
      })

      .addCase(getReaction.pending, state => {
        state.isLoadingReaction = true;
      })
      .addCase(getReaction.fulfilled, (state, action) => {
        const {momentId, reactions} = action.payload;
        state.isLoadingReaction = false;
        state.reaction = {
          ...state.reaction,
          [momentId]: reactions,
        };
      })
      .addCase(getReaction.rejected, state => {
        state.isLoadingReaction = false;
      });
  },
});

export const {
  setOldPosts,
  setIsLoadOldPosts,
  removePost,
  addPost,
  setFilterFriendShow,
} = oldPostsSlice.actions;
export const oldPostsReducer = oldPostsSlice.reducer;
