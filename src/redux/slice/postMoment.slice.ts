import {createSlice} from '@reduxjs/toolkit';
import {
  uploadImageToFirebaseStorage,
  uploadVideoToFirebase,
} from '../action/postMoment.action';
import {t} from '../../languages/i18n';

interface ProgressUpload {
  state: string;
  progress: number;
}

interface TypePostMomentSlice {
  postMoment: string | null | undefined;
  isLoading: boolean;
  progressUpload: ProgressUpload | null | undefined;
}

const postMomentSlice = createSlice({
  name: 'postMoment',
  initialState: {
    postMoment: null,
    isLoading: false,
    progressUpload: null,
  } as TypePostMomentSlice,
  reducers: {
    clearPostMoment: state => {
      state.postMoment = null;
      state.isLoading = false;
      state.progressUpload = null;
    },
    setProgressUpload: (state, action) => {
      state.progressUpload = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadImageToFirebaseStorage.pending, state => {
        state.isLoading = true;
      })
      .addCase(uploadImageToFirebaseStorage.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.postMoment = t('post_moment_complete');
          state.isLoading = false;
        }
      })
      .addCase(uploadImageToFirebaseStorage.rejected, state => {
        state.isLoading = false;
      })

      .addCase(uploadVideoToFirebase.pending, state => {
        state.isLoading = true;
      })
      .addCase(uploadVideoToFirebase.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.postMoment = t('post_moment_complete');
          state.isLoading = false;
        }
      })
      .addCase(uploadVideoToFirebase.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {clearPostMoment, setProgressUpload} = postMomentSlice.actions;

export default postMomentSlice.reducer;
