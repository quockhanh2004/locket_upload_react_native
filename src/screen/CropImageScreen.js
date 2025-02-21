import {View} from 'react-native-ui-lib';
import React, {useRef} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import {useNavigation, useRoute} from '@react-navigation/native';

import {nav} from '../navigation/navName';
import {resizeImage} from '../util/uploadImage';
import MainButton from '../components/MainButton';
import Header from '../components/Header';

const CropImageScreen = () => {
  const navigation = useNavigation();
  const cropViewRef = useRef();
  const route = useRoute();
  const {imageUri} = route.params;

  // Hàm xử lý khi cắt ảnh xong
  const handleCrop = async () => {
    cropViewRef.current.saveImage(true, 100); // Cắt ảnh, chất lượng 100%
  };

  const onCrop = async res => {
    const croppedImageUri = `file://${res.uri}`;

    //giảm kích thước ảnh lại trước khi upload lên
    const newImage = await resizeImage(croppedImageUri);
    navigation.navigate(nav.home, {uri: {...newImage, type: 'PNG'}});
  };

  return (
    <View flex bg-black>
      <View flex>
        <CropView
          sourceUrl={imageUri}
          style={{width: '100%', height: '100%'}}
          ref={cropViewRef}
          keepAspectRatio
          onImageCrop={onCrop}
        />
      </View>

      <View marginB-100>
        <MainButton label="Cắt ảnh" onPress={handleCrop} />
      </View>
      <Header />
    </View>
  );
};

export default CropImageScreen;
