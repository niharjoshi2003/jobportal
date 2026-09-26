import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
        // False until GET /user/me confirms or clears the saved user.
        sessionReady: false,
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setSessionReady: (state, action) => {
            state.sessionReady = action.payload;
        }
    }
});

export const { setLoading, setUser, setSessionReady } = authSlice.actions;
export default authSlice.reducer;
