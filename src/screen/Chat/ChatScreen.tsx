/* eslint-disable react/no-unstable-nested-components */
import React, {useState, useCallback, useLayoutEffect} from 'react';
import {
  Colors,
  Icon,
  Text,
  TextField,
  TouchableOpacity,
  View,
} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {getSocket} from '../../services/Chat';
import {useChatMessages} from './hooks/useChatMessages';
import MessageList from './MessageList';
import {StyleSheet, FlatList} from 'react-native';
import {Friend} from '../../models/friend.model';
import Header from '../../components/Header';
import CustomAvatar from '../../components/Avatar';
import {sendMessage} from '../../redux/action/chat.action';

interface RouteParams {
  uid: string;
  friend: Friend;
}

const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<RouteProp<{params: RouteParams}>>();
  const {uid, friend} = route.params;
  const {user} = useSelector((state: RootState) => state.user);
  const socket = getSocket(user?.idToken || '');
  const [message, setMessage] = useState('');
  const [isFocusTextField, setIsFocusTextField] = useState(false);
  const listRef = React.useRef<FlatList>(null);

  const {messages, lastReadMessageId} = useChatMessages(uid, socket);

  const handleSendMessage = useCallback(() => {
    if (message.trim()) {
      dispatch(
        sendMessage({
          idToken: user?.idToken || '',
          msg: message,
          receiver_uid: null,
          from_memory: false,
          moment_uid: null,
        }),
      );
      console.log('Send message:', message);
      setMessage('');
    }
  }, [dispatch, message, user?.idToken]);

  useLayoutEffect(() => {
    if (listRef.current && isFocusTextField) {
      try {
        setTimeout(() => {
          listRef.current?.scrollToEnd({animated: false});
        }, 100); // Delay để đảm bảo layout đã xong
      } catch (error) {}
    }
  }, [isFocusTextField, messages]);

  const CustomCenterHeader = () => {
    return (
      <>
        <CustomAvatar
          size={36}
          url={friend.profile_picture_url}
          text={`${friend.first_name?.at(0)}${friend.last_name?.at(0)}`}
        />
        <Text white text70BL>
          {`${friend.first_name} ${friend.last_name}`}
        </Text>
      </>
    );
  };

  return (
    <>
      <Header
        customCenter={<CustomCenterHeader />}
        leftIconAction={() => {
          navigation.goBack();
        }}
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
            placeholder={'Message...'}
            padding-8
            value={message}
            onChangeText={setMessage}
            onFocus={() => setIsFocusTextField(true)}
            onBlur={() => setIsFocusTextField(false)}
          />
          <TouchableOpacity
            center
            disabled={message.trim().length === 0}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  message.trim().length === 0 ? Colors.grey40 : Colors.primary,
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
