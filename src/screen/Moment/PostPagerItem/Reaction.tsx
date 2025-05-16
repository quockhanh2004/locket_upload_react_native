/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
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
import {t} from '../../../languages/i18n.ts';
import {Reaction as ReactionModel} from '../../../models/post.model';
import ReactionDialog from '../../../components/Dialog/ReactionDialog';
import {ActivityIndicator} from 'react-native';

interface ReactionProps {
  momentId: string;
}

const Reaction: React.FC<ReactionProps> = ({momentId}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {reaction, isLoadingReaction} = useSelector(
    (state: RootState) => state.oldPosts,
  );
  const {friends} = useSelector((state: RootState) => state.friends);

  const [visibleReaction, setvisibleReaction] = useState(false);

  const handleReactionPress = () => {
    setvisibleReaction(true);
  };

  useEffect(() => {
    const fetchReactions = async () => {
      if (!user?.idToken || !momentId) {
        return;
      }
      dispatch(
        getReaction({
          momentId,
          token: user.idToken,
        }),
      );
    };

    fetchReactions();
  }, [dispatch, momentId, user?.idToken]);

  const getFriendsWithReactions = (reactions: ReactionModel[]) => {
    const grouped: Record<string, string[]> = {};

    reactions.forEach(({user: friend, value}) => {
      if (!grouped[friend]) {
        grouped[friend] = [];
      }
      grouped[friend].push(value);
    });

    const response = friends
      .filter(friend => grouped[friend.uid]) // chỉ lấy bạn bè có reaction
      .map(friend => ({
        uid: friend.uid,
        name: friend.first_name,
        image: friend.profile_picture_url,
        reaction: grouped[friend.uid].join(' '),
      }));
    return response;
  };

  if (reaction?.momentId === momentId && reaction?.reactions.length > 0) {
    return (
      <>
        <TouchableOpacity
          onPress={handleReactionPress}
          style={{borderRadius: 999, gap: 12}}
          row
          center
          bg-grey10
          padding-12>
          <Text white text70BL>
            ✨ {t('activity')}{' '}
          </Text>
          <View row>
            {getFriendsWithReactions(reaction.reactions).map(item => {
              return (
                <View key={item.uid} style={{marginStart: -8}}>
                  <Avatar
                    source={{uri: item?.image}}
                    size={30}
                    imageStyle={{
                      borderWidth: 0.5,
                      borderColor: Colors.grey40,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
        <ReactionDialog
          visible={visibleReaction}
          onDismiss={() => setvisibleReaction(false)}
          reaction={getFriendsWithReactions(reaction.reactions)}
        />
      </>
    );
  }

  if (isLoadingReaction) {
    return (
      <View style={{borderRadius: 999}} row center bg-grey10 padding-12>
        <View center row gap-8>
          <Text white text70BL center>
            ✨ {t('loading')}
          </Text>
          <ActivityIndicator size={30} color={Colors.grey50} />
        </View>
      </View>
    );
  }

  return (
    <View style={{borderRadius: 999}} row center bg-grey10 padding-12>
      <View height={30} center>
        <Text white text70BL center>
          ✨ {t('no_activity_yet')}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(Reaction);
