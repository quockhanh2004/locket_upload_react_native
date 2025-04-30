/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import EmojiPick from './EmojiPick'; // chỉnh lại path cho đúng
import {Colors} from 'react-native-ui-lib';
import {hapticFeedback} from '../../../util/haptic';

interface AnimatedEmojiPickerProps {
  isFocusReaction: boolean;
  setIsFocusReaction: (val: boolean) => void;
  onEmojiSelected: (emoji: string) => void;
  onSendMessage: (message: string) => void;
  isMyMoment: boolean;
}

const AnimatedEmojiPicker: React.FC<AnimatedEmojiPickerProps> = ({
  isFocusReaction,
  setIsFocusReaction,
  onEmojiSelected,
  onSendMessage,
  isMyMoment,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleEmojiClick = (emoji: string) => {
    hapticFeedback();
    onEmojiSelected(emoji);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isFocusReaction ? 70 : 0, // dịch xuống 100px
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocusReaction]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isMyMoment ? 0 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isMyMoment]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <EmojiPick
        onFocusInput={setIsFocusReaction}
        onEmojiSelected={handleEmojiClick}
        onSendMessage={onSendMessage}
      />
    </Animated.View>
  );
};

export default AnimatedEmojiPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // marginBottom: 70,
    paddingHorizontal: 20,
    backgroundColor: Colors.transparent,
  },
});
