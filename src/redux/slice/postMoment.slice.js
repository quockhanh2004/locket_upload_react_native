import {createSlice} from '@reduxjs/toolkit';
import {uploadImageToFirebaseStorage} from '../action/postMoment.action';

const postMomentSlice = createSlice({
  name: 'postMoment',
  initialState: {
    postMoment: null,
    isLoading: false,
  },
  reducers: {
    clearPostMoment: state => {
      state.postMoment = null;
      state.isLoading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadImageToFirebaseStorage.pending, state => {
        state.isLoading = true;
      })
      .addCase(uploadImageToFirebaseStorage.fulfilled, (state, action) => {
        state.postMoment = 'Post Moment completed';
        state.isLoading = false;
      })
      .addCase(uploadImageToFirebaseStorage.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {clearPostMoment} = postMomentSlice.actions;

export default postMomentSlice.reducer;
