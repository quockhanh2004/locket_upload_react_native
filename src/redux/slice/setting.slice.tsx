import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CameraSetting {
  cameraId: string;
  format: number;
  flash: boolean;
}

const initialState: {useCamera: boolean; cameraSettings: CameraSetting} = {
  useCamera: false,
  cameraSettings: {
    cameraId: '0',
    format: 0,
    flash: false,
  },
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
  },
});

export const {setUseCameraSetting, setCameraSettings} = settingSlice.actions;

export default settingSlice.reducer;
