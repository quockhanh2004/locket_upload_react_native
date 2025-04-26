/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native-ui-lib';
import {SpotifyAuth} from '../../../services/Spotify';
import {Dimensions} from 'react-native';

interface ItemMusicProps {
  isLogin: boolean;
  onPressSelectMusic: () => void;
}

const screenWidth = Dimensions.get('window').width;

const ItemMusic: React.FC<ItemMusicProps> = ({isLogin, onPressSelectMusic}) => {
  const handleLogin = () => {
    SpotifyAuth.authorization();
  };

  if (!isLogin) {
    return (
      <View width={screenWidth - 24} center>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            padding: 16,
            backgroundColor: '#1DB954',
            borderRadius: 999,
          }}>
          <Text text70BL>Login to Spotify</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View width={screenWidth - 24} center>
      <TouchableOpacity
        onPress={onPressSelectMusic}
        style={{
          padding: 16,
          backgroundColor: '#1DB954',
          borderRadius: 999,
        }}>
        <Text text70BL>Chọn nhạc từ Spotify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemMusic;
