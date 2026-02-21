import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth slice
  transforms: [
    // Custom transform to handle session expiry
    {
      in: (inboundState, key) => {
        if (key === 'auth' && inboundState.sessionExpiry) {
          const now = new Date();
          const expiry = new Date(inboundState.sessionExpiry);
          if (now > expiry) {
            // Session expired, clear auth state
            return {
              ...inboundState,
              user: null,
              token: null,
              isAuthenticated: false,
              sessionExpiry: null
            };
          }
        }
        return inboundState;
      },
      out: (outboundState, key) => outboundState
    }
  ]
};

const rootReducer = combineReducers({
  auth: authReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

export default store;
