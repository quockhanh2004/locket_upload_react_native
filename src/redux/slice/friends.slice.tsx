import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getFriends} from '../action/getFriend.action';
import {Friend, OptionSend} from '../../models/friend.model';

interface InitialState {
  friends: {
    [key: string]: Friend;
  };
  isLoadFriends: boolean;
  selected: string[];
  customListFriends: string[];
  optionSend: OptionSend;
}

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: {},
    isLoadFriends: false,
    selected: [],
    customListFriends: [],
    optionSend: 'all',
  } as InitialState,
  reducers: {
    setFriends(state, action: PayloadAction<Friend[]>) {
      //chuyển mảng thành object
      const friendsObject = action.payload.reduce((acc, item) => {
        acc[item.uid] = item;
        return acc;
      }, {} as {[key: string]: Friend});
      state.friends = friendsObject;
      state.isLoadFriends = false;
      state.selected = [];
      state.customListFriends = [];
      state.optionSend = 'manual';
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

    setOptionSend(state, action: PayloadAction<OptionSend>) {
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
