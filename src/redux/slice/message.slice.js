import {createSlice} from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    message: null,
    type: '',
    hideButton: false,
    progress: null,
  },

  reducers: {
    setMessage(state, action) {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.hideButton = action.payload.hideButton || false;
      state.progress = action.payload.progress || null;
    },
    clearMessage(state) {
      state.message = null;
      state.type = '';
      state.hideButton = false;
      state.progress = null;
    },
  },
});

export const {setMessage, clearMessage} = messageSlice.actions;

export default messageSlice.reducer;
