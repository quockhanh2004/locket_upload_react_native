import {Colors} from 'react-native-ui-lib';
import {PostStyle} from '../models/setting.model';
import {ColorDefault} from './colors';
import {getMd5Hash} from './uploadVideo';
import {SimplifiedTrack} from '../models/spotify.model';

export const createBodyVideo = (
  thumbnailUrl: string,
  downloadVideoUrl: string,
  friends?: string[],
  overlay?: OverLayCreate | null,
) => {
  const bodyPostMoment = {
    data: {
      thumbnail_url: thumbnailUrl,
      video_url: downloadVideoUrl,
      md5: getMd5Hash(downloadVideoUrl),
      recipients: friends || [],
      sent_to_all: true,
      overlays:
        overlay?.text && overlay?.text?.length > 0
          ? [
              createOverlay({
                overlay_type: overlay?.overlay_type || OverlayType.standard,
                postStyle: overlay?.postStyle || ColorDefault,
                payload: overlay?.payload,
                text: overlay?.text || undefined,
                icon: overlay?.icon,
              }),
            ]
          : undefined,
    },
  };

  return bodyPostMoment;
};

export enum OverlayType {
  standard = 'standard',
  time = 'time',
  review = 'review',
  music = 'music',
  party_time = 'party_time',
}

export interface IconOverlay {
  type: string;
  data: string;
  source?: string;
}

export interface OverLayCreate {
  overlay_type: OverlayType;
  text?: string;
  postStyle: PostStyle;
  icon?: IconOverlay;
  payload?: SimplifiedTrack | any;
}

export const createOverlay = ({
  overlay_type,
  text,
  postStyle,
  icon,
  payload,
}: OverLayCreate) => {
  return {
    overlay_id: `caption:${overlay_type}`,
    overlay_type: 'caption',
    alt_text: text,
    data: {
      type: overlay_type,
      text,
      text_color: postStyle.text_color,
      max_lines: 4,
      background: {
        material_blur: 'ultra_thin',
        colors: getColors(postStyle),
      },
      icon: icon ? icon : getIcon(overlay_type),
      payload: !payload ? undefined : payload,
    },
  };
};

export const DefaultOverlayCreate: OverLayCreate = {
  overlay_type: OverlayType.standard,
  postStyle: ColorDefault,
  text: '',
};

export const getIcon = (overlayType: OverlayType) => {
  switch (overlayType) {
    case OverlayType.standard:
      return undefined;
    case OverlayType.time:
      return {
        type: 'emoji',
        data: '🕒',
      };
    case OverlayType.review:
      return {};
    default:
      return undefined;
  }
};

export const getColors = (postStyle: PostStyle) => {
  if (!postStyle?.color_bot && !postStyle?.color_top) {
    return [];
  }

  return [
    postStyle?.color_top ?? Colors.grey20,
    postStyle?.color_bot ?? Colors.grey20,
  ];
};
