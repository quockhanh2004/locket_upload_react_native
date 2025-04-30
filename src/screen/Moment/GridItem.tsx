/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-native/no-inline-styles */
import {Card, Image} from 'react-native-ui-lib';
import {Post} from '../../models/post.model';
import {Pressable} from 'react-native';
import React from 'react';

interface GridItemProps {
  item: Post;
  index: number;
  onPress: (index: number) => void;
}

const GridItem: React.FC<GridItemProps> = ({item, index, onPress}) => {
  return (
    <Card borderRadius={20}>
      <Pressable onPress={() => onPress(index)}>
        <Image
          source={{uri: item.thumbnail_url}}
          style={{
            aspectRatio: 1,
            backgroundColor: '#999',
            borderRadius: 20,
          }}
        />
      </Pressable>
    </Card>
  );
};

export default React.memo(GridItem);
