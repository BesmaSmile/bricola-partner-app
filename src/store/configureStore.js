import {applyMiddleware, createStore, combineReducers} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import thunk from 'redux-thunk';
import userReducer from './reducers/userReducer';
import orderReducer from './reducers/orderReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: userReducer,
  order: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewares = [thunk];

export const store = createStore(
  persistedReducer,
  {},
  applyMiddleware(...middlewares),
);
export const persistor = persistStore(store);
