import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
  Modal,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import {View, Button, GridList, Card, Image} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {navigationTo} from '../HomeScreen';
import {nav} from '../../navigation/navName';
import PostPagerItem from './PostPagerItem';
import {setOldPosts} from '../../redux/slice/oldPosts.slice';
import Header from '../../components/Header';

interface PostScreenProps {
  initialIndex?: number;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const PostScreen: React.FC<PostScreenProps> = ({initialIndex = 0}) => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.oldPosts.posts);
  const friends = useSelector((state: RootState) => state.friends.friends);
  const user = useSelector((state: RootState) => state.user.user);

  const [isViewerVisible, setIsViewerVisible] = useState<boolean>(true);
  const [indexToView, setIndexToView] = useState<number>(initialIndex);
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

  const filterFriends = () => {
    const find = friends.find(
      friend => friend.uid === posts[selectedIndexInModal]?.user,
    );
    if (!find && posts[selectedIndexInModal]?.user === user?.localId) {
      return {
        first_name: 'Bạn',
        profile_picture_url: user?.photoUrl,
        uid: user?.localId,
      };
    }
    return find ? find : null;
  };

  useEffect(() => {
    if (posts.length === 0) {
      return;
    }
    if (isViewerVisible && flatListRef.current) {
      const scrollToIndex = indexToView;

      const interactionHandle = InteractionManager.runAfterInteractions(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: scrollToIndex,
            animated: false,
            viewPosition: 0,
          });
          // Cập nhật index đang hiển thị trong Modal
          setSelectedIndexInModal(scrollToIndex);
        } else {
          console.warn(
            '[Modal Scroll Interaction] Ref became null before scrolling!',
          );
        }
      });
      return () => interactionHandle.cancel();
    }
  }, [isViewerVisible, indexToView, posts.length]);

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
      <Header />
      <View height={16} />
      {!isViewerVisible && (
        <GridList
          data={posts}
          numColumns={3}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <Card borderRadius={20}>
              <Pressable onPress={() => openViewer(index)}>
                <Image
                  source={{uri: item.thumbnail_url}}
                  style={styles.gridImage}
                />
              </Pressable>
            </Card>
          )}
          contentContainerStyle={styles.gridContentContainer}
        />
      )}
      <Modal
        visible={isViewerVisible}
        onRequestClose={handleBackPress}
        animationType="fade"
        transparent={false}
        presentationStyle="fullScreen" // Tùy chọn trên iOS
      >
        <View flex bg-black>
          <FlatList
            ref={flatListRef}
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <PostPagerItem
                item={item}
                isActive={index === selectedIndexInModal} // Chỉ active nếu index khớp
                user={filterFriends()}
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
          />

          <View style={styles.modalOverlayButtons} gap-12>
            {/* {posts.length > selectedIndexInModal &&
              posts[selectedIndexInModal]?.user !== currentUserId && (
                <View row spread marginB-10>
                  <Button label="Comment" onPress={() => {}} />
                </View>
              )} */}
            <Button
              label="Refresh"
              onPress={() => {
                dispatch(setOldPosts([]));
              }}
            />
            <Button label={'View all'} onPress={viewAll} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  gridImage: {
    width: screenWidth / 3,
    height: screenWidth / 3,
    backgroundColor: '#999',
    borderRadius: 20,
  },
  gridContentContainer: {
    paddingBottom: 20,
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
