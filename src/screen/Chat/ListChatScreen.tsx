import React, {useCallback} from 'react';
import {Text, View} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {FlatList} from 'react-native';
import {ListChatType} from '../../models/chat.model';
import ItemListChat from './ItemListChat';
import Header from '../../components/Header';
import {t} from '../../languages/i18n';
import {navigationTo} from '../Home';
import {nav} from '../../navigation/navName';

interface ListChatScreenProps {}

const ListChatScreen: React.FC<ListChatScreenProps> = () => {
  const {listChat} = useSelector((state: RootState) => state.chat);
  const {friends} = useSelector((state: RootState) => state.friends);

  const handlePressItem = useCallback(
    (item: ListChatType) => {
      navigationTo(nav.chat, {
        uid: item.uid,
        friend: friends.find(f => f.uid === item.with_user),
      });
    },
    [friends],
  );

  const renderItem = useCallback(
    ({item}: {item: ListChatType}) =>
      item.uid ? (
        <ItemListChat itemChat={item} onPress={() => handlePressItem(item)} />
      ) : null,
    [handlePressItem],
  );

  return (
    <View flex bg-black>
      <Header title={t('chat')} />
      <View height={20} />
      <FlatList
        data={listChat}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View>
            <Text>{t('not_thing_here')}</Text>
          </View>
        }
      />
    </View>
  );
};

export default ListChatScreen;
