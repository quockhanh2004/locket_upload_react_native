import React from 'react';
import SelectMediaDialog from '../../../Dialog/SelectMediaDialog';
import SelectFriendDialog from '../../../Dialog/SelectFriendDialog';
import SelectColorDialog from '../../../Dialog/SelectColorSwatchDialog';
import {PostStyle} from '../../../models/setting.model';

interface Props {
  visibleSelectMedia: boolean;
  visibleSelectFriend: boolean;
  visibleSelectColor: boolean;
  valueColors: PostStyle;
  setVisibleSelectMedia: (val: boolean) => void;
  setVisibleSelectFriend: (val: boolean) => void;
  setVisibleSelectColor: (val: boolean) => void;
  onSelectColor: (color: PostStyle) => void;
  onSelectMedia: (type: 'camera' | 'gallery') => void;
}

const HomeScreenDialogs = ({
  visibleSelectMedia,
  visibleSelectFriend,
  visibleSelectColor,
  setVisibleSelectMedia,
  setVisibleSelectFriend,
  setVisibleSelectColor,
  valueColors,
  onSelectColor,
  onSelectMedia,
}: Props) => {
  return (
    <>
      <SelectMediaDialog
        visible={visibleSelectMedia}
        onDismiss={() => setVisibleSelectMedia(false)}
        onConfirm={type => {
          setVisibleSelectMedia(false);
          onSelectMedia(type);
        }}
      />
      <SelectFriendDialog
        visible={visibleSelectFriend}
        onDismiss={() => setVisibleSelectFriend(false)}
      />
      <SelectColorDialog
        visible={visibleSelectColor}
        onDismiss={() => setVisibleSelectColor(false)}
        value={valueColors}
        onSelectColor={onSelectColor}
      />
    </>
  );
};

export default HomeScreenDialogs;
