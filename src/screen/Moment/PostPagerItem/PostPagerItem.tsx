/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import {Post} from '../../../models/post.model';
import {Friend} from '../../../models/friend.model';
import VideoPlayer from './VideoPlayer';
import ImageView from './ImageView';
import CaptionContainer from './CaptionContainer';
import UserInfoBar from './UserInfoBar';

const screenHeight = Dimensions.get('window').height;

interface PostPagerItemProps {
  item: Post;
  isActive: boolean;
  user?: Friend | null;
}

const PostPagerItem: React.FC<PostPagerItemProps> = ({
  item,
  isActive,
  user,
}) => {
  const showImage = !item.video_url;
  const showVideoComponent = !!item.video_url;

  return (
    <View style={styles.modalItemContainer}>
      <View style={{marginTop: -80}}>
        {showVideoComponent && item.video_url && (
          <VideoPlayer uri={item.video_url} isActive={isActive} />
        )}
        {showImage && <ImageView uri={item.thumbnail_url} />}
      </View>

      <CaptionContainer post={item} />
      <UserInfoBar user={user} date={item.date} />
    </View>
  );
};

export default React.memo(PostPagerItem);

const styles = StyleSheet.create({
  modalItemContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
});
