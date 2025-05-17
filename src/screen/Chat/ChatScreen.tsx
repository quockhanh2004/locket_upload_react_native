/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  memo,
  useEffect,
} from 'react';
import {
  Colors,
  Icon,
  Text,
  TextField,
  TextFieldRef,
  TouchableOpacity,
  View,
} from 'react-native-ui-lib';
import {AppState, FlatList, Pressable, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  RouteProp,
  useIsFocused,
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
import {ChatMessageType} from '../../models/chat.model';
import {t} from '../../languages/i18n';

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
  const {response} = useSelector((state: RootState) => state.chat);

  const socketRef = useRef(getSocket(user?.idToken || ''));
  const inputRef = useRef<TextFieldRef>(null);
  const [message, setMessage] = useState('');
  const [isFocusTextField, setIsFocusTextField] = useState(false);
  const listRef = useRef<FlatList<ChatMessageType>>(null);

  const {messages, isLoadChat} = useChatMessages(uid, socketRef.current);

  const handlePressComponentInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleLoadMoreMessages = () => {
    if (isLoadChat) {
      return;
    }
    if (response.chat?.length === 0 && response.uid === uid) {
      return;
    }

    dispatch(
      getMessageWith({
        conversation_uid: uid,
        token: user?.idToken || '',
        timestamp: messages[messages.length - 1]?.create_time,
      }),
    );
  };

  //lấy tin nhắn mới sau khi out app rồi mở app lại
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const didMarkRead = useRef(false);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/background|inactive/) &&
        nextAppState === 'active'
      ) {
        if (isFocused && !didMarkRead.current) {
          dispatch(
            getMessageWith({
              conversation_uid: uid,
              token: user?.idToken || '',
            }),
          );

          dispatch(
            markReadMessage({
              conversation_uid: uid,
              idToken: user?.idToken || '',
            }),
          );

          didMarkRead.current = true;
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused, dispatch, uid, user?.idToken]);

  useEffect(() => {
    if (isFocused) {
      // reset flag mỗi khi vào lại màn hình
      didMarkRead.current = false;
    }
  }, [isFocused]);

  useLayoutEffect(() => {
    if (listRef.current && isFocusTextField) {
      const timeout = setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isFocusTextField]);

  return (
    <>
      <Header
        customCenter={<CustomCenterHeader friend={friend} />}
        leftIconAction={() => navigation.goBack()}
      />
      <View flex padding-20 bg-black gap-12 spread>
        {isLoadChat && (
          <View center>
            <Text white>{t('loading_message')}</Text>
          </View>
        )}
        <MessageList
          messages={messages}
          currentUserId={user?.localId}
          ref={listRef}
          onLoadMore={handleLoadMoreMessages}
        />

        <View row spread centerV gap-12>
          <Pressable
            style={styles.inputContainer}
            onPress={handlePressComponentInput}>
            <TextField
              placeholder={t('type_message')}
              value={message}
              ref={inputRef}
              paddingH-12
              placeholderTextColor={Colors.grey20}
              onChangeText={setMessage}
              style={{minHeight: 40, maxHeight: 120}}
              multiline
              onFocus={() => setIsFocusTextField(true)}
              onBlur={() => setIsFocusTextField(false)}
            />
          </Pressable>
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
    borderRadius: 20,
    backgroundColor: Colors.grey60,
    flex: 1,
  },
  sendButton: {
    borderRadius: 99,
    padding: 8,
    width: 40,
    height: 40,
  },
});

export default ChatScreen;
