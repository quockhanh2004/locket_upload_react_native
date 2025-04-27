import React, {useCallback} from 'react';
import {View, Text, Colors, Icon, TouchableOpacity} from 'react-native-ui-lib';
import {OverlayID, Post} from '../../../models/post.model';
import {parseAltText} from '../../../util/regex';
import {Linking} from 'react-native';

interface CaptionViewProps {
  post: Post;
}

const CaptionView: React.FC<CaptionViewProps> = ({post}) => {
  const overlay = post?.overlays[0];

  const handlePressCaption = useCallback(() => {
    const url = overlay?.data?.payload?.spotify_url;
    if (url) {
      Linking.openURL(url);
    }
  }, [overlay?.data?.payload?.spotify_url]);

  if (post.caption) {
    console.log('Caption:', post.caption);

    return (
      <View>
        <Text color={overlay?.data?.text_color || Colors.white} text60BO center>
          {post.caption}
        </Text>
      </View>
    );
  }

  if (!overlay) {
    return null;
  }

  if (overlay.overlay_id === OverlayID.CaptionReview) {
    const rating = parseAltText(overlay.alt_text);

    if (!rating) {
      return null;
    }
    return (
      <View>
        <Text color={overlay.data.text_color || Colors.white} text60BO center>
          {`${rating.rating}`}
          <Text primary text60BO>
            {'★'}
          </Text>
          {` | ${rating.text}`}
        </Text>
      </View>
    );
  }

  const hasImageIcon = overlay.data?.icon?.data?.includes('http');
  const iconData = overlay.data?.icon?.data;
  const textColor = overlay.data?.text_color || Colors.white;
  const altText = overlay.alt_text;

  if (hasImageIcon) {
    console.log(iconData);

    return (
      <TouchableOpacity
        onPress={handlePressCaption}
        disabled={!overlay?.data?.payload?.spotify_url}>
        <View row gap-8 center>
          <Icon source={{uri: iconData}} size={32} borderRadius={8} />
          <Text color={textColor} text60BO center>
            {altText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <Text color={textColor} text60BO center>
        {iconData === 'clock.fill' ? '🕒 ' : iconData ? `${iconData} ` : ''}
        {altText}
      </Text>
    </View>
  );
};

export default React.memo(CaptionView);
