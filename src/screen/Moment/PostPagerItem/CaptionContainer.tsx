import React from 'react';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CaptionView from './CaptionView';
import {Post} from '../../../models/post.model';
import {Colors} from 'react-native-ui-lib';

interface CaptionContainerProps {
  post: Post;
}

const CaptionContainer: React.FC<CaptionContainerProps> = ({post}) => {
  const listColor =
    post?.overlays?.[0]?.data?.background?.colors.length >= 2
      ? post.overlays[0].data.background.colors
      : [Colors.grey20, Colors.grey20];

  return (
    <LinearGradient colors={listColor} style={styles.gradientContainer}>
      <CaptionView post={post} />
    </LinearGradient>
  );
};

export default React.memo(CaptionContainer);

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 999,
    justifyContent: 'center',
  },
});
