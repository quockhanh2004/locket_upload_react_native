import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import Video from 'react-native-video';

const screenWidth = Dimensions.get('window').width;

interface VideoPlayerProps {
  uri: string;
  isActive: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({uri, isActive}) => {
  const videoRef = useRef<any>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const onVideoLoad = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  return (
    <Video
      ref={videoRef}
      source={{uri}}
      style={styles.mediaStyle}
      resizeMode="cover"
      paused={!isActive || !isVideoReady}
      onLoad={onVideoLoad}
      repeat
      bufferConfig={{
        minBufferMs: 15000,
        maxBufferMs: 20000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      }}
    />
  );
};

export default React.memo(VideoPlayer);

const styles = StyleSheet.create({
  mediaStyle: {
    width: screenWidth - 32,
    height: screenWidth - 32,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
});
