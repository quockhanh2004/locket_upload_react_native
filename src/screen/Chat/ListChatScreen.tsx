/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect} from 'react';
import {Text, View} from 'react-native-ui-lib';

import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {useSocketEvent} from './hooks/useSocketEvent';
import {FlatList} from 'react-native';
import {ListChatType, SocketEvents} from '../../models/chat.model';
import ItemListChat from './ItemListChat';
import Header from '../../components/Header';
import {t} from '../../languages/i18n';
import {navigationTo} from '../Home';
import {nav} from '../../navigation/navName';
import {setListChat} from '../../redux/slice/chat.slice';

interface ListChatScreenProps {}

const ListChatScreen: React.FC<ListChatScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {listChat} = useSelector((state: RootState) => state.chat);
  const {friends} = useSelector((state: RootState) => state.friends);

  const {
    data: message,
    connected,
    socket,
  } = useSocketEvent({
    token: user?.idToken || '',
    eventListen: SocketEvents.LIST_MESSAGE,
  });

  const onGetListMessage = () => {
    socket?.emit(SocketEvents.LIST_MESSAGE, {});
  };

  const handlePressItem = useCallback((item: ListChatType) => {
    navigationTo(nav.chat, {
      uid: item.uid,
      friend: friends.find(f => f.uid === item.with_user),
    });
  }, []);

  useEffect(() => {
    if (message) {
      dispatch(setListChat(message));
    }
  }, [message]);

  useEffect(() => {
    if (socket && connected) {
      onGetListMessage();
    }
  }, [socket, connected]);

  useEffect(() => {
    console.log('list chat change');
  }, [listChat]);

  const renderItem = useCallback(
    ({item}: {item: ListChatType}) => (
      <>
        {item.uid ? (
          <ItemListChat itemChat={item} onPress={() => handlePressItem(item)} />
        ) : null}
      </>
    ),
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
        removeClippedSubviews={true}
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
