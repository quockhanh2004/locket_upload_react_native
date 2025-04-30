import React from 'react';
import {
  View,
  Text,
  Colors,
  Switch,
  TouchableOpacity,
  Icon,
} from 'react-native-ui-lib';
import {ItemSettingModel} from '../../models/itemSetting.model';

interface ItemSettingProps {
  item: ItemSettingModel;
  onPress: (action: (val: boolean) => any, value?: boolean) => void;
}

const ItemSetting: React.FC<ItemSettingProps> = ({item, onPress}) => {
  if (item.type === 'button') {
    return (
      <>
        <TouchableOpacity
          row
          spread
          paddingV-12
          paddingR-12
          onPress={() => onPress(item.action)}>
          <Text white text70BL flexS>
            {item.title}
          </Text>
          <Icon assetName="ic_next" size={24} tintColor={Colors.grey40} />
        </TouchableOpacity>
        <View height={1} bg-grey40 />
      </>
    );
  }

  return (
    <>
      <View row spread paddingV-12>
        <Text white text70BL flexS>
          {item.title}
        </Text>
        <Switch
          value={item.value}
          onColor={Colors.primary}
          onValueChange={(value: boolean) => onPress(item.action, value)}
        />
      </View>
      <View height={1} bg-grey40 />
    </>
  );
};

export default ItemSetting;
