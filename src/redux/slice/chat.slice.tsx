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
}

const chatSlice = createSlice({
  initialState: {
    listChat: {},
    isLoadChat: false,
    isSending: false,
    chat: {},
  } as InitialState,
  name: 'chat',
  reducers: {
    updateListChat: (state, action: PayloadAction<ListChatType[]>) => {
      if (action.payload.length === 0) {
        state.isLoadChat = false;
        return;
      }
      //chuyển mảng thành object
      const chatObject = action.payload.reduce((acc, item) => {
        acc[item.uid] = item;
        return acc;
      }, {} as {[key: string]: ListChatType});

      //cập nhật state
      state.listChat = {
        ...state.listChat,
        ...chatObject,
      };
    },

    addItemMessage(
      state,
      action: PayloadAction<{uid: string; message: ChatMessageType[]}>,
    ) {
      const uid = action.payload.uid;
      //chuyển messsage thành object
      const messageObject = action.payload.message.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as {[key: string]: ChatMessageType});
      state.chat[uid] = {
        ...state.chat[uid],
        ...messageObject,
      };
    },

    setIsLoadChat(state, action: PayloadAction<boolean>) {
      state.isLoadChat = action.payload;
    },

    setIsSending(state, action: PayloadAction<boolean>) {
      state.isSending = action.payload;
    },

    clearListChat(state) {
      state.listChat = {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getMessage.pending, state => {
        state.isLoadChat = true;
      })
      .addCase(
        getMessage.fulfilled,
        (state, action: PayloadAction<{chat: ListChatType[]}>) => {
          state.isLoadChat = false;
          const objectListChat = action.payload?.chat?.reduce((acc, item) => {
            acc[item.uid] = item;
            return acc;
          }, {} as {[key: string]: ListChatType});

          //cập nhật state
          state.listChat = {
            ...state.listChat,
            ...objectListChat,
          };
        },
      )
      .addCase(getMessage.rejected, state => {
        state.isLoadChat = false;
      })

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
          if (action.payload.chat.length === 0) {
            state.isLoadChat = false;
            return;
          }
          const uid = action.payload.uid;
          //chuyển messsage thành object
          const messageObject = action.payload.chat.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {} as {[key: string]: ChatMessageType});
          //cập nhật state
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
