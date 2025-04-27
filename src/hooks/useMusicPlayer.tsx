import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import SoundPlayer from 'react-native-sound-player';
import {PayloadType} from '../models/post.model';

// Helper function để kiểm tra xem có nên phát nhạc hay không
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
  // Ref để lưu trữ URL đã được load thành công, tránh load lại không cần thiết
  const loadedUrlRef = useRef<string | null>(null);
  // Ref để tránh gọi play/pause liên tục nếu trạng thái không đổi
  const isPlayingRef = useRef(false);

  // --- Effect 1: Xử lý thay đổi AppState ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      // Pause ngay lập tức nếu app vào background/inactive để phản hồi nhanh hơn
      if (nextAppState.match(/inactive|background/)) {
        if (isPlayingRef.current) {
          SoundPlayer.pause();
          isPlayingRef.current = false;
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // --- Effect 2: Xử lý chính việc load và play/pause nhạc ---
  useEffect(() => {
    const play = shouldPlayMusic(
      isActive,
      isFocused,
      currentPreviewUrl,
      isAppActive,
    );

    const manageMusic = async () => {
      try {
        // 1. Xử lý Load nhạc nếu URL thay đổi và hợp lệ
        if (currentPreviewUrl && currentPreviewUrl !== loadedUrlRef.current) {
          // Dừng nhạc cũ trước khi load nhạc mới (nếu có)
          if (loadedUrlRef.current) {
            await SoundPlayer.stop();
            isPlayingRef.current = false;
          }
          await SoundPlayer.loadUrl(currentPreviewUrl);
          loadedUrlRef.current = currentPreviewUrl;
        } else if (!currentPreviewUrl && loadedUrlRef.current) {
          await SoundPlayer.stop();
          loadedUrlRef.current = null;
          isPlayingRef.current = false;
        }

        // 2. Xử lý Play/Pause dựa trên trạng thái mong muốn `play`
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
    return () => {
      // Chỉ pause ở đây thay vì stop để khi quay lại nhanh có thể resume mượt hơn.
      // Việc stop() để giải phóng hoàn toàn sẽ được xử lý khi URL thay đổi hoặc bị gỡ bỏ.
      if (isPlayingRef.current) {
        SoundPlayer.pause();
        isPlayingRef.current = false;
      }
    };
  }, [isActive, isFocused, currentPreviewUrl, isAppActive]);
}
