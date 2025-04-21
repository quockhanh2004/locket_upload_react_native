/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {FlatList, Dimensions, ViewToken} from 'react-native'; // Import ViewToken
import InputView from '../../components/InputView';
import {Colors, Typography, View, Text} from 'react-native-ui-lib';
import {getCurrentTime} from '../../util/convertTime';
import {OverlayType} from '../../util/bodyMoment';

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
        <InputView
          placeholder={'Enter caption here...'}
          placeholderTextColor={Colors.white}
          bgColor={Colors.grey30}
          borderColor={Colors.grey30}
          borderWidth={1}
          inputStyle={{
            color: Colors.white,
            ...Typography.text70BL,
          }}
          style={{paddingLeft: 10, borderRadius: 999, width: width - 24}}
          onChangeText={val => {
            setlocalCaption(val);
            if (setCaption) {
              setCaption(val);
            }
          }}
          value={localCaption}
        />
      );
    } else if (item.type === OverlayType.time) {
      return (
        <View
          bg-grey30
          width={width - 24}
          center
          style={{padding: 14, borderRadius: 999}}>
          <Text white text70BL center>
            {`🕒 ${getCurrentTime()}`}
          </Text>
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
