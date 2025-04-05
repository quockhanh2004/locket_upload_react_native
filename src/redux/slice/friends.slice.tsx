import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getFriends} from '../action/getFriend.action';

export interface Friend {
  uid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

interface InitialState {
  friends: Friend[];
  isLoadFriends: boolean;
  selected: string[];
}

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    isLoadFriends: false,
    selected: [],
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

export const {setFriends, setIsLoadFriend, setSelectedFriend, restoreFriends} =
  friendsSlice.actions;

export default friendsSlice.reducer;
