import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CameraSetting {
  cameraId?: string;
  format?: number;
  flash?: boolean;
}

const initialState: {
  useCamera: boolean;
  cameraSettings: CameraSetting;
  appVersion: string;
} = {
  useCamera: false,
  cameraSettings: {
    cameraId: '0',
    format: 0,
    flash: false,
  },
  appVersion: '',
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
  setSetting,
} = settingSlice.actions;

export default settingSlice.reducer;
