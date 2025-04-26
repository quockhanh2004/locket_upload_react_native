import queryString from 'query-string';
import {Linking} from 'react-native';

const config = {
  client_id: '2b73a74730dc405e9a58e748ce7f1766',
  redirect_uri: 'locketupload.spotify://oauth',
  response_type: 'code',
  scope: 'user-read-private user-read-email',
};

function authorization() {
  Linking.openURL(
    'https://accounts.spotify.com/authorize?' + queryString.stringify(config),
  );
}

export const SpotifyAuth = {
  authorization,
  config,
};
