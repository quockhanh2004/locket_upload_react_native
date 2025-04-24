import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer, PersistConfig} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './slice/user.slice';
import messageReducer from './slice/message.slice';
import postMomentReducer from './slice/postMoment.slice';
import settingReducer from './slice/setting.slice';
import friendsReducer from './slice/friends.slice';
import {oldPostsReducer} from './slice/oldPosts.slice';
import {guideReducer} from './slice/guide.slice';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
// Persist config cho từng slice
const userPersistConfig: PersistConfig<ReturnType<typeof userReducer>> = {
  key: 'user',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: ['isLoading'],
};

const settingPersistConfig: PersistConfig<ReturnType<typeof settingReducer>> = {
  key: 'setting',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
};

const friendsPersistConfig: PersistConfig<ReturnType<typeof friendsReducer>> = {
  key: 'friends',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: ['isLoadFriends'],
};

const guidePersistConfig: PersistConfig<ReturnType<typeof guideReducer>> = {
  key: 'guide',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
};

// Kết hợp reducer với từng persistReducer
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  setting: persistReducer(settingPersistConfig, settingReducer),
  friends: persistReducer(friendsPersistConfig, friendsReducer),
  oldPosts: oldPostsReducer,
  message: messageReducer,
  postMoment: postMomentReducer,
  guide: persistReducer(guidePersistConfig, guideReducer),
});

// Tạo store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Tạo persistor
export const persistor = persistStore(store);

export default {store, persistor};
