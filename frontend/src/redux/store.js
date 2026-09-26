import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import {
    persistStore,
    persistReducer,
    createTransform,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import companySlice from "./companySlice";
import applicationSlice from "./applicationSlice";
import internshipSlice from "./internshipSlice";

// Never write the login spinner or the "session checked" flag to localStorage.
// Old saves (version 1) stored loading:true, which made the button look pressed
// on the next visit until the user cleared site data.
const authTransform = createTransform(
    (inboundState) => {
        if (!inboundState || typeof inboundState !== "object") return inboundState;
        const { loading, sessionReady, ...rest } = inboundState;
        return rest;
    },
    (outboundState) => ({
        ...(outboundState || {}),
        loading: false,
        sessionReady: false,
    }),
    { whitelist: ["auth"] }
);

const persistConfig = {
    key: 'root',
    version: 2,
    storage,
    transforms: [authTransform],
    migrate: (state) => {
        if (state?.auth) {
            state.auth.loading = false;
            state.auth.sessionReady = false;
        }
        return Promise.resolve(state);
    },
}

const rootReducer = combineReducers({
    auth:authSlice,
    job:jobSlice,
    company:companySlice,
    application:applicationSlice,
    internship:internshipSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)


const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export default store;