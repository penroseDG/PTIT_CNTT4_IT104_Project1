import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../../utils/type";

const API = "http://localhost:8080/users";

export const fetchUsers = createAsyncThunk(
  "userManager/fetchUsers",
  async ({ page, limit, search }: { page: number; limit: number; search: string }, { rejectWithValue }) => {
    try {
      const params: any = { _page: page, _limit: limit, _sort: "id", _order: "asc" };

      // Search theo name/email (json-server hỗ trợ *_like)
      if (search?.trim()) {
        // tuỳ chiến lược: có thể dùng q=search (full-text simple) hoặc 2 field *_like
        params.q = search.trim();
      }

      const res = await axios.get<User[]>(API, { params });
      const total = Number(res.headers["x-total-count"] || 0);
      return {
        users: res.data,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch users failed");
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "userManager/toggleUserStatus",
  async (user: User, { rejectWithValue }) => {
    try {
      const newStatus = !user.status;
      await axios.patch(`${API}/${user.id}`, { status: newStatus });
      return { id: user.id, status: newStatus };
    } catch (err: any) {
      return rejectWithValue(err.message || "Toggle status failed");
    }
  }
);

type UserManagerState = {
  users: User[];
  loading: boolean;
  error?: string | null;
  totalPages: number;
};

const initialState: UserManagerState = {
  users: [],
  loading: false,
  error: null,
  totalPages: 1,
};

const userManagerSlice = createSlice({
  name: "userManager",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      // fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Fetch users error";
      })
      // toggle
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const idx = state.users.findIndex((u) => u.id === id);
        if (idx !== -1) state.users[idx].status = status;
      });
  },
});

export default userManagerSlice.reducer;
