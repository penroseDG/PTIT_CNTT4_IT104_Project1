// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userManager from "./slice/userManagerSlice";
import categoryManager from "./slice/categoryManagerSlice";
import financeSlice from "./slice/financeSlice"
import authSlice from "./slice/authSlice";
export const store = configureStore({
  reducer: {
    authSlice,
    userManager,
    categoryManager, 
    financeSlice
  },
    middleware: (getDefault) => getDefault(),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
