import React from 'react';
import {StyleSheet, Dimensions, StyleProp, ImageStyle} from 'react-native';
import {Image} from 'react-native-ui-lib';

const screenWidth = Dimensions.get('window').width;

interface ImageViewProps {
  uri: string;
  customStyle?: StyleProp<ImageStyle>;
}

const ImageView: React.FC<ImageViewProps> = ({uri, customStyle}) => {
  return (
    <Image
      source={{uri}}
      style={[styles.imageStyle, customStyle]}
      resizeMode="cover"
    />
  );
};

export default React.memo(ImageView);

const styles = StyleSheet.create({
  imageStyle: {
    width: screenWidth - 32,
    height: screenWidth - 32,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#333',
  },
});
