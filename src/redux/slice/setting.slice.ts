import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  ActiveKey,
  CameraSetting,
  SettingState,
} from '../../models/setting.model';
import {ColorDefault} from '../../util/colors';
import {activeKey} from '../action/setting.action';

const initialState: SettingState = {
  cameraSettings: {
    cameraId: '0',
    format: 0,
    flash: false,
  },
  appVersion: '',
  optionFriend: false,
  unlimitedTrimVideo: false,
  trySoftwareEncode: false,
  usingSpotifyMod: false,
  postStyle: ColorDefault,
  showDonate: true,
  activeKey: {},
};

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    setCameraSettings(state, action: PayloadAction<CameraSetting>) {
      state.cameraSettings = {
        ...state.cameraSettings,
        ...action.payload,
      };
    },

    setCurrentVersion(state, action: PayloadAction<string>) {
      state.appVersion = action.payload;
    },

    setOptionFriend(state, action: PayloadAction<boolean>) {
      state.optionFriend = action.payload;
    },

    setUnlimitedTrimVideo(state, action: PayloadAction<boolean>) {
      state.unlimitedTrimVideo = action.payload;
    },

    setTrySoftwareEncode(state, action: PayloadAction<boolean>) {
      state.trySoftwareEncode = action.payload;
    },

    setPostStyle(state, action) {
      state.postStyle = action.payload;
    },

    setUsingSpotifyMod(state, action: PayloadAction<boolean>) {
      state.usingSpotifyMod = action.payload;
    },

    setShowDonate(state, action: PayloadAction<boolean>) {
      state.showDonate = !action.payload;
    },

    setSetting(state, action) {
      const data = JSON.parse(action.payload);
      state.cameraSettings = data.cameraSettings;
      state.appVersion = data.appVersion;
    },

    setActiveKey(state, action: PayloadAction<ActiveKey | null>) {
      if (action.payload) {
        const {key, email} = action.payload;
        state.activeKey[email] = {key, email};
      } else {
        state.activeKey = {};
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(activeKey.fulfilled, (state, action) => {
      const {key, email} = action.payload;
      state.activeKey[email] = {key, email};
    });
  },
});

export const {
  setCameraSettings,
  setCurrentVersion,
  setOptionFriend,
  setUnlimitedTrimVideo,
  setTrySoftwareEncode,
  setPostStyle,
  setSetting,
  setShowDonate,
  setUsingSpotifyMod,
  setActiveKey,
} = settingSlice.actions;

export default settingSlice.reducer;
