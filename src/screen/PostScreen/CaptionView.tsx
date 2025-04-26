import React from 'react';
import {View, Text, Colors, Icon} from 'react-native-ui-lib';
import {OverlayID, Post} from '../../models/post.model';
import {parseAltText} from '../../util/regex';

interface CaptionViewProps {
  post: Post;
}

const CaptionView: React.FC<CaptionViewProps> = ({post}) => {
  if (post.caption) {
    return (
      <View>
        <Text
          color={post?.overlays[0]?.data?.text_color || Colors.white}
          text60BO
          center>
          {post.caption}
        </Text>
      </View>
    );
  }

  if (post.overlays.length > 0) {
    const overLay = post?.overlays[0];
    if (overLay.overlay_id !== OverlayID.CaptionReview) {
      return (
        <View>
          {overLay.data?.icon?.data?.includes('http') ? (
            <View row gap-8 center>
              <Icon
                source={{uri: overLay.data?.icon?.data}}
                size={32}
                borderRadius={8}
              />
              <Text
                color={post?.overlays[0]?.data?.text_color || Colors.white}
                text60BO
                center>
                {overLay.alt_text}
              </Text>
            </View>
          ) : (
            <Text
              color={post?.overlays[0]?.data?.text_color || Colors.white}
              text60BO
              center>
              {overLay.data?.icon?.data
                ? `${
                    overLay.data?.icon?.data === 'clock.fill'
                      ? '🕒'
                      : overLay.data?.icon?.data
                  } `
                : ''}
              {overLay.alt_text}
            </Text>
          )}
        </View>
      );
    }

    if (overLay.overlay_id === OverlayID.CaptionReview) {
      const rating = parseAltText(overLay.alt_text);

      return (
        <View>
          <Text
            color={post.overlays[0].data.text_color || Colors.white}
            text60BO
            center>
            {`${rating?.rating}`}
            <Text primary text60BO>
              {'★'}
            </Text>
            {` | ${rating?.text}`}
          </Text>
        </View>
      );
    }
  }

  return undefined;
};

export default CaptionView;
