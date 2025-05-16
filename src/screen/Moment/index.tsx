/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {
  Dimensions,
  FlatList,
  ViewToken,
  Modal,
  InteractionManager,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import {View, GridList} from 'react-native-ui-lib';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../redux/store';
import {navigationTo} from '../Home';
import {nav} from '../../navigation/navName';
import {getOldPosts} from '../../redux/action/getOldPost.action';
import {Friend} from '../../models/friend.model';
import {Post} from '../../models/post.model';
import PostScreenHeader from './PostScreenHeader';
import {removePost} from '../../redux/slice/oldPosts.slice';
import {t} from '../../languages/i18n.ts';
import {useGlobalMusicPlayer} from '../../hooks/useGlobalMusicPlayer';
import {useOldPostsData} from '../../hooks/useOldPostData';
import AnimatedButtons from './AnimatedButton';
import AnimatedEmojiPicker from './PostPagerItem/AnimatedEmojiPicker';
import GridItem from './GridItem';
import PostList from './PostList';
import {momentReaction} from '../../redux/action/postMoment.action';
import {sendMessage} from '../../redux/action/chat.action';
import {hapticFeedback} from '../../utils/device.ts';

interface PostScreenProps {
  initialIndex?: number;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const PostScreen: React.FC<PostScreenProps> = ({initialIndex = 0}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {posts, isLoadPosts, friends, user, response} = useOldPostsData();

  const [isViewerVisible, setIsViewerVisible] = useState<boolean>(true);
  const [indexToView, setIndexToView] = useState<number>(initialIndex);
  const [isFocusReaction, setIsFocusReaction] = useState(false);
  const [filterFriendShow, setFilterFriendShow] = useState<Friend | null>(null);
  const [selectedIndexInModal, setSelectedIndexInModal] =
    useState<number>(initialIndex);

  const listPostByFilter = useMemo(() => {
    if (!filterFriendShow) {
      return posts;
    }
    return posts.filter(p => p.user === filterFriendShow?.uid);
  }, [posts, filterFriendShow]);

  useEffect(() => {
    if (filterFriendShow) {
      handleLoadMore();
    }
  }, [filterFriendShow]);

  const handleLoadMore = () => {
    if (isLoadPosts) {
      return;
    }

    if (
      response?.post?.length === 0 &&
      response?.byUserId === filterFriendShow?.uid
    ) {
      return;
    }

    dispatch(
      getOldPosts({
        userId: user?.localId || '',
        token: user?.idToken || '',
        timestamp:
          listPostByFilter[listPostByFilter?.length - 1]?.date ||
          new Date().getTime() / 1000,
        byUserId: filterFriendShow?.uid,
        isLoadMore: true,
      }),
    );
  };

  const flatListRef = useRef<FlatList>(null);

  const activeUrl = useMemo(() => {
    return (
      listPostByFilter[selectedIndexInModal]?.overlays[0]?.data?.payload
        ?.preview_url || null
    );
  }, [listPostByFilter, selectedIndexInModal]);

  useGlobalMusicPlayer(activeUrl, true);
  const openViewer = (index: number) => {
    setIndexToView(index);
    setIsViewerVisible(true);
  };

  const viewAll = () => {
    hapticFeedback();
    setIsViewerVisible(false);
  };

  const handleBackPress = () => {
    navigationTo(nav.home);
  };

  const handleRefresh = () => {
    hapticFeedback();
    dispatch(
      getOldPosts({
        token: user?.idToken || '',
        userId: user?.localId || '',
        timestamp: new Date().getTime() / 1000,
      }),
    );
  };

  const handleReaction = (emoji: string) => {
    hapticFeedback();
    const currentPost = listPostByFilter[selectedIndexInModal];
    if (currentPost) {
      dispatch(
        momentReaction({
          emoji,
          idToken: user?.idToken || '',
          owner_uid: currentPost.user,
          postId: currentPost.id,
        }),
      );
    }
  };

  const handleSendMessage = (message: string) => {
    hapticFeedback();
    const currentPost = listPostByFilter[selectedIndexInModal];
    dispatch(
      sendMessage({
        msg: message,
        idToken: user?.idToken || '',
        moment_uid: currentPost?.id,
        receiver_uid: currentPost.user,
        client_token: '',
      }),
    );
  };

  const filterFriends = (item: Post) => {
    const find = friends.find(friend => friend.uid === item.user);
    if (
      !find &&
      listPostByFilter[selectedIndexInModal]?.user === user?.localId
    ) {
      return {
        first_name: t('you'),
        profile_picture_url: user?.photoUrl,
        uid: user?.localId,
      };
    }
    return find ? find : null;
  };

  useEffect(() => {
    if (!isViewerVisible || !flatListRef.current) {
      return;
    }
    if (!listPostByFilter || listPostByFilter.length === 0) {
      return;
    }

    const scrollToIndex = indexToView;
    if (scrollToIndex >= listPostByFilter.length) {
      return;
    }

    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: scrollToIndex,
          animated: false,
          viewPosition: 0,
        });
        setSelectedIndexInModal(scrollToIndex);
      }, 50); // delay nhẹ để tránh jank
    });

    return () => interactionHandle.cancel();
  }, [isViewerVisible, indexToView, listPostByFilter]);

  // --- Cập nhật Index hiện tại trong Modal khi người dùng cuộn ---
  const onViewableItemsChangedInModal = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0) {
        const firstVisibleItem = viewableItems[0];
        if (firstVisibleItem.index !== null && firstVisibleItem.isViewable) {
          setSelectedIndexInModal(prevIndex => {
            if (prevIndex !== firstVisibleItem.index) {
              return firstVisibleItem.index!;
            }
            return prevIndex;
          });
        }
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View flex bg-black useSafeArea>
      <PostScreenHeader
        friends={friends}
        user={user}
        filterFriendShow={filterFriendShow}
        setFilterFriendShow={setFilterFriendShow}
      />
      <View height={16} />

      <GridList
        refreshControl={
          <RefreshControl refreshing={isLoadPosts} onRefresh={handleRefresh} />
        }
        data={listPostByFilter}
        numColumns={3}
        keyExtractor={item => item.id}
        itemSpacing={4}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        initialNumToRender={20}
        windowSize={5}
        removeClippedSubviews={true}
        renderItem={({item, index}) => {
          const find = friends.find(friend => friend.uid === item.user);
          if (!find && item.user !== user?.localId) {
            dispatch(removePost(item.id));
            return null;
          }
          return <GridItem item={item} index={index} onPress={openViewer} />;
        }}
      />

      <Modal
        visible={isViewerVisible}
        onRequestClose={handleBackPress}
        animationType="slide"
        transparent={false}>
        <ImageBackground
          style={{
            flex: 1,
            overflow: 'hidden',
            backgroundColor: 'black',
          }}
          blurRadius={50}
          source={{uri: listPostByFilter[selectedIndexInModal]?.thumbnail_url}}>
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)', // chỉnh độ tối ở đây
              flex: 1,
            }}>
            <PostList
              ref={flatListRef}
              isLoadPosts={isLoadPosts}
              listPostByFilter={listPostByFilter}
              handleRefresh={handleRefresh}
              handleLoadMore={handleLoadMore}
              selectedIndexInModal={selectedIndexInModal}
              filterFriends={filterFriends}
              filterFriendShow={filterFriendShow}
              setFilterFriendShow={setFilterFriendShow}
              friends={friends}
              user={user}
              screenHeight={screenHeight}
              onViewableItemsChangedInModal={onViewableItemsChangedInModal}
              viewabilityConfig={viewabilityConfig}
            />
            <AnimatedEmojiPicker
              isMyMoment={
                listPostByFilter[selectedIndexInModal]?.user === user?.localId
                  ? listPostByFilter[selectedIndexInModal]?.canonical_uid
                  : null
              }
              isFocusReaction={isFocusReaction}
              setIsFocusReaction={setIsFocusReaction}
              onEmojiSelected={handleReaction}
              onSendMessage={handleSendMessage}
            />
            <AnimatedButtons
              isFocusReaction={isFocusReaction}
              handleRefresh={handleRefresh}
              viewAll={viewAll}
            />
            <View absT width={screenWidth}>
              <PostScreenHeader
                friends={friends}
                user={user}
                filterFriendShow={filterFriendShow}
                setFilterFriendShow={setFilterFriendShow}
              />
            </View>
          </View>
        </ImageBackground>
      </Modal>
    </View>
  );
};

export default PostScreen;
