export interface Post {
  id: string;
  caption?: string;
  thumbnail_url: string;
  video_url?: string;
  user: string;
  canonical_uid: string;
  md5: string;
  date: number;
  create_time: number;
  update_time: number;
  overlays?: OverlayPost[];
}

export interface OverlayPost {
  overlay_id: string;
  overlay_type: string;
  alt_text?: string;
  data?: DataPost;
}

export interface DataPost {
  type: string;
  text: string;
  text_color: string;
  max_lines: number;
  background: Background;
}

export interface Background {
  material_blur: string;
  colors: any[];
}
