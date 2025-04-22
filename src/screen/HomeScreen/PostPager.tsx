/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {FlatList, Dimensions, ViewToken} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, View, Text, TextField, Typography} from 'react-native-ui-lib';
import {getCurrentTime} from '../../util/convertTime';
import {OverlayType} from '../../util/bodyMoment';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

const DATA = [{type: OverlayType.standard}, {type: OverlayType.time}];
const {width} = Dimensions.get('window');

interface PostPagerProps {
  setCaption: (text: string) => void;
  caption?: string;
  settype?: (type: OverlayType) => void;
  setTextOverlay?: (text: string) => void;
}

interface RenderItemProps {
  item: {
    type: string;
  };
}

const PostPager: React.FC<PostPagerProps> = ({
  setCaption,
  caption = '',
  settype = () => {},
  setTextOverlay = () => {},
}) => {
  const {postStyle} = useSelector((state: RootState) => state.setting);
  const [localCaption, setlocalCaption] = useState(caption || '');
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
      if (info.viewableItems.length > 0) {
        const index = info.viewableItems[0].index || 0;
        setCurrentIndex(index);

        if (setCaption) {
          if (DATA[index].type === OverlayType.standard) {
            settype(OverlayType.standard);
            setCaption(localCaption);
          } else if (DATA[index].type === OverlayType.time) {
            settype(OverlayType.time);
            setTextOverlay(getCurrentTime());
          }
        }
      }
    },
    [localCaption, setCaption, setTextOverlay, settype],
  );

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  useEffect(() => {
    if (caption !== getCurrentTime()) {
      setlocalCaption(caption);
    }
  }, [caption]);

  const renderItem = ({item}: RenderItemProps) => {
    if (item.type === OverlayType.standard) {
      return (
        <View width={width - 24}>
          <LinearGradient
            colors={[
              postStyle.color_top || Colors.grey40,
              postStyle.color_bot || Colors.grey40,
            ]}
            style={{borderRadius: 999}}>
            <TextField
              placeholder={'Enter caption here...'}
              placeholderTextColor={postStyle.text_color}
              paddingV-10
              color={postStyle.text_color}
              paddingH-16
              cursorColor={Colors.primary}
              style={{...Typography.text70BL}}
              onChangeText={val => {
                setlocalCaption(val);
                if (setCaption) {
                  setCaption(val);
                }
              }}
              value={localCaption}
            />
          </LinearGradient>
        </View>
      );
    } else if (item.type === OverlayType.time) {
      return (
        <View width={width - 24} center style={{borderRadius: 999}}>
          <LinearGradient
            colors={[
              postStyle.color_top || Colors.grey40,
              postStyle.color_bot || Colors.grey40,
            ]}
            style={{borderRadius: 999, padding: 14}}>
            <Text white color={postStyle.text_color} center text70BL>
              {`🕒 ${getCurrentTime()}`}
            </Text>
          </LinearGradient>
        </View>
      );
    }
    return null;
  };

  return (
    <View flexS gap-8>
      <FlatList
        ref={flatListRef}
        data={DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View center row>
        {DATA.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                currentIndex === index ? Colors.primary : Colors.grey20,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default PostPager;
