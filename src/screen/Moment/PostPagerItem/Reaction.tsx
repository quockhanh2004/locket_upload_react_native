/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../redux/store';
import {getReaction} from '../../../redux/action/getOldPost.action';
import {t} from '../../../languages/i18n';
import ReactionDialog from '../../../Dialog/ReactionDialog';
import {ActivityIndicator, StyleSheet} from 'react-native';

interface ReactionProps {
  momentId: string;
}

interface FriendReaction {
  uid: string;
  name: string;
  image: string;
  reaction: string;
}

const mapFriendsWithReactions = (
  reactionData: RootState['oldPosts']['reaction'],
  momentId: string,
  friends: RootState['friends']['friends'],
): FriendReaction[] => {
  const grouped: Record<string, string[]> = {};
  if (!reactionData || !reactionData[momentId]) {
    return [];
  }

  for (const {user: uid, value} of reactionData[momentId]) {
    if (!grouped[uid]) {
      grouped[uid] = [];
    }
    grouped[uid].push(value);
  }

  return Object.entries(grouped)
    .map(([uid, values]) => {
      const friend = friends[uid];
      if (!friend) {
        return null;
      }
      return {
        uid,
        name: friend.first_name,
        image: friend.profile_picture_url,
        reaction: values.join(' '),
      };
    })
    .filter(Boolean) as FriendReaction[];
};

const ReactionAvatars = ({data}: {data: FriendReaction[]}) => (
  <View row>
    {data.map((item, index) => (
      <View
        key={item.uid}
        style={[{marginLeft: -8}, index === 0 && {marginLeft: 0}]}>
        <Avatar
          source={{uri: item.image}}
          size={30}
          imageStyle={styles.avatarImage}
        />
      </View>
    ))}
  </View>
);

const LoadingReaction = () => (
  <View style={styles.container} row center bg-grey10 padding-12>
    <View center row gap-8>
      <Text white text70BL center>
        ✨ {t('loading')}
      </Text>
      <ActivityIndicator size={30} color={Colors.grey50} />
    </View>
  </View>
);

const EmptyReaction = () => (
  <View style={styles.container} row center bg-grey10 padding-12>
    <View height={30} center>
      <Text white text70BL center>
        ✨ {t('no_activity_yet')}
      </Text>
    </View>
  </View>
);

const Reaction: React.FC<ReactionProps> = ({momentId}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {reaction, isLoadingReaction} = useSelector(
    (state: RootState) => state.oldPosts,
  );
  const {friends} = useSelector((state: RootState) => state.friends);

  const [isReactionDialogVisible, setIsReactionDialogVisible] = useState(false);

  useEffect(() => {
    if (!user?.idToken || !momentId) {
      return;
    }
    dispatch(
      getReaction({
        momentId,
        token: user.idToken,
      }),
    );
  }, [dispatch, momentId, user?.idToken]);

  const reactionList = useMemo(
    () => mapFriendsWithReactions(reaction, momentId, friends),
    [reaction, momentId, friends],
  );
  if (isLoadingReaction) {
    return <LoadingReaction />;
  }

  if (reactionList.length > 0) {
    return (
      <>
        <TouchableOpacity
          onPress={() => setIsReactionDialogVisible(true)}
          style={styles.container}
          row
          center
          bg-grey10
          gap-12
          padding-12>
          <Text white text70BL>
            ✨ {t('activity')}{' '}
          </Text>
          <ReactionAvatars data={reactionList} />
        </TouchableOpacity>
        <ReactionDialog
          visible={isReactionDialogVisible}
          onDismiss={() => setIsReactionDialogVisible(false)}
          reaction={reactionList}
        />
      </>
    );
  }

  return <EmptyReaction />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
  },
  avatarImage: {
    borderWidth: 0.5,
    borderColor: Colors.grey40,
  },
});

export default React.memo(Reaction);
