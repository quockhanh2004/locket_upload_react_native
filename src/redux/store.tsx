import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer, PersistConfig} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './slice/user.slice';
import messageReducer from './slice/message.slice';
import postMomentReducer from './slice/postMoment.slice';
import settingReducer from './slice/setting.slice';
import friendsReducer from './slice/friends.slice';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

const rootReducer = combineReducers({
  user: userReducer,
  message: messageReducer,
  postMoment: postMomentReducer,
  setting: settingReducer,
  friends: friendsReducer,
});

let persistConfig: PersistConfig<RootState>;
persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'setting', 'friends'],
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(),
});

export const persistor = persistStore(store);

export default {store, persistor};
