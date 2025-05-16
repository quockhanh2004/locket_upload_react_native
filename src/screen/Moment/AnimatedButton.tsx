/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {View} from 'react-native-ui-lib';
import MainButton from '../../components/MainButton';
import {t} from '../../languages/i18n.ts';

interface AnimatedButtonsProps {
  isFocusReaction: boolean;
  handleRefresh: () => void;
  viewAll: () => void;
}

const AnimatedButtons: React.FC<AnimatedButtonsProps> = ({
  isFocusReaction,
  handleRefresh,
  viewAll,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isFocusReaction ? 100 : 0, // dịch xuống 100px khi focus
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isFocusReaction ? 0 : 1, // mờ dần
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocusReaction]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <View gap-12 row spread>
        <MainButton label={t('refresh')} onPress={handleRefresh} />
        <MainButton label={t('view_all')} onPress={viewAll} />
      </View>
    </Animated.View>
  );
};

export default AnimatedButtons;

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
});
