import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ListChatType} from '../../models/chat.model';
import {getMessage} from '../action/chat.action';

interface InitialState {
  listChat: ListChatType[];
  isLoadChat: boolean;
  isSending: boolean;
}

const chatSlice = createSlice({
  initialState: {
    listChat: [],
    isLoadChat: false,
    isSending: false,
    chat: [],
  } as InitialState,
  name: 'chat',
  reducers: {
    setListChat: (state, action: PayloadAction<ListChatType[]>) => {
      for (const newItem of action.payload) {
        const index = state.listChat.findIndex(i => i.uid === newItem.uid);
        if (index !== -1) {
          state.listChat[index] = {...state.listChat[index], ...newItem}; // merge
        } else {
          state.listChat.push(newItem);
        }
      }

      // sort nếu cần
      if (
        state.listChat.length === 0 ||
        state.listChat[0]?.update_time === action.payload[0]?.update_time
      ) {
        return;
      }
      state.listChat?.sort(
        (a, b) => parseInt(b.update_time, 10) - parseInt(a.update_time, 10),
      );
    },

    setItemListChat(state, action: PayloadAction<ListChatType>) {
      const index = state.listChat.findIndex(
        item => item.uid === action.payload.uid,
      );

      if (index !== -1) {
        state.listChat[index] = action.payload;
      } else {
        state.listChat.push(action.payload);
      }

      // Sort giảm dần theo thời gian
      state.listChat.sort(
        (a, b) =>
          new Date(b.update_time).getTime() - new Date(a.update_time).getTime(),
      );
    },

    setIsLoadChat(state, action: PayloadAction<boolean>) {
      state.isLoadChat = action.payload;
    },

    setIsSending(state, action: PayloadAction<boolean>) {
      state.isSending = action.payload;
    },

    clearListChat(state) {
      state.listChat = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getMessage.pending, state => {
        state.isLoadChat = true;
      })
      .addCase(getMessage.fulfilled, (state, action) => {
        state.isLoadChat = false;
        state.listChat = action.payload?.chat;
      })
      .addCase(getMessage.rejected, state => {
        state.isLoadChat = false;
      });
  },
});

export const {
  setListChat,
  setItemListChat,
  setIsLoadChat,
  setIsSending,
  clearListChat,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
