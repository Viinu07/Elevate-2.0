import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import teamsReducer from './teamsSlice';
import releasesReducer from './releasesSlice';
import collabReducer from './collabSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        teams: teamsReducer,
        releases: releasesReducer,
        collab: collabReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
