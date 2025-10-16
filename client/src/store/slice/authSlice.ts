import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError, type AxiosInstance } from "axios";

/* ===================== CONFIG ===================== */
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8080";
const ACCESS_TOKEN_KEY  = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY          = "auth_user";

/* ===================== TOKEN HELPERS ===================== */
const getAccessToken  = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setAccessToken = (t: string | null) => (t ? localStorage.setItem(ACCESS_TOKEN_KEY, t) : localStorage.removeItem(ACCESS_TOKEN_KEY));
const setRefreshTok = (t: string | null) => (t ? localStorage.setItem(REFRESH_TOKEN_KEY, t) : localStorage.removeItem(REFRESH_TOKEN_KEY));

/* ===================== AXIOS + INTERCEPTORS ===================== */
const api: AxiosInstance = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (!original || original._retry) throw error;
    if (error.response?.status !== 401) throw error;

    if (isRefreshing) {
      const newToken = await new Promise<string | null>((resolve) => queue.push(resolve));
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(original);
    }

    // start refresh
    original._retry = true;
    isRefreshing = true;
    try {
      const rt = getRefreshToken();
      if (!rt) throw error;
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt });
      const newAT = data?.accessToken ?? data?.access_token ?? "";
      const newRT = data?.refreshToken ?? data?.refresh_token ?? rt;
      setAccessToken(newAT);
      setRefreshTok(newRT);

      queue.forEach((fn) => fn(newAT));
      queue = [];
      isRefreshing = false;

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAT}`;
      return api(original);
    } catch (e) {
      queue.forEach((fn) => fn(null));
      queue = [];
      isRefreshing = false;
      setAccessToken(null);
      setRefreshTok(null);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  }
);

/* ===================== TYPES ===================== */
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
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

type LoginPayload = { email: string; password: string };
type RegisterPayload = { fullName: string; email: string; password: string } & Partial<
  Pick<AuthUser, "phone" | "gender" | "avatar">
>;

/* ===================== NORMALIZER ===================== */
const normalizeUser = (raw: any): AuthUser => ({
  id: raw?.id ?? raw?._id ?? "",
  fullName: raw?.fullName ?? raw?.name ?? "",
  email: raw?.email ?? "",
  phone: raw?.phone ?? "",
  gender: raw?.gender ?? "Male",
  avatar: raw?.avatar ?? "",
  role: raw?.role ?? "",
});

/* ===================== THUNKS ===================== */
export const signIn = createAsyncThunk<
  { user: AuthUser; accessToken: string; refreshToken?: string },
  LoginPayload
>("auth/signIn", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    const user = normalizeUser(data?.user ?? data);
    const at = data?.accessToken ?? data?.access_token ?? "";
    const rt = data?.refreshToken ?? data?.refresh_token ?? "";
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAccessToken(at);
    if (rt) setRefreshTok(rt);
    return { user, accessToken: at, refreshToken: rt };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "LOGIN_FAILED");
  }
});

export const signUp = createAsyncThunk<
  { user: AuthUser; accessToken?: string; refreshToken?: string },
  RegisterPayload
>("auth/signUp", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    const user = normalizeUser(data?.user ?? data);
    const at = data?.accessToken ?? data?.access_token ?? "";
    const rt = data?.refreshToken ?? data?.refresh_token ?? "";
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (at) setAccessToken(at);
    if (rt) setRefreshTok(rt);
    return { user, accessToken: at, refreshToken: rt };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "REGISTER_FAILED");
  }
});

export const fetchMe = createAsyncThunk<AuthUser>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      const u = normalizeUser(data?.user ?? data);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } catch {
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
// ... các import, config, api, types, normalizeUser giữ nguyên

/* ============== HELPERS CHO JSON-SERVER FALLBACK ============== */
async function jsGetUserById(id: string | number) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}
async function jsPatchUser(id: string | number, payload: any) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data;
}

/* ============== THUNK: UPDATE PROFILE (có fallback json-server) ============== */
export const updateProfile = createAsyncThunk<AuthUser, Partial<AuthUser>>(
  "auth/updateProfile",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const current: AuthUser | null = state?.authSlice?.user ?? null;
      const id = payload.id ?? current?.id;
      if (!id) throw new Error("NO_USER_ID");

      // Ưu tiên API auth/me
      try {
        const resp = await api.patch(`/auth/me`, payload);
        const u = normalizeUser(resp.data?.user ?? resp.data);
        localStorage.setItem("auth_user", JSON.stringify(u));
        return u;
      } catch {
        // Fallback json-server: /users/:id
        const updated = await jsPatchUser(id, payload);
        const u = normalizeUser(updated);
        localStorage.setItem("auth_user", JSON.stringify(u));
        return u;
      }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || "UPDATE_PROFILE_FAILED");
    }
  }
);

/* ============== THUNK: CHANGE PASSWORD (có fallback json-server) ============== */
export const changePassword = createAsyncThunk<
  boolean,
  { oldPassword: string; newPassword: string }
>("auth/changePassword", async (payload, { getState, rejectWithValue }) => {
  const { oldPassword, newPassword } = payload;
  try {
    // Try real auth endpoint trước
    try {
      await api.post("/auth/change-password", payload);
      return true;
    } catch {
      // Fallback json-server
      const state: any = getState();
      const current = state?.authSlice?.user;
      const id = current?.id;
      if (!id) throw new Error("NO_USER_ID");

      const user = await jsGetUserById(id);
      const serverPwd: string | undefined = user?.password;

      // Nếu json-server không có password, không thể đổi hợp lệ
      if (typeof serverPwd !== "string") {
        return rejectWithValue("User record has no 'password' field on server.");
      }
      if (serverPwd !== oldPassword) {
        return rejectWithValue("OLD_PASSWORD_INCORRECT");
      }
      if (!newPassword || newPassword.length < 6) {
        return rejectWithValue("NEW_PASSWORD_TOO_SHORT");
      }

      await jsPatchUser(id, { password: newPassword });
      return true;
    }
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "CHANGE_PASSWORD_FAILED");
  }
});


/* ===================== INITIAL ===================== */
const initialState: AuthState = {
  user: (() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  })(),
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  loading: false,
  error: null,
  isAuthenticated: !!getAccessToken(),
};

/* ===================== SLICE ===================== */
const slice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      setAccessToken(action.payload);
    },
    setRefreshToken(state, action: PayloadAction<string | null>) {
      state.refreshToken = action.payload;
      setRefreshTok(action.payload);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (action.payload) localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      else localStorage.removeItem(USER_KEY);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      setAccessToken(null);
      setRefreshTok(null);
      localStorage.removeItem(USER_KEY);
    },
  },
  extraReducers: (b) => {
    const pending = (s: AuthState) => { s.loading = true; s.error = null; };
    const rejected = (s: AuthState, a: any, code = "ERROR") => {
      s.loading = false; s.error = String(a?.payload || code);
    };

    b.addCase(signIn.pending, pending)
     .addCase(signIn.fulfilled, (s, a) => {
       s.loading = false;
       s.user = a.payload.user;
       s.accessToken = a.payload.accessToken;
       if (a.payload.refreshToken) s.refreshToken = a.payload.refreshToken;
       s.isAuthenticated = !!a.payload.accessToken;
     })
     .addCase(signIn.rejected, (s, a) => rejected(s, a, "LOGIN_FAILED"))

     .addCase(signUp.pending, pending)
     .addCase(signUp.fulfilled, (s, a) => {
       s.loading = false;
       s.user = a.payload.user;
       if (a.payload.accessToken) { s.accessToken = a.payload.accessToken; s.isAuthenticated = true; }
       if (a.payload.refreshToken) s.refreshToken = a.payload.refreshToken;
     })
     .addCase(signUp.rejected, (s, a) => rejected(s, a, "REGISTER_FAILED"))

     .addCase(fetchMe.pending, pending)
     .addCase(fetchMe.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
     .addCase(fetchMe.rejected, (s, a) => rejected(s, a, "FETCH_ME_FAILED"))

     .addCase(updateProfile.pending, pending)
     .addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
     .addCase(updateProfile.rejected, (s, a) => rejected(s, a, "UPDATE_PROFILE_FAILED"))

     .addCase(changePassword.pending, pending)
     .addCase(changePassword.fulfilled, (s) => { s.loading = false; })
     .addCase(changePassword.rejected, (s, a) => rejected(s, a, "CHANGE_PASSWORD_FAILED"));
  },
});

export const { setToken, setRefreshToken, setUser, logout } = slice.actions;
export default slice.reducer;

/* ===================== SELECTORS ===================== */
export const selectAuthUser        = (s: { authSlice: AuthState }) => s.authSlice.user;
export const selectIsAuthenticated = (s: { authSlice: AuthState }) => s.authSlice.isAuthenticated;
export const selectAuthLoading     = (s: { authSlice: AuthState }) => s.authSlice.loading;
export const selectAuthError       = (s: { authSlice: AuthState }) => s.authSlice.error;
export const selectAccessToken     = (s: { authSlice: AuthState }) => s.authSlice.accessToken;
