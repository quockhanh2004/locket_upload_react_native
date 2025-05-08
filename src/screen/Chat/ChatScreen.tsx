/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import {useSelector} from 'react-redux';
import io from 'socket.io-client';
import {RootState} from '../../redux/store';
import {MY_SERVER_URL} from '../../util/header';

const ChatScreen = () => {
  const {user} = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [message, setMessage] = useState('');

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
      setConnected(true);
      addLog('✅ Connected to server');
    });

    s.on('disconnect', () => {
      setConnected(false);
      addLog('❌ Disconnected from server');
    });

    s.on('server_error', (err: any) => {
      addLog('❗ Error: ' + JSON.stringify(err));
    });

    s.on('new_message', (data: any) => {
      addLog('📥 Message from server: ' + JSON.stringify(data));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const addLog = (msg: string) => {
    setLog([msg]);
  };

  const sendMessage = () => {
    if (socket && connected) {
      socket.emit('get_message', JSON.parse(message));
      addLog('📤 Sent message: ' + message);
    } else {
      addLog('⚠️ Not connected');
    }
  };

  return (
    <View style={{padding: 20}}>
      <Text>Socket.IO Test</Text>
      <Text>Connection: {connected ? '🟢 Connected' : '🔴 Disconnected'}</Text>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type message..."
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          padding: 10,
          marginVertical: 10,
        }}
      />
      <Button title="Send Message" onPress={sendMessage} />

      <View style={{marginTop: 20}}>
        {log.map((l, i) => (
          <Text key={i}>{l}</Text>
        ))}
      </View>
    </View>
  );
};

export default ChatScreen;
