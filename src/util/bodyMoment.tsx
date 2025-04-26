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
      analytics: {
        experiments: {
          flag_4: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '43',
          },
          flag_10: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '505',
          },
          flag_23: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '400',
          },
          flag_22: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '1203',
          },
          flag_19: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '52',
          },
          flag_18: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '1203',
          },
          flag_16: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '303',
          },
          flag_15: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '501',
          },
          flag_14: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '500',
          },
          flag_25: {
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
            value: '23',
          },
        },
        amplitude: {
          device_id: 'BF5D1FD7-9E4D-4F8B-AB68-B89ED20398A6',
          session_id: {
            value: '1722437166613',
            '@type': 'type.googleapis.com/google.protobuf.Int64Value',
          },
        },
        google_analytics: {
          app_instance_id: '5BDC04DA16FF4B0C9CA14FFB9C502900',
        },
        platform: 'ios',
      },
      sent_to_all: true,
      overlays: [
        {
          overlay_id: `caption:${
            overlay?.overlay_type || OverlayType.standard
          }`,
          overlay_type: 'caption',
          alt_text: overlay?.text,
          data: {
            text: overlay?.text,
            text_color: overlay?.postStyle.text_color || Colors.text,
            type: overlay?.overlay_type || OverlayType.standard,
            max_lines: {
              '@type': 'type.googleapis.com/google.protobuf.Int64Value',
              value: '4',
            },
            background: {
              material_blur: 'ultra_thin',
              colors: [
                overlay?.postStyle?.color_top,
                overlay?.postStyle?.color_bot,
              ],
            },
          },
        },
      ],
    },
  };

  return bodyPostMoment;
};

export enum OverlayType {
  standard = 'standard',
  time = 'time',
  review = 'review',
  music = 'music',
  // party_time = 'party_time',
}

export interface IconOverlay {
  type: string;
  data: string;
  source?: string;
}

export interface OverLayCreate {
  overlay_type: OverlayType;
  text: string;
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
