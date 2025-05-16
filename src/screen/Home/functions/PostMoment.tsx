import {t} from '../../../languages/i18n';
import {User} from '../../../models/user.model';
import {
  DataPostMoment,
  uploadImageToFirebaseStorage,
  uploadVideoToFirebase,
} from '../../../redux/action/postMoment.action';
import {setMessage, setTask} from '../../../redux/slice/message.slice';
import {AppDispatch} from '../../../redux/store';
import {OverLayCreate, OverlayType} from '../../../util/bodyMoment';

interface PostMoment {
  user?: User | null;
  selectedMedia: any;
  optionSend: 'manual' | 'all' | 'custom_list';
  overlay: OverLayCreate;
  dispatch: AppDispatch;
  caption: string;
  customListFriends: string[];
  selected: string[];
}
export const onPostMoment = async ({
  user,
  selectedMedia,
  optionSend,
  overlay,
  dispatch,
  caption,
  customListFriends,
  selected,
}: PostMoment) => {
  if (!user || !user.localId || !user.idToken || !selectedMedia) {
    dispatch(
      setMessage({
        message: t('please_select_media'),
        type: t('error'),
      }),
    );
    return;
  }
  const targetFriends =
    optionSend === 'all'
      ? []
      : optionSend === 'custom_list'
      ? customListFriends
      : selected;

  const commonParams: DataPostMoment = {
    idUser: user.localId || '',
    idToken: user.idToken,
    refreshToken: user.refreshToken || '',
    overlay: {
      ...overlay,
      text:
        overlay.overlay_type === OverlayType.standard ? caption : overlay.text,
    },
    friend: targetFriends,
  };

  let task;
  if (selectedMedia.type === 'video') {
    task = dispatch(
      uploadVideoToFirebase({
        ...commonParams,
        videoInfo: selectedMedia.uri,
      }),
    );
  } else {
    task = dispatch(
      uploadImageToFirebaseStorage({
        ...commonParams,
        imageInfo: selectedMedia,
      }),
    );
  }
  dispatch(setTask(task));
};
