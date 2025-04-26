/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {FlatList, ViewToken} from 'react-native';
import {Colors, View} from 'react-native-ui-lib';
import {getCurrentTime} from '../../util/convertTime';
import {OverlayType} from '../../util/bodyMoment';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import ItemStandard from './itemCaption/Standard';
import ItemTime from './itemCaption/Time';
import ItemMusic from './itemCaption/Music';

const DATA = [
  {type: OverlayType.standard},
  {type: OverlayType.time},
  {type: OverlayType.music},
];

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
  const {tokenData} = useSelector((state: RootState) => state.spotify);

  const [localCaption, setlocalCaption] = useState(caption || '');
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  console.log(tokenData);

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
    switch (item.type) {
      case OverlayType.standard:
        return (
          <ItemStandard
            postStyle={postStyle}
            caption={localCaption}
            onChangeText={val => {
              setlocalCaption(val);
              if (setCaption) {
                setCaption(val);
              }
            }}
          />
        );
      case OverlayType.time:
        return <ItemTime postStyle={postStyle} />;

      case OverlayType.music:
        return <ItemMusic isLogin={tokenData ? true : false} />;
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
