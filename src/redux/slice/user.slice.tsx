import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  enableLocketGold,
  getAccountInfo,
  getToken,
  login,
  resetPassword,
  updateAvatar,
  updateDisplayName,
} from '../action/user.action';

export interface User {
  kind?: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered?: boolean;
  profilePicture?: string;
  refreshToken: string;
  expiresIn?: string;
  timeExpires?: any;

  photoUrl?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  passwordUpdatedAt?: number;
  providerUserInfo?: ProviderUserInfo[];
  validSince?: string;
  lastLoginAt?: string;
  createdAt?: string;
  customAuth?: boolean;
  phoneNumber?: string;
  customAttributes?: string;
  lastRefreshAt?: Date;
}

export interface ProviderUserInfo {
  providerId: string;
  rawId: string;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  federatedId?: string;
  email?: string;
}

export interface UserInfo {
  kind: string;
  users: User[];
}

interface TypeUserSlice {
  user: User | null | undefined;
  userInfo: UserInfo | null | undefined;
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

      //get account information
      .addCase(getAccountInfo.pending, state => {
        state.isLoading = true;
      })
      .addCase(
        getAccountInfo.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.isLoading = false;
          if (state.user) {
            state.user.photoUrl = action.payload.users[0].photoUrl || '';
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

export const {logout, clearStatus, setToken} = userSlice.actions;

export default userSlice.reducer;
