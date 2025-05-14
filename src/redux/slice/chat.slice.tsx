import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatMessageType, ListChatType} from '../../models/chat.model';
import {getMessage, getMessageWith} from '../action/chat.action';

interface InitialState {
  listChat: {
    [key: string]: ListChatType;
  };
  isLoadChat: boolean;
  isSending: boolean;
  chat: {
    [key: string]: {
      [key: string]: ChatMessageType;
    };
  };
  response: {
    chat?: ChatMessageType[] | ListChatType[] | null;
    uid: string;
    isLoadMore: boolean;
  };
}

const initialState: InitialState = {
  listChat: {},
  isLoadChat: false,
  isSending: false,
  chat: {},
  response: {
    chat: null,
    uid: '',
    isLoadMore: false,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateListChat: (state, action: PayloadAction<ListChatType[]>) => {
      if (action.payload.length === 0) {
        state.isLoadChat = false;
        return;
      }

      const chatObject = action.payload.reduce((acc, item) => {
        acc[item.uid] = item;
        return acc;
      }, {} as {[key: string]: ListChatType});

      // Kiểm tra xem dữ liệu có thực sự thay đổi không
      const isDifferent = Object.entries(chatObject).some(([uid, newItem]) => {
        const oldItem = state.listChat[uid];
        return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem);
      });

      if (isDifferent) {
        state.listChat = {
          ...state.listChat,
          ...chatObject,
        };
      }
    },

    addItemMessage: (
      state,
      action: PayloadAction<{uid: string; message: ChatMessageType[]}>,
    ) => {
      const {uid, message} = action.payload;
      if (message.length === 0) {
        state.isLoadChat = false;
        return;
      }

      const messageObject = message.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as {[key: string]: ChatMessageType});

      state.chat[uid] = {
        ...state.chat[uid],
        ...messageObject,
      };
    },

    setIsLoadChat: (state, action: PayloadAction<boolean>) => {
      state.isLoadChat = action.payload;
    },

    setIsSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },

    clearListChat: state => {
      state.listChat = {};
    },
  },

  extraReducers: builder => {
    builder
      // ===== getMessage =====
      .addCase(getMessage.pending, state => {
        state.isLoadChat = true;
      })
      .addCase(
        getMessage.fulfilled,
        (
          state,
          action: PayloadAction<{
            chat: ListChatType[];
            uid: string;
            isLoadMore: boolean;
          }>,
        ) => {
          state.isLoadChat = false;

          const objectListChat = action.payload.chat.reduce((acc, item) => {
            acc[item.uid] = item;
            return acc;
          }, {} as {[key: string]: ListChatType});

          state.listChat = {
            ...state.listChat,
            ...objectListChat,
          };
        },
      )
      .addCase(getMessage.rejected, state => {
        state.isLoadChat = false;
      })

      // ===== getMessageWith =====
      .addCase(getMessageWith.pending, state => {
        state.isLoadChat = true;
      })
      .addCase(
        getMessageWith.fulfilled,
        (
          state,
          action: PayloadAction<{
            chat: ChatMessageType[];
            uid: string;
            isLoadMore: boolean;
          }>,
        ) => {
          const {chat, uid} = action.payload;
          state.response = action.payload;

          if (chat.length === 0) {
            state.isLoadChat = false;
            return;
          }

          const messageObject = chat.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {} as {[key: string]: ChatMessageType});

          state.chat[uid] = {
            ...state.chat[uid],
            ...messageObject,
          };

          state.isLoadChat = false;
        },
      )
      .addCase(getMessageWith.rejected, state => {
        state.isLoadChat = false;
      });
  },
});

export const {
  updateListChat,
  setIsLoadChat,
  setIsSending,
  addItemMessage,
  clearListChat,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;
