import instanceLocket from '../../util/axios_locketcamera';
import instanceFirebase from '../../util/axios_firebase';
const apiMiddleware =
  ({getState}) =>
  next =>
  action => {
    // if (!action.type.includes('login')) {
    //   const state = getState();
    //   const token = state.user?.user?.idToken;
    //   if (token) {
    //     instanceLocket.defaults.headers.common.Authorization = `Bearer ${token}`;
    //     instanceFirebase.defaults.headers.common.Authorization = `Bearer ${token}`;
    //   } else {
    //     instanceLocket.defaults.headers.common.Authorization = undefined;
    //     instanceFirebase.defaults.headers.common.Authorization = undefined;
    //   }
    // } else {
    //   instanceLocket.defaults.headers.common.Authorization = undefined;
    //   instanceFirebase.defaults.headers.common.Authorization = undefined;
    // }
    next(action);
  };

export default apiMiddleware;
