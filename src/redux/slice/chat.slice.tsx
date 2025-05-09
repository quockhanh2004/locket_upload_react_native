import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ListChatType} from '../../models/chat.model';

interface InitialState {
  listChat: any[];
  isLoadChat: boolean;
  isSending: boolean;
  chat: any[];
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
      state.listChat.sort((a, b) => b.timestamp - a.timestamp);
    },

    setItemListChat(state, action: PayloadAction<ListChatType>) {
      const index = state.listChat.findIndex(
        item => item.uid === action.payload.uid,
      );

      if (index !== -1) {
        const target = state.listChat[index];
        if (target.latest_message !== action.payload.latest_message) {
          // Cập nhật mới → cần clone
          const updated = {
            ...target,
            latest_message: action.payload.latest_message,
          };
          state.listChat.splice(index, 1, updated);
        } else {
          return; // Không thay đổi gì → không cần sort lại
        }
      } else {
        // Push mới
        state.listChat.push(action.payload);
      }

      // Sort giảm dần theo thời gian
      state.listChat.sort(
        (a, b) =>
          new Date(b.create_time).getTime() - new Date(a.create_time).getTime(),
      );
    },

    setIsLoadChat(state, action: PayloadAction<boolean>) {
      state.isLoadChat = action.payload;
    },

    setIsSending(state, action: PayloadAction<boolean>) {
      state.isSending = action.payload;
    },

    setChat(state, action: PayloadAction<any[]>) {
      state.chat = action.payload;
    },
  },
});

export const {
  setListChat,
  setItemListChat,
  setIsLoadChat,
  setIsSending,
  setChat,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
