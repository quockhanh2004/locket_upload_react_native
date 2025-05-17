/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Colors, Incubator} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import {setNotification} from '../redux/slice/chat.slice';

const {Toast} = Incubator;

const LocalNoti: React.FC = () => {
  const {notification} = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();

  const onDismiss = () => {
    dispatch(setNotification(null));
  };

  return (
    <Toast
      visible={!!notification?.uid}
      autoDismiss={5000}
      position="top"
      swipeable={true}
      style={{
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.grey40,
        backgroundColor: Colors.black,
      }}
      messageStyle={{
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
      }}
      message={`${notification?.title}: ${notification?.body}`}
      onDismiss={onDismiss}
    />
  );
};

export default LocalNoti;
