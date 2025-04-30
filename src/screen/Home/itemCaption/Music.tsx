/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Typography,
  Colors,
} from 'react-native-ui-lib';
import {SpotifyAuth} from '../../../services/Spotify';
import {AppState, Dimensions, Linking, Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../redux/store';
import TextTicker from 'react-native-text-ticker';
import {getCurrentPlay} from '../../../redux/action/spotify.action';
import {useIsFocused} from '@react-navigation/native';
import {t} from '../../../languages/i18n';
import {hapticFeedback} from '../../../util/haptic';

interface ItemMusicProps {
  isFocus: boolean;
}

const screenWidth = Dimensions.get('window').width;

const ItemMusic: React.FC<ItemMusicProps> = ({isFocus}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {usingSpotifyMod} = useSelector((state: RootState) => state.setting);

  const {isLoading, currentPlay, tokenData} = useSelector(
    (state: RootState) => state.spotify,
  );

  const handleLogin = () => {
    hapticFeedback();
    SpotifyAuth.authorization();
  };

  const handleSelectMusic = async () => {
    hapticFeedback();
    if (usingSpotifyMod) {
      await Linking.openURL('spotify://');
      return;
    }

    try {
      const supported = await Linking.canOpenURL('spotify://');
      if (supported) {
        await Linking.openURL('spotify://');
      } else {
        const storeUrl =
          Platform.OS === 'android'
            ? 'https://play.google.com/store/apps/details?id=com.spotify.music'
            : 'https://apps.apple.com/app/spotify-music-and-podcasts/id324684580';

        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      console.error('Lỗi mở Spotify:', error);
    }
  };

  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/background|inactive/) &&
        nextAppState === 'active'
      ) {
        console.log('App đã quay lại foreground');

        if (isFocused && isFocus && tokenData?.access_token) {
          dispatch(getCurrentPlay({token: tokenData?.access_token || ''}));
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, isFocus, isFocused, tokenData]);

  if (isLoading) {
    return (
      <View width={screenWidth - 24} center>
        <Text
          text70BL
          white
          style={{
            padding: 16,
            backgroundColor: Colors.spotify,
            borderRadius: 999,
          }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!tokenData) {
    return (
      <View width={screenWidth - 24} center>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            padding: 16,
            backgroundColor: Colors.spotify,
            borderRadius: 999,
          }}>
          <Text text70BL white>
            {t('login_spotify')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View width={screenWidth - 24} center>
        <TouchableOpacity
          onPress={handleSelectMusic}
          row
          style={{
            padding: 16,
            backgroundColor: Colors.spotify,
            borderRadius: 999,
          }}>
          {!currentPlay ? (
            <Text text70BL white>
              {t('select_music')}
            </Text>
          ) : (
            <View center>
              <TextTicker
                style={{
                  ...Typography.text70BL,
                  color: 'white',
                  textAlign: 'center',
                }}
                duration={5000}
                loop
                bounce={false}
                repeatSpacer={50}
                marqueeDelay={1000}>
                {currentPlay.name} - {currentPlay.artists}
              </TextTicker>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ItemMusic;
