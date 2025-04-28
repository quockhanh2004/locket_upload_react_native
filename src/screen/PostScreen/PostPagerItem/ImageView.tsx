import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {Image} from 'react-native-ui-lib';

const screenWidth = Dimensions.get('window').width;

interface ImageViewProps {
  uri: string;
}

const ImageView: React.FC<ImageViewProps> = ({uri}) => {
  return <Image source={{uri}} style={styles.imageStyle} resizeMode="cover" />;
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
