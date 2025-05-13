import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import EmojiPick from './EmojiPick'; // chỉnh lại path cho đúng
import {Colors, View} from 'react-native-ui-lib';
import {hapticFeedback} from '../../../util/haptic';
import Reaction from './Reaction';

interface AnimatedEmojiPickerProps {
  isFocusReaction: boolean;
  setIsFocusReaction: (val: boolean) => void;
  onEmojiSelected: (emoji: string) => void;
  onSendMessage: (message: string) => void;
  isMyMoment: string | null;
}

const AnimatedEmojiPicker: React.FC<AnimatedEmojiPickerProps> = ({
  isFocusReaction,
  setIsFocusReaction,
  onEmojiSelected,
  onSendMessage,
  isMyMoment,
}) => {
  const [abs, setabs] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    hapticFeedback();
    onEmojiSelected(emoji);
  };

  useEffect(() => {
    if (isFocusReaction) {
      setabs(true);
    } else {
      setabs(false);
    }
  }, [isFocusReaction]);

  return (
    <View style={styles.container} absB={abs}>
      {!isMyMoment && (
        <EmojiPick
          onFocusInput={setIsFocusReaction}
          onEmojiSelected={handleEmojiClick}
          onSendMessage={onSendMessage}
        />
      )}
      {isMyMoment && (
        <View row center>
          <Reaction momentId={isMyMoment} />
        </View>
      )}
    </View>
  );
};

export default AnimatedEmojiPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: Colors.transparent,
  },
});
