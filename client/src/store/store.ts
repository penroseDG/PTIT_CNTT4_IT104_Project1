// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userManager from "./slice/userManagerSlice";
import categoryManager from "./slice/categoryManagerSlice";
import financeSlice from "./slice/financeSlice"
export const store = configureStore({
  reducer: {
    userManager,
    categoryManager, 
    financeSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
