import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getFriends} from '../action/getFriend.action';
import {Friend} from '../../models/friend.model';

interface InitialState {
  friends: Friend[];
  isLoadFriends: boolean;
  selected: string[];
  customListFriends: string[];
  optionSend: 'all' | 'custom_list' | 'manual';
}

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    isLoadFriends: false,
    selected: [],
    customListFriends: [],
    optionSend: 'all',
  } as InitialState,
  reducers: {
    setFriends(state, action: PayloadAction<Friend[]>) {
      state.friends = action.payload;
      state.isLoadFriends = true;
    },

    setIsLoadFriend(state, action: PayloadAction<boolean>) {
      state.isLoadFriends = action.payload;
    },

    setSelectedFriend(state, action: PayloadAction<string[]>) {
      state.selected = action.payload;
    },

    setCustomListFriends(state, action: PayloadAction<string[]>) {
      state.customListFriends = action.payload;
    },

    setOptionSend(
      state,
      action: PayloadAction<'all' | 'custom_list' | 'manual'>,
    ) {
      state.optionSend = action.payload;
    },

    restoreFriends(state, action) {
      const data = JSON.parse(action.payload);
      state.friends = data.friends;
      state.selected = data.selected;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getFriends.pending, state => {
        state.isLoadFriends = true;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
        state.isLoadFriends = false;
      })
      .addCase(getFriends.rejected, state => {
        state.isLoadFriends = false;
      });
  },
});

export const {
  setFriends,
  setIsLoadFriend,
  setSelectedFriend,
  restoreFriends,
  setCustomListFriends,
  setOptionSend,
} = friendsSlice.actions;

export default friendsSlice.reducer;
