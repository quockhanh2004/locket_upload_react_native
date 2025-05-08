/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native-ui-lib';
import io from 'socket.io-client';

import {MY_SERVER_URL} from '../../util/header';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

interface ListChatScreenProps {}

const ListChatScreen: React.FC<ListChatScreenProps> = () => {
  const {user} = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const s = io(MY_SERVER_URL, {
      transports: ['websocket'],
      secure: true,
      auth: {
        access_token: user?.idToken,
      },
      reconnection: true,
    });

    s.on('connect', () => {
      console.log('Connected to server');
    });

    s.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    s.on('server_error', err => {
      console.error('Error:', err);
    });

    s.on('new_message', data => {
      console.log('Message from server:', data);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);
  return (
    <View>
      <Text>ListChat</Text>
    </View>
  );
};

export default ListChatScreen;
