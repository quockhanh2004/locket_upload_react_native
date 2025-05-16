/* eslint-disable react-native/no-inline-styles */
import {View} from 'react-native-ui-lib';
import React, {useEffect, useRef} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import {useRoute} from '@react-navigation/native';

import {nav} from '../navigation/navName';
import {resizeImage} from '../util/uploadImage';
import MainButton from '../components/MainButton';
import Header from '../components/Header';
import {BackHandler} from 'react-native';
import {t} from '../languages/i18n';
import {navigationTo} from '../navigation/HomeNavigation';
import {hapticFeedback} from '../util/haptic';

const CropImageScreen = () => {
  const cropViewRef = useRef<any>();
  const route = useRoute<any>();
  const imageUri = route.params?.imageUri;

  // Hàm xử lý khi cắt ảnh xong
  const handleCrop = async () => {
    cropViewRef.current.saveImage(true, 100); // Cắt ảnh, chất lượng 100%
  };

  const onCrop = async (res: {uri: string}) => {
    const croppedImageUri = `file://${res.uri}`;

    //giảm kích thước ảnh lại trước khi upload lên
    const newImage = await resizeImage(croppedImageUri);
    navigationTo(nav.home, {...newImage, type: 'PNG', from: nav.crop});
  };

  //xử lý sự kiện back
  useEffect(() => {
    const backAction = () => {
      navigationTo(nav.home, {uri: null, from: nav.crop});
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  return (
    <View flex bg-black>
      <Header
        leftIconAction={() => {
          hapticFeedback();
          navigationTo(nav.home, {uri: null, from: nav.crop});
        }}
      />
      <View flex>
        <CropView
          sourceUrl={imageUri}
          style={{width: '100%', height: '100%'}}
          ref={cropViewRef}
          keepAspectRatio
          onImageCrop={onCrop}
        />
      </View>

      <View marginB-100 padding-12>
        <MainButton label={t('crop_photo')} onPress={handleCrop} />
      </View>
    </View>
  );
};

export default CropImageScreen;
