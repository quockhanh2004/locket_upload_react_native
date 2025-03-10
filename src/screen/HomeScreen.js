/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
  Image,
  Typography,
  Button,
  LoaderScreen,
  Text,
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';

import {logout} from '../redux/slice/user.slice';
import {selectMedia} from '../util/selectImage';
import InputView from '../components/InputView';
import {getAccountInfo, getToken} from '../redux/action/user.action';
import {nav} from '../navigation/navName';
import {uploadImageToFirebaseStorage} from '../redux/action/postMoment.action';
import {setMessage} from '../redux/slice/message.slice';
import {clearPostMoment} from '../redux/slice/postMoment.slice';
import {clearAppCache} from '../util/uploadImage';
import {converTime} from '../util/convertTime';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const {user, userInfo} = useSelector(state => state.user);
  const {postMoment, isLoading} = useSelector(state => state.postMoment);

  const [uriMedia, seturiMedia] = useState(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    clearAppCache();
    if (user.timeExpires < new Date().getTime()) {
      dispatch(
        getToken({
          refreshToken: user.refreshToken,
        }),
      );
    }
    setTimeout(() => {
      dispatch(
        getAccountInfo({
          idToken: user.idToken,
          refreshToken: user.refreshToken,
        }),
      );
    }, 2500);
  }, []);

  // Lắng nghe sự kiện khi cắt ảnh xong
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.uri) {
        seturiMedia(route.params.uri);
        console.log(route.params.uri);

        navigation.setParams({uri: undefined});
      }
    });

    return unsubscribe; // Hủy đăng ký listener khi component unmount
  }, [navigation, route]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSelectImage = async () => {
    const result = await selectMedia();
    if (result?.length > 0) {
      seturiMedia('');
      navigation.navigate(nav.crop, {
        imageUri: result[0].uri,
      });
    }
  };

  const handleRemoveImage = () => {
    seturiMedia(null);
  };

  const handleViewProfile = () => {
    navigation.navigate(nav.accountInfo);
  };

  const handlePost = async () => {
    dispatch(
      uploadImageToFirebaseStorage({
        idUser: user.localId,
        idToken: user.idToken,
        imageInfo: uriMedia,
        caption,
        refreshToken: user.refreshToken,
      }),
    );
  };

  useEffect(() => {
    if (postMoment) {
      dispatch(
        setMessage({
          message: postMoment,
          type: 'success',
        }),
      );
      dispatch(clearPostMoment());
      seturiMedia(null);
      //xóa cache của app sau khi upload thành công
      clearAppCache();
      setCaption('');
    }
  }, [postMoment]);

  return (
    <View flex bg-black padding-12>
      <View row spread centerV>
        <Avatar
          source={{uri: userInfo?.users[0]?.photoUrl}}
          size={36}
          onPress={handleViewProfile}
        />
        <TouchableOpacity onPress={handleLogout}>
          <View
            padding-8
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.grey40,
            }}>
            <Icon
              assetGroup="icons"
              assetName="ic_logout"
              size={24}
              tintColor={Colors.grey40}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View centerV flex gap-24>
        <View center>
          <TouchableOpacity
            style={{
              borderRadius: 8,
              borderWidth: 2,
              borderColor: Colors.grey40,
            }}
            onPress={handleSelectImage}>
            {uriMedia ? (
              <View>
                <Image
                  width={264}
                  height={264}
                  source={{uri: uriMedia.uri}}
                  style={{borderRadius: 6}}
                />
                <View absT marginT-4 marginR-4 absR>
                  <TouchableOpacity onPress={handleRemoveImage}>
                    <Icon
                      assetGroup="icons"
                      assetName="ic_cancel"
                      size={24}
                      tintColor={Colors.red30}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Icon
                assetGroup="icons"
                assetName="ic_add"
                tintColor={Colors.grey40}
                size={64}
                margin-100
              />
            )}
          </TouchableOpacity>
        </View>

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
          label={!isLoading && 'Send!'}
          backgroundColor={Colors.primary}
          black
          onPress={handlePost}
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
      </View>
    </View>
  );
};

export default HomeScreen;
