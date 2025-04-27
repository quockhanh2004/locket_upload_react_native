import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import SoundPlayer from 'react-native-sound-player';

export function useGlobalMusicPlayer(
  activeUrl: string | null | undefined,
  shouldPlay: boolean,
) {
  const [appState, setAppState] = useState(AppState.currentState);
  const isAppActive = appState === 'active';

  const loadedUrlRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  // Theo dõi app state
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

  // Quản lý playback
  useEffect(() => {
    const manageMusic = async () => {
      try {
        const canPlay = shouldPlay && !!activeUrl && isAppActive;

        if (activeUrl && activeUrl !== loadedUrlRef.current) {
          await SoundPlayer.stop();
          await SoundPlayer.loadUrl(activeUrl);
          loadedUrlRef.current = activeUrl;
          isPlayingRef.current = false;
        }

        if (canPlay && loadedUrlRef.current) {
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
        console.error('Global music error:', error);
        loadedUrlRef.current = null;
        isPlayingRef.current = false;
      }
    };

    manageMusic();

    return () => {
      if (isPlayingRef.current) {
        SoundPlayer.pause();
        isPlayingRef.current = false;
      }
    };
  }, [activeUrl, shouldPlay, isAppActive]);
}
