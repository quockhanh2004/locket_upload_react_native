/* eslint-disable react-native/no-inline-styles */
// components/SelectFriendDialog/index.tsx
import React from 'react';
import {View, Colors, Typography, Dialog} from 'react-native-ui-lib';
import CustomDialog from '../CustomDialog';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {
  setCustomListFriends,
  setOptionSend,
  setSelectedFriend,
} from '../../redux/slice/friends.slice';
import {getFriends} from '../../redux/action/getFriend.action';

import FriendOptionList from './FriendOptionList';
import FriendAvatarList from './FriendAvatarList';
import MainButton from '../../components/MainButton';

interface SelectFriendDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

const SelectFriendDialog: React.FC<SelectFriendDialogProps> = ({
  onDismiss,
  visible,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {friends, isLoadFriends, selected, optionSend, customListFriends} =
    useSelector((state: RootState) => state.friends);
  const {user} = useSelector((state: RootState) => state.user);

  const handleSelectTypeSend = (value: 'all' | 'custom_list' | 'manual') => {
    dispatch(setOptionSend(value));
  };

  const handleGetListFriend = () => {
    dispatch(
      getFriends({
        idToken: user?.idToken || '',
        idUser: user?.localId || '',
      }),
    );
  };

  const handleSelectAll = () => {
    if (optionSend === 'custom_list') {
      dispatch(setCustomListFriends([]));
    } else if (optionSend === 'manual') {
      dispatch(setSelectedFriend([]));
    }
  };

  const handleSelectFriend = (uid: string) => {
    const list = optionSend === 'custom_list' ? customListFriends : selected;
    const isSelected = list.includes(uid);

    if (uid === 'all') {
      handleSelectAll();
    } else {
      if (optionSend === 'custom_list') {
        dispatch(
          setCustomListFriends(
            isSelected
              ? customListFriends.filter(id => id !== uid)
              : [...customListFriends, uid],
          ),
        );
      } else {
        dispatch(
          setSelectedFriend(
            isSelected ? selected.filter(id => id !== uid) : [...selected, uid],
          ),
        );
      }
    }
  };

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      panDirection={Dialog.directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
      bottom
      width={'98%'}
      maxHeight={'100%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        borderRadius: 10,
        paddingBottom: 24,
      }}>
      <FriendOptionList
        value={optionSend}
        selected={selected}
        onChange={handleSelectTypeSend}
      />
      {optionSend !== 'all' && (
        <FriendAvatarList
          friends={friends}
          selected={selected}
          customListFriends={customListFriends}
          optionSend={optionSend}
          onSelectAll={handleSelectAll}
          onSelectFriend={handleSelectFriend}
        />
      )}
      <View row spread gap-12>
        <View>
          <MainButton
            isLoading={isLoadFriends}
            label={'Refresh friend'}
            onPress={handleGetListFriend}
            backgroundColor={Colors.blue40}
          />
        </View>
        <View flex>
          <MainButton label="Done" onPress={onDismiss} />
        </View>
      </View>
    </CustomDialog>
  );
};

export default SelectFriendDialog;
