import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slice/AuthSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})