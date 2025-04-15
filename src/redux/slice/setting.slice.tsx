import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CameraSetting {
  cameraId?: string;
  format?: number;
  flash?: boolean;
}

export interface SettingState {
  useCamera: boolean;
  cameraSettings: CameraSetting;
  appVersion: string;
  optionFriend: boolean;
  unlimitedTrimVideo: boolean;
  trySoftwareEncode: boolean;
}

const initialState: SettingState = {
  useCamera: false,
  cameraSettings: {
    cameraId: '0',
    format: 0,
    flash: false,
  },
  appVersion: '',
  optionFriend: false,
  unlimitedTrimVideo: false,
  trySoftwareEncode: false,
};

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    setUseCameraSetting(state, action: PayloadAction<boolean>) {
      state.useCamera = action.payload;
    },

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

    setSetting(state, action) {
      const data = JSON.parse(action.payload);
      state.useCamera = data.useCamera;
      state.cameraSettings = data.cameraSettings;
      state.appVersion = data.appVersion;
    },
  },
});

export const {
  setUseCameraSetting,
  setCameraSettings,
  setCurrentVersion,
  setOptionFriend,
  setUnlimitedTrimVideo,
  setTrySoftwareEncode,
  setSetting,
} = settingSlice.actions;

export default settingSlice.reducer;
