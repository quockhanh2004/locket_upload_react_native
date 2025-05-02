import {OverlayType} from '../util/bodyMoment';

export interface Post {
  id: string;
  caption?: string;
  thumbnail_url: string;
  video_url?: string;
  user: string;
  canonical_uid: string;
  md5?: string;
  date: number;
  create_time: number;
  update_time: number;
  overlays: Overlay[];
}

export interface Overlay {
  overlay_id: OverlayID | string;
  overlay_type: OverlayType | string;
  alt_text: string;
  data: Data;
}

export interface Data {
  type: OverlayType | string;
  text: string;
  text_color: string;
  max_lines: number;
  background: Background;
  payload?: PayloadType;
  icon: IconData;
}

export interface PayloadType {
  artist: string;
  isrc: string;
  preview_url: string;
  song_title: string;
  spotify_url: string;
}

export interface IconData {
  data: string;
  type: string;
}

export interface Background {
  material_blur: string;
  colors: any[];
}

export enum OverlayID {
  CaptionReview = 'caption:review',
  CaptionStandard = 'caption:standard',
  CaptionTime = 'caption:time',
}

export interface Reaction {
  value: string;
  user: string;
  viewed_at: string;
  create_time: string;
}
