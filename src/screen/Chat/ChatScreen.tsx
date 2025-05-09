/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {useSocketEvent} from './hooks/useSocketEvent';
import {SocketEvents} from '../../models/chat.model';

const ChatScreen = () => {
  const {user} = useSelector((state: RootState) => state.user);
  const {
    data: message,
    connected,
    socket,
  } = useSocketEvent({
    event: SocketEvents.GET_MESSAGE,
    token: user?.idToken || '',
    eventListen: SocketEvents.NEW_MESSAGE,
  });

  return <View style={{padding: 20}}></View>;
};

export default ChatScreen;
