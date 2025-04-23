/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect, useCallback} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {View, Text, Avatar, Image, Colors} from 'react-native-ui-lib';
import Video from 'react-native-video';
import {Post} from '../../models/post.model';
import {Friend} from '../../models/friend.model';
import {timeDiffFromNow} from '../../util/convertTime';
import CaptionView from './CaptionView';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface PostPagerItemProps {
  item: Post;
  isActive: boolean;
  user?: Friend | null;
}

const PostPagerItem: React.FC<PostPagerItemProps> = React.memo(
  ({item, isActive, user}) => {
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<any>(null);

    const onVideoLoad = useCallback(() => {
      setIsVideoReady(true);
      setVideoError(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id]);

    const onVideoError = useCallback(
      (error: any) => {
        console.error(`Video error for item ${item.id}:`, error);
        setIsVideoReady(false);
        setVideoError(true);
      },
      [item.id],
    );

    useEffect(() => {
      if (!isActive && isVideoReady && videoRef.current) {
        videoRef.current.seek(0);
      }
    }, [isActive, isVideoReady]);

    const showImage = !item.video_url || !isVideoReady || videoError;
    const showVideoComponent = item.video_url && !videoError;
    const listColor =
      item?.overlays[0]?.data?.background?.colors.length >= 2
        ? item?.overlays[0]?.data?.background?.colors
        : [Colors.grey40, Colors.grey40];

    return (
      <>
        {/* <Header /> */}
        <View style={styles.modalItemContainer} gap-12>
          <View>
            {showVideoComponent && (
              <View style={styles.mediaStyle}>
                <Video
                  ref={videoRef}
                  source={{uri: item.video_url}}
                  style={styles.mediaStyle}
                  resizeMode="cover"
                  paused={!isActive || !isVideoReady}
                  onLoad={onVideoLoad}
                  onError={onVideoError}
                  repeat
                />
              </View>
            )}
            {showImage && (
              <Image
                source={{uri: item.thumbnail_url}}
                style={[
                  styles.imageStyle,
                  showVideoComponent ? {position: 'absolute'} : null,
                ]}
                resizeMode="cover"
              />
            )}
          </View>

          <LinearGradient
            colors={listColor}
            style={{
              borderRadius: 999,
              padding: !item?.caption && !item?.overlays[0]?.alt_text ? 0 : 12,
              justifyContent: 'center',
            }}>
            <CaptionView post={item} />
          </LinearGradient>
          <View row center>
            <Avatar source={{uri: user?.profile_picture_url}} size={32} />
            <Text marginL-8 white text60BL>
              {user?.first_name}
            </Text>
            <Text marginL-8 grey40 text70BL>
              {timeDiffFromNow(item.date)}
            </Text>
          </View>
        </View>
      </>
    );
  },
);

export default React.memo(PostPagerItem);

const styles = StyleSheet.create({
  mediaStyle: {
    width: screenWidth - 32,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  imageStyle: {
    width: screenWidth - 32,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  modalItemContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
