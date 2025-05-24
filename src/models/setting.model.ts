export interface CameraSetting {
  cameraId?: string;
  format?: number;
  flash?: boolean;
}

export interface PostStyle {
  color_top?: string;
  color_bot?: string;
  text_color: string;
}

export interface SettingState {
  cameraSettings: CameraSetting;
  appVersion: string;
  optionFriend: boolean;
  unlimitedTrimVideo: boolean;
  trySoftwareEncode: boolean;
  usingSpotifyMod: boolean;
  postStyle: PostStyle;
  showDonate: boolean;
  loadingGetKey: boolean;
  responseGetKey: any;
  activeKey: {
    [key: string]: ActiveKey;
  };
}

export interface ActiveKey {
  key: string;
  email: string;
}
