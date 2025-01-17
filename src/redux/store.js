import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';

import userReducer from './slice/user.slice';
import messageReducer from './slice/message.slice';
import apiMiddleware from './middleware/apiMiddleware';
import postMomentReducer from './slice/postMoment.slice';

const rootReducer = combineReducers({
  user: userReducer,
  message: messageReducer,
  postMoment: postMomentReducer,
  // Add other reducers here
});

let persistConfig;
persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'],
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiMiddleware),
});

export const persistor = persistStore(store);

export default {store, persistor};
