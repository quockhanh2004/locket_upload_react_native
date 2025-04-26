export interface SimplifiedTrack {
  id: string;
  name: string;
  artists: string; // tên ca sĩ
  imageUrl: string; // ảnh album
  previewUrl: string | null; // link nhạc 30s
  isrc: string | null; // mã bản ghi âm quốc tế
}
