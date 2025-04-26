import queryString from 'query-string';
import {Linking} from 'react-native';
import {SimplifiedTrack} from '../models/spotify.model';
import axios from 'axios';

const config = {
  client_id: '2b73a74730dc405e9a58e748ce7f1766',
  redirect_uri: 'locketupload.spotify://oauth',
  response_type: 'code',
  scope: 'user-read-currently-playing user-read-playback-state',
};

function authorization() {
  Linking.openURL(
    'https://accounts.spotify.com/authorize?' + queryString.stringify(config),
  );
}

/**
 * Parse response hiện tại từ Spotify API
 * @param response Response trả về từ API /me/player/currently-playing
 * @returns SimplifiedTrack hoặc null
 */
export async function parseSpotifyTrack(
  response: any,
): Promise<SimplifiedTrack | null> {
  if (!response || !response.item) {
    return null;
  }

  const t = response.item;

  // Dọn rác nếu cần
  if (t.album?.available_markets) {
    delete t.album.available_markets;
  }

  let previewUrl = t.preview_url || null;

  // Nếu previewUrl null → thử fetch từ embed page
  if (!previewUrl) {
    previewUrl = await fetchPreviewUrl(t.id);
  }

  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((artist: any) => artist.name).join(', '),
    imageUrl: t.album?.images?.[0]?.url || '',
    previewUrl: previewUrl,
    isrc: t.external_ids?.isrc || null,
  };
}

async function fetchPreviewUrl(trackId: string): Promise<string | null> {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;

  try {
    const response = await axios.get(embedUrl);

    if (response.status !== 200) {
      console.error('Failed to fetch embed page', response.status);
      return null;
    }

    const parsedHtml = response.data;

    const audioPreview = extractAudioPreview(parsedHtml);

    return audioPreview;
  } catch (error) {
    console.error('Error fetching preview url:', error);
  }

  return null;
}

function extractAudioPreview(html: string) {
  // Sử dụng Regular Expression để tìm đoạn chứa "audioPreview"
  const regex = /"audioPreview"\s*:\s*{[^}]*"url"\s*:\s*"([^"]+)"/;
  const match = html.match(regex);

  // Nếu tìm thấy, trả về URL
  if (match && match[1]) {
    return match[1];
  }

  // Nếu không tìm thấy, trả về null
  return null;
}

export const SpotifyAuth = {
  authorization,
  config,
};
