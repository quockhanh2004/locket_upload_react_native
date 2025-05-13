import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  memo,
} from 'react';
import {
  Colors,
  Icon,
  Text,
  TextField,
  TouchableOpacity,
  View,
} from 'react-native-ui-lib';
import {FlatList, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {AppDispatch, RootState} from '../../redux/store';
import {
  getMessageWith,
  markReadMessage,
  sendMessage,
} from '../../redux/action/chat.action';
import {getSocket} from '../../services/Chat';

import {useChatMessages} from './hooks/useChatMessages';
import MessageList from './MessageList';
import Header from '../../components/Header';
import CustomAvatar from '../../components/Avatar';
import {Friend} from '../../models/friend.model';

interface RouteParams {
  uid: string;
  friend: Friend;
}

const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const {
    params: {uid, friend},
  } = useRoute<RouteProp<{params: RouteParams}>>();
  const {user} = useSelector((state: RootState) => state.user);

  const socketRef = useRef(getSocket(user?.idToken || ''));
  const [message, setMessage] = useState('');
  const [isFocusTextField, setIsFocusTextField] = useState(false);
  const listRef = useRef<FlatList>(null);

  const {messages, lastReadMessageId} = useChatMessages(uid, socketRef.current);

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    dispatch(
      sendMessage({
        idToken: user?.idToken || '',
        msg: trimmed,
        receiver_uid: friend.uid,
        from_memory: false,
        moment_uid: null,
      }),
    );
    setMessage('');
  }, [dispatch, friend.uid, message, user?.idToken]);

  useFocusEffect(
    useCallback(() => {
      dispatch(
        getMessageWith({
          conversation_uid: uid,
          idToken: user?.idToken || '',
        }),
      );
      dispatch(
        markReadMessage({
          conversation_uid: uid,
          idToken: user?.idToken || '',
        }),
      );
    }, [dispatch, uid, user?.idToken]),
  );

  useLayoutEffect(() => {
    if (listRef.current && isFocusTextField) {
      const timeout = setTimeout(() => {
        listRef.current?.scrollToEnd({animated: true});
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isFocusTextField, messages]);

  return (
    <>
      <Header
        customCenter={<CustomCenterHeader friend={friend} />}
        leftIconAction={() => navigation.goBack()}
      />
      <View flex padding-20 bg-black gap-12 spread>
        <MessageList
          messages={messages}
          currentUserId={user?.localId}
          scrollToMessageId={lastReadMessageId}
          ref={listRef}
        />

        <View style={styles.inputContainer}>
          <TextField
            placeholder="Message..."
            padding-8
            value={message}
            onChangeText={setMessage}
            onFocus={() => setIsFocusTextField(true)}
            onBlur={() => setIsFocusTextField(false)}
          />
          <TouchableOpacity
            center
            disabled={!message.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim()
                  ? Colors.primary
                  : Colors.grey40,
              },
            ]}
            onPress={handleSendMessage}>
            <Icon assetName="ic_send" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const CustomCenterHeader = memo(({friend}: {friend: Friend}) => {
  const initials = `${friend.first_name?.[0] || ''}${
    friend.last_name?.[0] || ''
  }`;
  return (
    <View row centerV gap-12>
      <CustomAvatar
        size={36}
        url={friend.profile_picture_url}
        text={initials}
      />
      <Text white text70BL>
        {friend.first_name} {friend.last_name}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 99,
    backgroundColor: Colors.grey60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    alignItems: 'center',
  },
  sendButton: {
    borderRadius: 99,
    padding: 8,
  },
});

export default ChatScreen;
