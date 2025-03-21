/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
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
import {
  uploadImageToFirebaseStorage,
  uploadVideoToFirebase,
} from '../redux/action/postMoment.action';
import {setMessage} from '../redux/slice/message.slice';
import {clearPostMoment} from '../redux/slice/postMoment.slice';
import {clearAppCache} from '../util/uploadImage';
import {
  getInitialNotification,
  getMessaging,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import {handleNotificationClick} from '../services/Notification';
import {showEditor} from 'react-native-video-trim';
import useTrimVideo from '../hooks/useTrimVideo';
import {deleteAllMp4Files} from '../util/uploadVideo';
import SelectMediaDialog from '../Dialog/SelectMediaDialog';
import ViewMedia from '../components/ViewMedia';

let navigation;

const HomeScreen = () => {
  const messaging = getMessaging(getApp());
  const dispatch = useDispatch();
  navigation = useNavigation();
  const route = useRoute();

  //redux state
  const {user, userInfo} = useSelector(state => state.user);
  const {postMoment, isLoading, progressUpload} = useSelector(
    state => state.postMoment,
  );
  const {useCamera} = useSelector(state => state.setting);

  //use state
  const [selectedMedia, setselectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [visibleSelectMedia, setVisibleSelectMedia] = useState(false);

  useEffect(() => {
    clearAppCache();

    getInitialNotification(messaging).then(async remoteMessage => {
      handleNotificationClick(remoteMessage?.data || {});
    });

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
    }, 3500);
  }, []);

  // Lắng nghe sự kiện khi cắt ảnh xong
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      switch (route.params?.from) {
        case nav.crop:
          if (route.params?.uri) {
            setselectedMedia(route.params.uri);
            navigation.setParams({uri: undefined});
          }
          break;
        case nav.camera:
          if (route.params?.camera) {
            compressMedia(route.params.camera);
            navigation.setParams({uri: undefined});
          }
          break;

        default:
          console.log(route.params);
          navigation.setParams({uri: undefined});
          break;
      }
      console.log('focus');
    });

    return unsubscribe; // Hủy đăng ký listener khi component unmount
  }, [navigation, route]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSelectMedia = () => {
    if (useCamera) {
      setVisibleSelectMedia(true);
    } else {
      handleConfirmSelectMedia('gallery');
    }
  };

  const handleRemoveImage = () => {
    setselectedMedia(null);
  };

  const handleViewProfile = () => {
    navigation.navigate(nav.accountInfo);
  };

  const handlePost = async () => {
    if (selectedMedia?.type === 'video') {
      dispatch(
        uploadVideoToFirebase({
          idUser: user.localId,
          idToken: user.idToken,
          videoInfo: selectedMedia,
          caption,
          refreshToken: user.refreshToken,
        }),
      );
    } else {
      dispatch(
        uploadImageToFirebaseStorage({
          idUser: user.localId,
          idToken: user.idToken,
          imageInfo: selectedMedia,
          caption,
          refreshToken: user.refreshToken,
        }),
      );
    }
  };

  const handleCancelSelectMedia = () => {
    setVisibleSelectMedia(false);
  };

  const handleConfirmSelectMedia = value => {
    onSelectMedia(value);
  };

  const onSelectMedia = async from => {
    let result;
    if (from === 'gallery') {
      result = await selectMedia();
      compressMedia(result[0]);
    } else if (from === 'camera') {
      navigationTo(nav.camera);
    } else {
      return;
    }
  };

  const compressMedia = media => {
    setselectedMedia('');

    if (media?.type?.startsWith('image')) {
      setIsVideo(false);
      navigation.navigate(nav.crop, {
        imageUri: media.uri,
      });
    } else if (media?.type?.startsWith('video')) {
      showEditor(media.uri, {
        maxDuration: 7,
        saveButtonText: 'Save',
      });
      setIsVideo(true);
      return;
    }
  };

  useEffect(() => {
    if (postMoment) {
      dispatch(
        setMessage({
          message: postMoment,
          type: 'Success',
        }),
      );
      dispatch(clearPostMoment());
      setselectedMedia(null);
      //xóa cache của app sau khi upload thành công
      clearAppCache();
      deleteAllMp4Files('/data/user/0/com.locket_upload/files/');
      setCaption('');
    }
  }, [postMoment]);

  useEffect(() => {
    if (!progressUpload) {
      return;
    }
    console.log(progressUpload);

    dispatch(
      setMessage({
        message: `${progressUpload?.state}`,
        type: 'Info',
        hideButton: true,
        progress: progressUpload.progress,
      }),
    );
  }, [progressUpload]);

  const uriVideo = useTrimVideo();

  useEffect(() => {
    if (uriVideo) {
      setselectedMedia({uri: uriVideo, type: 'video'});
    }
  }, [uriVideo]);

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
        <ViewMedia
          selectedMedia={selectedMedia}
          isVideo={isVideo}
          onRemoveMedia={handleRemoveImage}
          onSelectMedia={handleSelectMedia}
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
      <SelectMediaDialog
        visible={visibleSelectMedia}
        onDismiss={handleCancelSelectMedia}
        onConfirm={handleConfirmSelectMedia}
      />
    </View>
  );
};

export const navigationTo = (to, data) => {
  navigation.navigate(to, data);
};

export default HomeScreen;
