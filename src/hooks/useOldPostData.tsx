import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

export function useOldPostsData() {
  const posts = useSelector((state: RootState) => state.oldPosts.posts);
  const {isLoadPosts, response} = useSelector(
    (state: RootState) => state.oldPosts,
  );
  const friends = useSelector((state: RootState) => state.friends.friends);
  const user = useSelector((state: RootState) => state.user.user);

  return {posts, isLoadPosts, friends, user, response};
}
