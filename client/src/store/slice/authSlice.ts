import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// ====== CONFIG ======
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8080";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

// Token helpers
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setTokenLS = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

// Axios instance (tự attach Authorization)
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====== TYPES ======
export type AuthUser = {
  id: number | string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

// Chuẩn hoá user từ backend
const normalizeUser = (raw: any): AuthUser => ({
  id: raw?.id ?? "",
  fullName: raw?.fullName ?? raw?.name ?? "",
  email: raw?.email ?? "",
  phone: raw?.phone ?? "",
  gender: raw?.gender ?? "Male",
  avatar: raw?.avatar ?? "",
  role: raw?.role ?? "",
});

// ====== THUNKS ======

// Lấy thông tin tài khoản hiện tại
export const fetchMe = createAsyncThunk<AuthUser>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      const u = normalizeUser(data?.user ?? data);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } catch (err1: any) {
      try {
        const { data } = await api.get("/users/me");
        const u = normalizeUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        return u;
      } catch (err2: any) {
        return rejectWithValue(err2?.response?.data || "FETCH_ME_FAILED");
      }
    }
  }
);

// Cập nhật thông tin cá nhân
export const updateProfile = createAsyncThunk<AuthUser, Partial<AuthUser>>(
  "auth/updateProfile",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const current: AuthUser | null = state?.authSlice?.user ?? null; // <-- key authSlice
      const id = payload.id ?? current?.id;

      let resp;
      if (id != null) resp = await api.patch(`/users/${id}`, payload);
      else resp = await api.patch(`/auth/me`, payload);

      const u = normalizeUser(resp.data?.user ?? resp.data);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || "UPDATE_PROFILE_FAILED");
    }
  }
);

// Đổi mật khẩu  ✅ ĐÃ EXPORT
export const changePassword = createAsyncThunk<
  boolean,
  { oldPassword: string; newPassword: string }
>("auth/changePassword", async (payload, { rejectWithValue }) => {
  try {
    await api.post("/auth/change-password", payload);
    return true;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "CHANGE_PASSWORD_FAILED");
  }
});

// ====== INITIAL STATE ======
const initialState: AuthState = {
  user: (() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  })(),
  token: getToken(),
  loading: false,
  error: null,
  isAuthenticated: !!getToken(),
};

// ====== SLICE ======
const slice = createSlice({
  name: "authSlice", // <-- tên slice đồng bộ với key reducer
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      setTokenLS(action.payload);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (action.payload) localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      else localStorage.removeItem(USER_KEY);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      setTokenLS(null);
      localStorage.removeItem(USER_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "FETCH_ME_FAILED");
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "UPDATE_PROFILE_FAILED");
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "CHANGE_PASSWORD_FAILED");
      });
  },
});

export const { setToken, setUser, logout } = slice.actions;
export default slice.reducer;

// ====== SELECTORS (dùng key authSlice) ======
export const selectAuthUser = (s: { authSlice: AuthState }) => s.authSlice.user;
export const selectIsAuthenticated = (s: { authSlice: AuthState }) =>
  s.authSlice.isAuthenticated;
export const selectAuthLoading = (s: { authSlice: AuthState }) =>
  s.authSlice.loading;
export const selectAuthError = (s: { authSlice: AuthState }) => s.authSlice.error;
