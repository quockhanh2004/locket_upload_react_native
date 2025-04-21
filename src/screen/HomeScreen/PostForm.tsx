// components/PostForm.tsx
import React, {useEffect, useState} from 'react';
import {View, Button, Colors, Text, LoaderScreen} from 'react-native-ui-lib';
import ViewMedia from '../../components/ViewMedia';
import MainButton from '../../components/MainButton';
import PostPager from './PostPager';
import {OverLayCreate, OverlayType} from '../../util/bodyMoment';

interface Props {
  selectedMedia: any;
  isVideo: boolean;
  localLoading?: boolean;
  overlay?: OverLayCreate | null;
  setOverlay?: (overlay: any) => void;
  onRemoveMedia: () => void;
  onSelectMedia: () => void;
  caption?: string;
  setCaption: (text: string) => void;
  isLoading: boolean;
  onPost: () => void;
  onSelectFriend: () => void;
  selectedCount: number;
}

const PostForm: React.FC<Props> = ({
  selectedMedia,
  isVideo,
  onRemoveMedia,
  onSelectMedia,
  localLoading,
  caption,
  setCaption,
  isLoading,
  onPost,
  onSelectFriend,
  selectedCount,
  setOverlay,
}) => {
  const [type, setType] = useState(OverlayType.standard);
  const [textOverlay, setTextOverlay] = useState('');

  useEffect(() => {
    if (setOverlay) {
      setOverlay({
        overlay_type: type,
        text: textOverlay,
        text_color: '#FFFFFFE6',
      });
    }
  }, [setOverlay, textOverlay, type]);
  return (
    <View centerV flex gap-24>
      <ViewMedia
        selectedMedia={selectedMedia}
        isVideo={isVideo}
        onRemoveMedia={onRemoveMedia}
        onSelectMedia={onSelectMedia}
        localLoading={localLoading || false}
      />

      <PostPager
        setCaption={setCaption}
        caption={caption}
        settype={setType}
        setTextOverlay={setTextOverlay}
      />

      <Button
        label={
          !isLoading
            ? `Send! (to ${selectedCount > 0 ? selectedCount : 'all'} friends)`
            : ''
        }
        backgroundColor={Colors.primary}
        black
        onPress={onPost}
        borderRadius={8}
        disabled={isLoading}
        text70BL>
        {isLoading && (
          <View row center>
            <Text />
            <LoaderScreen color={Colors.white} size={'small'} />
          </View>
        )}
      </Button>

      <View center>
        <MainButton label="Select Friend" onPress={onSelectFriend} />
      </View>
    </View>
  );
};

export default PostForm;
