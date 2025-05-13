import {AliasName} from '../util/SwitchIconApp';

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
  useCamera: boolean;
  cameraSettings: CameraSetting;
  appVersion: string;
  optionFriend: boolean;
  unlimitedTrimVideo: boolean;
  trySoftwareEncode: boolean;
  usingSpotifyMod: boolean;
  postStyle: PostStyle;
  showDonate: boolean;
  customIcon: AliasName;
}
