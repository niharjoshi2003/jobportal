import { createSlice } from "@reduxjs/toolkit";

const internshipSlice = createSlice({
    name: "internship",
    initialState: {
        allInternships: [],
        allAdminInternships: [],
        singleInternship: null,
        appliedInternships: [],
    },
    reducers: {
        setAllInternships: (state, action) => {
            state.allInternships = action.payload;
        },
        setAllAdminInternships: (state, action) => {
            state.allAdminInternships = action.payload;
        },
        setSingleInternship: (state, action) => {
            state.singleInternship = action.payload;
        },
        setAppliedInternships: (state, action) => {
            state.appliedInternships = action.payload;
        },
    },
});

export const {
    setAllInternships,
    setAllAdminInternships,
    setSingleInternship,
    setAppliedInternships,
} = internshipSlice.actions;
export default internshipSlice.reducer;
