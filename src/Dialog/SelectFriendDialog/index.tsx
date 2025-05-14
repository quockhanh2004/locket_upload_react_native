/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
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
import {OptionSend} from '../../models/friend.model';
import {t} from '../../languages/i18n';

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
  const {optionFriend} = useSelector((state: RootState) => state.setting);

  const handleSelectTypeSend = (value: OptionSend) => {
    dispatch(setOptionSend(value));
  };

  const handleGetListFriend = () => {
    dispatch(
      getFriends({
        idToken: user?.idToken || '',
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

  useEffect(() => {
    if (!optionFriend) {
      handleSelectTypeSend('manual');
    }
  }, [optionFriend]);

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
      {optionFriend && (
        <FriendOptionList
          value={optionSend}
          selected={selected}
          onChange={handleSelectTypeSend}
        />
      )}
      {optionSend !== 'all' && (
        <FriendAvatarList
          friends={Object.values(friends)}
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
            label={t('refresh_friend')}
            onPress={handleGetListFriend}
            backgroundColor={Colors.blue40}
          />
        </View>
        <View flex>
          <MainButton label={t('done')} onPress={onDismiss} />
        </View>
      </View>
    </CustomDialog>
  );
};

export default SelectFriendDialog;
