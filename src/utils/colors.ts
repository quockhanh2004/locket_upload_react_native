import {Colors} from 'react-native-ui-lib';
import {PostStyle} from '../models/setting.model.ts';

export const ColorsSelect = [
  Colors.red,
  Colors.yellow,
  Colors.blue,
  Colors.primary,
  Colors.text,
  Colors.black,
  Colors.dark,
  Colors.grey20,
  Colors.grey40,
  Colors.blue10,
  Colors.blue40,
  Colors.cyan10,
  Colors.cyan40,
  Colors.cyan80,
  Colors.green10,
  Colors.green40,
  Colors.green60,
  Colors.yellow1,
  Colors.yellow20,
  Colors.yellow40,
  Colors.orange20,
  Colors.orange40,
  Colors.red1,
  Colors.red10,
  Colors.red20,
  Colors.red40,
  Colors.red60,
  Colors.purple10,
  Colors.purple20,
  Colors.purple40,
  Colors.violet10,
  Colors.violet20,
  Colors.violet40,
  Colors.transparent,
];

export const ColorDefault = {
  text_color: Colors.text,
  color_bot: undefined,
  color_top: undefined,
};
export const getColors = (postStyle: PostStyle) => {
  if (!postStyle?.color_bot && !postStyle?.color_top) {
    return [];
  }

  return [
    postStyle?.color_top ?? Colors.grey20,
    postStyle?.color_bot ?? Colors.grey20,
  ];
};
