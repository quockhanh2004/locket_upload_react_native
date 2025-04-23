/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, useState, useEffect, useCallback} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {navigationTo} from '../HomeScreen';
import {nav} from '../../navigation/navName';
import PostPagerItem from './PostPagerItem';
import {getOldPosts} from '../../redux/action/getOldPost.action';
import MainButton from '../../components/MainButton';
import {Friend} from '../../models/friend.model';
import {Post} from '../../models/post.model';
import PostScreenHeader from './PostScreenHeader';

interface PostScreenProps {
  initialIndex?: number;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const PostScreen: React.FC<PostScreenProps> = ({initialIndex = 0}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {posts, isLoadPosts} = useSelector(
    (state: RootState) => state.oldPosts,
  );
  const friends = useSelector((state: RootState) => state.friends.friends);
  const user = useSelector((state: RootState) => state.user.user);

  const [isViewerVisible, setIsViewerVisible] = useState<boolean>(true);
  const [indexToView, setIndexToView] = useState<number>(initialIndex);
  const [filterFriendShow, setFilterFriendShow] = useState<Friend | null>(null);
  const [listPostByFilter, setListPostByFilter] = useState<Post[]>(posts);
  const [selectedIndexInModal, setSelectedIndexInModal] =
    useState<number>(initialIndex);

  const flatListRef = useRef<FlatList>(null);

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
    dispatch(
      getOldPosts({
        userId: user?.localId || '',
        token: user?.idToken || '',
        timestamp: listPostByFilter[listPostByFilter.length - 1].date,
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
        first_name: 'Bạn',
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
  }, [isViewerVisible, indexToView, listPostByFilter.length]);

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

  // --- Lọc danh sách bài viết theo bạn bè ---
  useEffect(() => {
    if (!filterFriendShow) {
      setListPostByFilter(posts);
      return;
    }

    const filteredPosts = posts.filter(
      post => post.user === filterFriendShow?.uid,
    );
    setListPostByFilter(filteredPosts);
  }, [filterFriendShow, posts]);

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
    }) => (
      <Card borderRadius={20}>
        <Pressable onPress={() => onPress(index)}>
          <Image source={{uri: item.thumbnail_url}} style={styles.gridImage} />
        </Pressable>
      </Card>
    ),
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
        onEndReachedThreshold={0.7}
        onEndReached={handleLoadMore}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
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
            removeClippedSubviews={true}
            windowSize={5}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
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
                  <Text color="#fff">Không có bài viết nào</Text>
                </View>
              </View>
            }
          />

          <View style={styles.modalOverlayButtons} gap-12 row spread>
            <MainButton label="Refresh" onPress={handleRefresh} />
            <MainButton label={'View all'} onPress={viewAll} />
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
