import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  enableLocketGold,
  getAccountInfo,
  getToken,
  login,
  loginPhone,
  resetPassword,
  updateAvatar,
  updateDisplayName,
} from '../action/user.action';
import {User} from '../../models/user.model';

interface TypeUserSlice {
  user: User | null | undefined;
  userInfo: User | null | undefined;
  isLoading: boolean;
  resetPasswordLoading: boolean;
  updateAvatarLoading: boolean;
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    userInfo: null,
    isLoading: false,
    resetPasswordLoading: false,
    updateAvatarLoading: false,
  } as TypeUserSlice,

  reducers: {
    logout(state) {
      state.user = null;
      state.userInfo = null;
      state.isLoading = false;
    },
    clearStatus: state => {
      state.isLoading = false;
      state.updateAvatarLoading = false;
    },
    setToken: (state, action) => {
      if (state.user) {
        state.user.idToken = action.payload.access_token;
        state.user.refreshToken = action.payload.refresh_token;
      }
    },

    setUser: (state, action) => {
      const data = JSON.parse(action.payload);

      state.user = data.user;
      state.userInfo = data.userInfo;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        if (state.user) {
          let now = new Date().getTime() + 3600 * 1000;
          state.user.timeExpires = now;
        }
      })
      .addCase(login.rejected, state => {
        state.isLoading = false;
      })

      .addCase(loginPhone.pending, state => {
        state.isLoading = true;
      })
      .addCase(loginPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        if (state.user) {
          let now = new Date().getTime() + 3600 * 1000;
          state.user.timeExpires = now;
        }
      })
      .addCase(loginPhone.rejected, state => {
        state.isLoading = false;
      })

      //get account information
      .addCase(getAccountInfo.pending, state => {
        state.isLoading = true;
      })
      .addCase(
        getAccountInfo.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          if (state.user) {
            state.user.photoUrl = action.payload?.photoUrl;
          }

          state.userInfo = action.payload;
        },
      )
      .addCase(getAccountInfo.rejected, state => {
        state.isLoading = false;
      })

      //refresh token
      .addCase(getToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(getToken.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.idToken = action.payload.access_token;
          state.user.refreshToken = action.payload.refresh_token;
          state.user.expiresIn = action.payload.expiresIn;
          let now = new Date().getTime() + 3600 * 1000;
          state.user.timeExpires = now;
        }
      })
      .addCase(getToken.rejected, state => {
        state.isLoading = false;
      })

      //reset password
      .addCase(resetPassword.pending, state => {
        state.resetPasswordLoading = true;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.resetPasswordLoading = false;
      })
      .addCase(resetPassword.rejected, state => {
        state.resetPasswordLoading = false;
      })

      //update display name
      .addCase(updateDisplayName.pending, state => {
        state.isLoading = true;
      })
      .addCase(updateDisplayName.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(updateDisplayName.rejected, state => {
        state.isLoading = false;
      })

      //update avatar
      .addCase(updateAvatar.pending, state => {
        state.updateAvatarLoading = true;
      })
      .addCase(updateAvatar.fulfilled, state => {
        state.updateAvatarLoading = false;
      })
      .addCase(updateAvatar.rejected, state => {
        state.updateAvatarLoading = false;
      })

      //change badge type
      .addCase(enableLocketGold.pending, state => {
        state.isLoading = true;
      })
      .addCase(enableLocketGold.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(enableLocketGold.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const {logout, clearStatus, setToken, setUser} = userSlice.actions;

export default userSlice.reducer;
