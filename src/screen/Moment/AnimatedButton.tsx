import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native-ui-lib';
import MainButton from '../../components/MainButton';
import {t} from '../../languages/i18n';

interface AnimatedButtonsProps {
  isFocusReaction: boolean;
  handleRefresh: () => void;
  viewAll: () => void;
}

const AnimatedButtons: React.FC<AnimatedButtonsProps> = ({
  // isFocusReaction,
  handleRefresh,
  viewAll,
}) => {
  return (
    // <Animated.View
    //   style={[
    //     styles.container,
    //     {
    //       transform: [{translateY}],
    //       opacity,
    //     },
    //   ]}>
    <View gap-12 row spread style={styles.container}>
      <MainButton label={t('refresh')} onPress={handleRefresh} />
      <MainButton label={t('view_all')} onPress={viewAll} />
    </View>
    // </Animated.View>
  );
};

export default AnimatedButtons;

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
});
