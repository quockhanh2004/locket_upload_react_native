/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {RadioButton, RadioGroup, View, Colors} from 'react-native-ui-lib';
import {options} from './constants';

interface Props {
  selected: string[];
  value: string;
  onChange: (val: any) => void;
}

const FriendOptionList: React.FC<Props> = ({selected, value, onChange}) => {
  return (
    <RadioGroup initialValue={value} onValueChange={onChange}>
      {options.map((item, index) => {
        return (
          <View row key={index} centerV>
            <RadioButton
              label={item.label}
              value={item.value}
              selected={selected.includes(item.value)}
              labelStyle={{color: Colors.white}}
              containerStyle={{
                marginRight: 12,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
              color={Colors.primary}
            />
          </View>
        );
      })}
    </RadioGroup>
  );
};

export default FriendOptionList;
