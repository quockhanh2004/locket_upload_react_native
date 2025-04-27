import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import SoundPlayer from 'react-native-sound-player';
import {PayloadType} from '../models/post.model';

const shouldPlayMusic = (
  isActive: boolean,
  isFocused: boolean,
  previewUrl: string | undefined | null,
  isAppActive: boolean,
): boolean => {
  return isActive && isFocused && !!previewUrl && isAppActive;
};

export function useMusicPlayer(
  musicCaption: PayloadType | null,
  isActive: boolean,
) {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  const isAppActive = appState === 'active';

  const currentPreviewUrl = musicCaption?.preview_url;

  const loadedUrlRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const lastIsActiveRef = useRef(isActive);

  // --- AppState listener ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      if (nextAppState.match(/inactive|background/) && isPlayingRef.current) {
        SoundPlayer.pause();
        isPlayingRef.current = false;
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  // --- Quản lý nhạc ---
  useEffect(() => {
    const play = shouldPlayMusic(
      isActive,
      isFocused,
      currentPreviewUrl,
      isAppActive,
    );

    const manageMusic = async () => {
      try {
        const needReload =
          currentPreviewUrl &&
          (currentPreviewUrl !== loadedUrlRef.current || // khác URL
            (isActive && !lastIsActiveRef.current)); // active lại

        if (needReload) {
          await SoundPlayer.stop();
          await SoundPlayer.loadUrl(currentPreviewUrl);
          loadedUrlRef.current = currentPreviewUrl;
          isPlayingRef.current = false; // reset trạng thái
        }

        if (play && loadedUrlRef.current) {
          if (!isPlayingRef.current) {
            await SoundPlayer.play();
            isPlayingRef.current = true;
          }
        } else {
          if (isPlayingRef.current) {
            await SoundPlayer.pause();
            isPlayingRef.current = false;
          }
        }
      } catch (error) {
        console.error('Error managing sound:', error);
        isPlayingRef.current = false;
        loadedUrlRef.current = null;
      }
    };

    manageMusic();
    lastIsActiveRef.current = isActive;

    return () => {
      if (isPlayingRef.current) {
        SoundPlayer.pause();
        isPlayingRef.current = false;
      }
    };
  }, [isActive, isFocused, currentPreviewUrl, isAppActive]);
}
