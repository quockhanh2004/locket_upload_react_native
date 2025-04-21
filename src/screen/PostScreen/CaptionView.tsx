/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import {OverlayID, Post} from '../../models/post.model';
import {parseAltText} from '../../util/regex';

interface CaptionViewProps {
  post: Post;
}

const CaptionView: React.FC<CaptionViewProps> = ({post}) => {
  if (post.caption) {
    return (
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 999,
        }}
        paddingH-16
        paddingV-8>
        <Text white text60BO center>
          {post.caption}
        </Text>
      </View>
    );
  }

  if (post.overlays.length > 0) {
    const overLay = post.overlays[0];
    if (overLay.overlay_id === OverlayID.CaptionTime) {
      return (
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 999,
          }}
          paddingH-16
          paddingV-8>
          <Text white text60BO center>
            {`🕒 ${overLay.alt_text}`}
          </Text>
        </View>
      );
    }

    if (overLay.overlay_id === OverlayID.CaptionReview) {
      const rating = parseAltText(overLay.alt_text);

      return (
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 999,
          }}
          paddingH-16
          paddingV-8>
          <Text white text60BO center>
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
