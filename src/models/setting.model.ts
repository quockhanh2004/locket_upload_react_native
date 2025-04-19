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
