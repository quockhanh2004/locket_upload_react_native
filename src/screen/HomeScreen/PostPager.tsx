/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {FlatList, ViewToken} from 'react-native';
import {Colors, View} from 'react-native-ui-lib';
import {getCurrentTime} from '../../util/convertTime';
import {OverlayType} from '../../util/bodyMoment';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import ItemStandard from './itemCaption/Standard';
import ItemTime from './itemCaption/Time';
import ItemMusic from './itemCaption/Music';
import {refreshAccessToken} from '../../redux/action/spotify.action';

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
  const dispatch = useDispatch<AppDispatch>();
  const {postStyle} = useSelector((state: RootState) => state.setting);
  const {tokenData, currentPlay} = useSelector(
    (state: RootState) => state.spotify,
  );

  const [localCaption, setlocalCaption] = useState(caption || '');
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
      if (info.viewableItems.length > 0) {
        const index = info.viewableItems[0].index || 0;
        setCurrentIndex(index);

        if (setCaption) {
          switch (DATA[index].type) {
            case OverlayType.standard:
              settype(OverlayType.standard);
              setCaption(localCaption);
              break;

            case OverlayType.time:
              settype(OverlayType.time);
              setTextOverlay(getCurrentTime());
              break;

            case OverlayType.music:
              settype(OverlayType.music);
              break;

            default:
              settype(OverlayType.standard);
              setTextOverlay('');
              break;
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

  useEffect(() => {
    if (!tokenData) {
      return;
    }
    if (tokenData && tokenData?.time_expired <= new Date().getTime()) {
      dispatch(
        refreshAccessToken({
          refreshToken: tokenData.refresh_token,
        }),
      );
    }
  }, [currentIndex, tokenData, dispatch]);

  useEffect(() => {
    setTextOverlay(`${currentPlay?.name} - ${currentPlay?.artists}`);
  }, [currentPlay, setTextOverlay]);

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
        return <ItemMusic isFocus={currentIndex === 2} />;
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
