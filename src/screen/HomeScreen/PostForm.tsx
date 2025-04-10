/* eslint-disable react-native/no-inline-styles */
// components/PostForm.tsx
import React from 'react';
import {
  View,
  Button,
  Colors,
  Typography,
  Text,
  LoaderScreen,
} from 'react-native-ui-lib';
import InputView from '../../components/InputView';
import ViewMedia from '../../components/ViewMedia';
import MainButton from '../../components/MainButton';

interface Props {
  selectedMedia: any;
  isVideo: boolean;
  onRemoveMedia: () => void;
  onSelectMedia: () => void;
  caption: string;
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
      />

      <View flexS>
        <InputView
          placeholder={'Enter caption here...'}
          placeholderTextColor={Colors.white}
          bgColor={Colors.grey40}
          borderColor={Colors.grey40}
          borderWidth={1}
          inputStyle={{color: Colors.white, ...Typography.text70BL}}
          style={{paddingLeft: 10, borderRadius: 999}}
          onChangeText={setCaption}
          value={caption}
        />
      </View>

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
