/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
  Modal,
  InteractionManager,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {View, GridList, Card, Image, Text} from 'react-native-ui-lib';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../redux/store';
import {navigationTo} from '../HomeScreen';
import {nav} from '../../navigation/navName';
import PostPagerItem from './PostPagerItem/PostPagerItem';
import {getOldPosts} from '../../redux/action/getOldPost.action';
import MainButton from '../../components/MainButton';
import {Friend} from '../../models/friend.model';
import {Post} from '../../models/post.model';
import PostScreenHeader from './PostScreenHeader';
import {removePost} from '../../redux/slice/oldPosts.slice';
import {t} from '../../languages/i18n';
import {useGlobalMusicPlayer} from '../../hooks/useGlobalMusicPlayer';
import {useOldPostsData} from '../../hooks/useOldPostData';

interface PostScreenProps {
  initialIndex?: number;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const PostScreen: React.FC<PostScreenProps> = ({initialIndex = 0}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {posts, isLoadPosts, friends, user} = useOldPostsData();

  const [isViewerVisible, setIsViewerVisible] = useState<boolean>(true);
  const [indexToView, setIndexToView] = useState<number>(initialIndex);
  const [filterFriendShow, setFilterFriendShow] = useState<Friend | null>(null);
  const [selectedIndexInModal, setSelectedIndexInModal] =
    useState<number>(initialIndex);

  const listPostByFilter = useMemo(() => {
    if (!filterFriendShow) {
      return posts;
    }
    return posts.filter(p => p.user === filterFriendShow?.uid);
  }, [posts, filterFriendShow]);

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
    setIsViewerVisible(false);
  };

  const handleBackPress = () => {
    navigationTo(nav.home);
  };

  const handleRefresh = () => {
    dispatch(
      getOldPosts({
        userId: user?.localId || '',
        token: user?.idToken || '',
      }),
    );
  };

  const handleLoadMore = () => {
    if (!isLoadPosts) {
      dispatch(
        getOldPosts({
          userId: user?.localId || '',
          token: user?.idToken || '',
          timestamp: listPostByFilter[listPostByFilter?.length - 1]?.date,
        }),
      );
    }
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

  const GridItem = React.memo(
    ({
      item,
      index,
      onPress,
    }: {
      item: Post;
      index: number;
      onPress: (index: number) => void;
    }) => {
      const find = friends.find(friend => friend.uid === item.user);
      if (!find && item.user !== user?.localId) {
        dispatch(removePost(item.id));
        return null;
      }
      return (
        <Card borderRadius={20}>
          <Pressable onPress={() => onPress(index)}>
            <Image
              source={{uri: item.thumbnail_url}}
              style={styles.gridImage}
            />
          </Pressable>
        </Card>
      );
    },
  );

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
        renderItem={({item, index}) => (
          <GridItem item={item} index={index} onPress={openViewer} />
        )}
      />

      <Modal
        visible={isViewerVisible}
        onRequestClose={handleBackPress}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen" // Tùy chọn trên iOS
      >
        <View flex bg-black>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={isLoadPosts}
                onRefresh={handleRefresh}
              />
            }
            ref={flatListRef}
            data={listPostByFilter}
            keyExtractor={item => item.id}
            onEndReachedThreshold={0.7}
            onEndReached={handleLoadMore}
            renderItem={({item, index}) => (
              <PostPagerItem
                item={item}
                key={item.id}
                isActive={index === selectedIndexInModal} // Chỉ active nếu index khớp
                user={filterFriends(item)}
              />
            )}
            snapToInterval={screenHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled={true}
            showsVerticalScrollIndicator={false}
            bounces={false}
            getItemLayout={(_, index) => ({
              length: screenHeight,
              offset: screenHeight * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChangedInModal}
            viewabilityConfig={viewabilityConfig}
            removeClippedSubviews={false}
            windowSize={5}
            initialNumToRender={12}
            style={styles.modalFlatList}
            updateCellsBatchingPeriod={50}
            ListEmptyComponent={
              <View flex bg-black useSafeArea>
                <PostScreenHeader
                  friends={friends}
                  user={user}
                  filterFriendShow={filterFriendShow}
                  setFilterFriendShow={setFilterFriendShow}
                />
                <View flex center>
                  <Text color="#fff">{t('not_have_moment')}</Text>
                </View>
              </View>
            }
          />

          <View style={styles.modalOverlayButtons} gap-12 row spread>
            <MainButton label={t('refresh')} onPress={handleRefresh} />
            <MainButton label={t('view_all')} onPress={viewAll} />
          </View>
          <View absT width={screenWidth}>
            <PostScreenHeader
              friends={friends}
              user={user}
              filterFriendShow={filterFriendShow}
              setFilterFriendShow={setFilterFriendShow}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  gridImage: {
    aspectRatio: 1,
    backgroundColor: '#999',
    borderRadius: 20,
  },
  modalItemContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalImage: {
    width: screenWidth - 32,
    aspectRatio: 1,
  },
  modalFlatList: {
    flex: 1,
  },
  modalOverlayButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 30, // Hoặc dùng padding SafeAreaProvider nếu cần
    backgroundColor: 'transparent', // Hoặc màu nền nhẹ nếu muốn
  },
});

export default PostScreen;
