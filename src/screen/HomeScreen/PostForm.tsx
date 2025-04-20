// components/PostForm.tsx
import React from 'react';
import {View, Button, Colors, Text, LoaderScreen} from 'react-native-ui-lib';
import ViewMedia from '../../components/ViewMedia';
import MainButton from '../../components/MainButton';
import PostPager from './PostPager';

interface Props {
  selectedMedia: any;
  isVideo: boolean;
  localLoading?: boolean;
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
}) => {
  return (
    <View centerV flex gap-24>
      <ViewMedia
        selectedMedia={selectedMedia}
        isVideo={isVideo}
        onRemoveMedia={onRemoveMedia}
        onSelectMedia={onSelectMedia}
        localLoading={localLoading || false}
      />

      <PostPager setCaption={setCaption} caption={caption} />

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
