import {createSlice} from '@reduxjs/toolkit';
import {getAccessToken, refreshAccessToken} from '../action/spotify.action';

type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  time_expired?: number;
};

interface InitialState {
  tokenData: TokenData | null;
  isLoading: boolean;
}

const spotifySlice = createSlice({
  name: 'spotify',
  initialState: {
    tokenData: null,
    isLoading: false,
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
      .addCase(getAccessToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(getAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenData = {
          ...action.payload,
          time_expired: new Date().getTime() + action.payload.expires_in,
        };
      })
      .addCase(getAccessToken.rejected, state => {
        state.isLoading = false;
      })

      .addCase(refreshAccessToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.tokenData) {
          state.tokenData.access_token = action.payload.access_token;
          state.tokenData.refresh_token = action.payload.refresh_token;
          state.tokenData.time_expired =
            new Date().getTime() + action.payload.expires_in;
        }
      })
      .addCase(refreshAccessToken.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {setTokenData, clearTokenData} = spotifySlice.actions;
export const spotifyReducer = spotifySlice.reducer;
