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
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../redux/slice/user.slice';
import {selectMedia} from '../util/selectImage';
import InputView from '../component/InputView';
import {getAccountInfo} from '../redux/action/user.action';
import {useNavigation} from '@react-navigation/native';
import {nav} from '../navigation/navName';
import {uploadImageToFirebaseStorage} from '../redux/action/postMoment.action';
import {setMessage} from '../redux/slice/message.slice';
import {clearPostMoment} from '../redux/slice/postMoment.slice';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {user} = useSelector(state => state.user);
  const {postMoment} = useSelector(state => state.postMoment);

  const [uriMedia, seturiMedia] = useState(null);
  const [caption, setCaption] = useState('');

  // console.log(user);

  useEffect(() => {
    dispatch(
      getAccountInfo({idToken: user.idToken, refreshToken: user.refreshToken}),
    );
  }, []);

  // console.log(userInfo?);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSelectImage = async () => {
    const result = await selectMedia();
    if (result?.length > 0) {
      seturiMedia(result[0]);
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
      setCaption('');
    }
  }, [postMoment]);

  return (
    <View flex bg-black padding-12>
      <View row spread centerV>
        <Avatar
          source={{uri: user?.profilePicture}}
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
          label={'Send!'}
          backgroundColor={Colors.primary}
          black
          onPress={handlePost}
          borderRadius={8}
          // disabled={isLoading}
          text70BL>
          {/* {isLoading && (
            <View row center>
              <Text />
              <LoaderScreen color={Colors.white} size={'small'} />
            </View>
          )} */}
        </Button>
      </View>
    </View>
  );
};

export default HomeScreen;
