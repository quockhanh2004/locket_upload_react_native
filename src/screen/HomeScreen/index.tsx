/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

// React & React Native Imports
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';

// UI Library Imports
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
} from 'react-native-ui-lib';

// Redux Imports
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {setMessage} from '../../redux/slice/message.slice';
import {clearPostMoment} from '../../redux/slice/postMoment.slice';
import {getOldPosts} from '../../redux/action/getOldPost.action';
import {setPostStyle} from '../../redux/slice/setting.slice';

// Firebase Imports

// Third-party Library Imports
import {showEditor} from 'react-native-video-trim';
import {Asset} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

// Local Component/Util Imports
import PostForm from './PostForm';
import SelectFriendDialog from '../../Dialog/SelectFriendDialog';
import SelectMediaDialog from '../../Dialog/SelectMediaDialog';
import SelectColorDialog from '../../Dialog/SelectColorSwatchDialog';
import {nav} from '../../navigation/navName';
import {selectMedia} from '../../util/selectImage';
import {clearAppCache} from '../../util/uploadImage';
import {deleteAllMp4Files} from '../../util/uploadVideo';
import useTrimVideo from '../../hooks/useTrimVideo';
import {DefaultOverlayCreate, OverLayCreate} from '../../util/bodyMoment';
import {t} from 'i18next';
import {hapticFeedback} from '../../util/haptic';
import {onPostMoment} from './functions/PostMoment';
import useUserNotificationsAndData from './functions/useUserNotificationsAndData';

// --- Type Definitions ---

interface RouteParams {
  from?: string;
  uri?: string;
  camera?: Asset; // Giữ nguyên kiểu 'any' nếu bạn chắc chắn, nhưng Asset có vẻ phù hợp hơn
}

interface MediaType {
  uri: string;
  type?: 'video' | 'image' | string; // Thêm gợi ý type
}

let navigation: NavigationProp<any>;

