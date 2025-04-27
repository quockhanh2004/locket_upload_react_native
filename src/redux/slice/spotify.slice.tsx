import {createSlice} from '@reduxjs/toolkit';
import {
  getAccessToken,
  getCurrentPlay,
  refreshAccessToken,
} from '../action/spotify.action';
import {SimplifiedTrack} from '../../models/spotify.model';

type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  time_expired: number;
};

interface InitialState {
  tokenData: TokenData | null;
  isLoading: boolean;
  currentPlay: SimplifiedTrack | null;
}

const spotifySlice = createSlice({
  name: 'spotify',
  initialState: {
    tokenData: null,
    isLoading: false,
    currentPlay: null,
  } as InitialState,

  reducers: {
    setTokenData: (state, action) => {
      state.tokenData = action.payload;
    },
    clearTokenData: state => {
      state.tokenData = null;
    },
  },
  extraReducers: builder => {
    builder
      //get access token
      .addCase(getAccessToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(getAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenData = {
          ...action.payload,
          time_expired: new Date().getTime() + action.payload.expires_in * 1000,
        };
      })
      .addCase(getAccessToken.rejected, state => {
        state.isLoading = false;
      })

      //refresh access token
      .addCase(refreshAccessToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.tokenData) {
          state.tokenData.access_token = action.payload.access_token;
          state.tokenData.time_expired =
            new Date().getTime() + action.payload.expires_in * 1000;
        }
      })
      .addCase(refreshAccessToken.rejected, state => {
        state.isLoading = false;
      })

      //get current play
      .addCase(getCurrentPlay.pending, state => {
        state.isLoading = true;
      })
      .addCase(getCurrentPlay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPlay = action.payload;
      })
      .addCase(getCurrentPlay.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {setTokenData, clearTokenData} = spotifySlice.actions;
export const spotifyReducer = spotifySlice.reducer;
