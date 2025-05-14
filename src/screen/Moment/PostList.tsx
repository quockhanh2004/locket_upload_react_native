import React, {forwardRef} from 'react';
import {FlatList, RefreshControl, View, Text, StyleSheet} from 'react-native';
import {Post} from '../../models/post.model';
import PostPagerItem from './PostPagerItem/PostPagerItem';
import PostScreenHeader from './PostScreenHeader';
import {t} from '../../languages/i18n';
import {Friend} from '../../models/friend.model';

interface PostListProps {
  isLoadPosts: boolean;
  listPostByFilter: Post[];
  handleRefresh: () => void;
  handleLoadMore: () => void;
  selectedIndexInModal: number;
  filterFriends: (item: Post) => any;
  filterFriendShow: any;
  setFilterFriendShow: (value: any) => void;
  friends: {
    [key: string]: Friend;
  };
  user: any;
  screenHeight: number;
  onViewableItemsChangedInModal: any;
  viewabilityConfig: any;
  onNavigationToChatList: () => void;
}

const PostList = forwardRef<FlatList<Post>, PostListProps>(
  (
    {
      isLoadPosts,
      listPostByFilter,
      handleRefresh,
      handleLoadMore,
      selectedIndexInModal,
      filterFriends,
      filterFriendShow,
      setFilterFriendShow,
      friends,
      user,
      screenHeight,
      onViewableItemsChangedInModal,
      viewabilityConfig,
      onNavigationToChatList,
    },
    ref,
  ) => (
    <FlatList
      ref={ref}
      refreshControl={
        <RefreshControl refreshing={isLoadPosts} onRefresh={handleRefresh} />
      }
      data={listPostByFilter}
      keyExtractor={item => item.id}
      onEndReachedThreshold={0.7}
      nestedScrollEnabled
      onEndReached={handleLoadMore}
      renderItem={({item, index}) => (
        <PostPagerItem
          item={item}
          key={item.id}
          isActive={index === selectedIndexInModal}
          user={filterFriends(item)}
        />
      )}
      snapToInterval={screenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled
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
        <View style={styles.emptyContainer}>
          <PostScreenHeader
            friends={friends}
            user={user}
            filterFriendShow={filterFriendShow}
            setFilterFriendShow={setFilterFriendShow}
            rightIconAction={onNavigationToChatList}
          />
          <View style={styles.centeredView}>
            <Text style={styles.emptyText}>{t('not_have_moment')}</Text>
          </View>
        </View>
      }
    />
  ),
);

const styles = StyleSheet.create({
  modalFlatList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
  },
});

export default PostList;