const HomeScreen = () => {
  const componentNavigation = useNavigation<NavigationProp<any>>(); // Lấy navigation từ hook
  const route = useRoute<RouteProp<{params: RouteParams}>>();
  const dispatch = useDispatch<AppDispatch>();
  const trimmedVideoUri = useTrimVideo();

  navigation = componentNavigation;

  const {user, userInfo} = useSelector((state: RootState) => state.user);
  const {postMoment, isLoading} = useSelector(
    (state: RootState) => state.postMoment,
  );
  const {useCamera, unlimitedTrimVideo, postStyle} = useSelector(
    (state: RootState) => state.setting,
  );
  const {selected, optionSend, customListFriends, isLoadFriends} = useSelector(
    (state: RootState) => state.friends,
  );

  // --- Component State ---
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [caption, setCaption] = useState('');
  const [overlay, setOverlay] = useState<OverLayCreate>({
    ...DefaultOverlayCreate,
    postStyle: postStyle,
  });
  const [isVideo, setIsVideo] = useState(false);
  const [visibleSelectMedia, setVisibleSelectMedia] = useState(false);
  const [visibleSelectFriend, setVisibleSelectFriend] = useState(false);
  const [visibleSelectColor, setVisibleSelectColor] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // --- Effects ---

  // Effect chạy 1 lần khi mount: Xử lý notification ban đầu và kiểm tra/làm mới token/lấy thông tin user
  useUserNotificationsAndData(user, isLoadFriends);

  // Effect xử lý kết quả trả về từ màn hình Crop hoặc Camera
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {params} = route;
      let processed = false;

      if (params?.from === nav.crop && params?.uri) {
        setSelectedMedia({uri: params.uri, type: 'image'});
        setIsVideo(false);
        processed = true;
      } else if (params?.from === nav.camera && params?.camera) {
        compressMedia(params.camera);
        processed = true;
      }

      if (processed || params?.from) {
        clearNavigation();
      }
    });

    return unsubscribe;
  }, [route]); // Chỉ phụ thuộc route vì navigation được cập nhật vào biến module-level

  // Effect chạy mỗi khi màn hình được focus: Lấy bài đăng cũ hơn
  useFocusEffect(
    useCallback(() => {
      if (
        user?.localId &&
        user.idToken &&
        user.timeExpires &&
        +user.timeExpires > new Date().getTime()
      ) {
        dispatch(
          getOldPosts({
            userId: user.localId,
            token: user.idToken,
          }),
        );
      }
    }, [user?.localId, user?.idToken, user?.timeExpires]),
  );

  // Effect xử lý sau khi đăng bài thành công
  useEffect(() => {
    if (postMoment) {
      dispatch(setMessage({message: postMoment, type: t('success')}));
      dispatch(clearPostMoment());
      setSelectedMedia(null);
      setCaption('');
      setOverlay(DefaultOverlayCreate);
      setIsVideo(false);
      clearAppCache();
      deleteAllMp4Files(RNFS.DocumentDirectoryPath);
    }
  }, [postMoment, dispatch]);

  // Effect xử lý kết quả trả về từ hook cắt video
  useEffect(() => {
    if (trimmedVideoUri === 'cancel') {
      console.log('Video trimming cancelled');
      setSelectedMedia(null);
    } else if (trimmedVideoUri) {
      setSelectedMedia({uri: trimmedVideoUri, type: 'video'});
      setIsVideo(true);
    }
  }, [trimmedVideoUri]);

  // Effect cập nhật overlay khi style bài đăng thay đổi
  useEffect(() => {
    setOverlay(prevOverlay => ({
      ...prevOverlay,
      postStyle: postStyle,
    }));
  }, [postStyle]);

  // --- Event Handlers ---

  const handleViewPost = () => {
    hapticFeedback();
    navigationTo(nav.posts);
  };

  const handleSelectMedia = async () => {
    if (useCamera) {
      setVisibleSelectMedia(true);
    } else {
      await handleConfirmSelectMedia('gallery');
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setIsVideo(false);
  };

  const handleViewProfile = () => {
    navigationTo(nav.accountInfo);
  };

  const handlePost = async () => {
    onPostMoment({
      caption,
      customListFriends,
      dispatch,
      optionSend,
      overlay,
      selected,
      selectedMedia,
      user,
    });
  };

  const handleCancelSelectMedia = () => {
    setVisibleSelectMedia(false);
  };

  const handleConfirmSelectMedia = async (value: 'gallery' | 'camera') => {
    setVisibleSelectMedia(false);
    setLocalLoading(true);
    await onSelectMedia(value);
    setLocalLoading(false);
  };

  const onSelectMedia = async (from: 'gallery' | 'camera') => {
    try {
      if (from === 'gallery') {
        const result = await selectMedia();
        if (result && result.length > 0 && result[0].uri) {
          compressMedia(result[0]);
        } else {
          console.log('No media selected from gallery or selection cancelled.');
        }
      } else if (from === 'camera') {
        navigationTo(nav.camera);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      dispatch(
        setMessage({message: t('error_select_media'), type: t('error')}),
      );
      setLocalLoading(false);
    }
  };

  const compressMedia = (media: Asset) => {
    setSelectedMedia(null);

    if (!media.uri) {
      console.warn('Selected media is missing URI.');
      return;
    }

    if (media.type?.startsWith('image')) {
      setIsVideo(false);
      navigationTo(nav.crop, {imageUri: media.uri});
    } else if (media.type?.startsWith('video')) {
      setIsVideo(true);
      showEditor(media.uri, {
        maxDuration: unlimitedTrimVideo ? undefined : 7,
        saveButtonText: t('save'),
        cancelButtonText: t('cancel'),
        trimmingText: t('processing'),
        autoplay: true,
        cancelDialogMessage: t('cancel_trim_video'),
        cancelDialogConfirmText: t('yes'),
        cancelDialogCancelText: t('no'),
        enableSaveDialog: false,
        enableHapticFeedback: true,
        type: 'video',
        alertOnFailToLoad: true,
      });
    } else {
      console.warn('Unsupported media type:', media.type);
      dispatch(
        setMessage({message: t('video_type_not_support'), type: t('error')}),
      );
    }
  };

  // --- Render ---
  return (
    <View flex bg-black padding-12>
      {/* Header */}
      <View row spread centerV>
        <Avatar
          source={{uri: userInfo?.photoUrl || undefined}}
          size={36}
          onPress={handleViewProfile}
        />
        <TouchableOpacity onPress={handleViewPost}>
          <View
            padding-8
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.grey40,
            }}>
            <Icon
              assetGroup="icons"
              assetName="ic_menu"
              size={24}
              tintColor={Colors.grey40}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <PostForm
          selectedMedia={selectedMedia}
          isVideo={isVideo}
          onRemoveMedia={handleRemoveMedia}
          onSelectMedia={handleSelectMedia}
          caption={caption}
          setCaption={setCaption}
          isLoading={isLoading}
          onPost={handlePost}
          onSelectFriend={() => setVisibleSelectFriend(true)}
          localLoading={localLoading}
          overlay={overlay}
          setOverlay={setOverlay}
          onLongPress={() => setVisibleSelectColor(true)}
          selectedCount={
            optionSend === 'all'
              ? 0
              : optionSend === 'custom_list'
              ? customListFriends.length
              : selected.length
          }
        />
      </ScrollView>

      {/* Dialogs */}
      <SelectFriendDialog
        visible={visibleSelectFriend}
        onDismiss={() => setVisibleSelectFriend(false)}
      />
      <SelectMediaDialog
        visible={visibleSelectMedia}
        onDismiss={handleCancelSelectMedia}
        onConfirm={handleConfirmSelectMedia}
      />
      <SelectColorDialog
        visible={visibleSelectColor}
        value={postStyle}
        onDismiss={() => setVisibleSelectColor(false)}
        onSelectColor={val => {
          dispatch(setPostStyle(val));
        }}
      />
    </View>
  );
};

// --- Exported Navigation Functions (Giữ lại theo yêu cầu) ---
export const navigationTo = (to: string, data?: any) => {
  // Kiểm tra xem navigation đã được gán chưa trước khi sử dụng
  if (navigation) {
    navigation.navigate(to, data);
  } else {
    console.warn(
      'Navigation object is not yet available. Navigation action ignored.',
    );
  }
};

export const clearNavigation = () => {
  // Kiểm tra xem navigation đã được gán chưa trước khi sử dụng
  if (navigation) {
    navigation.setParams({from: undefined, uri: undefined, camera: undefined});
  } else {
    console.warn(
      'Navigation object is not yet available. Clear params action ignored.',
    );
  }
};

export default HomeScreen;
