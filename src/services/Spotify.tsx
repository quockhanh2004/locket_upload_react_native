import {authorize, refresh} from 'react-native-app-auth';

const config = {
  clientId: '2b73a74730dc405e9a58e748ce7f1766',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUrl: 'com.locket_upload://oauth',
  scopes: ['user-read-email', 'playlist-read-private', 'user-library-read'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

export async function loginToSpotify() {
  try {
    const result = await authorize(config);
    console.log('Access token:', result.accessToken);
    return result.accessToken;
  } catch (error) {
    console.error('Error during Spotify login', error);
  }
}

export async function refreshSpotifyToken(refreshToken: string) {
  try {
    const result = await refresh(config, {
      refreshToken,
    });
    console.log('Refreshed access token:', result.accessToken);
    return result.accessToken;
  } catch (error) {
    console.error('Error refreshing Spotify token', error);
  }
}
