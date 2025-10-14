import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { Category } from "../../utils/type";

const API = "http://localhost:8080/categories";

export const fetchCategories = createAsyncThunk(
  "categoryManager/fetchCategories",
  async (
    { page, limit, search }: { page: number; limit: number; search: string },
    { rejectWithValue }
  ) => {
    try {
      const params: any = { _page: page, _limit: limit, _sort: "id", _order: "asc" };
      if (search?.trim()) params.q = search.trim();
      const res = await axios.get<Category[]>(API, { params });
      const total = Number(res.headers["x-total-count"] || 0);
      return { categories: res.data, totalPages: Math.max(1, Math.ceil(total / limit)) };
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch categories failed");
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "categoryManager/toggleCategoryStatus",
  async (category: Category, { rejectWithValue }) => {
    try {
      const status = !category.status;
      await axios.patch(`${API}/${category.id}`, { status });
      return { id: category.id, status };
    } catch (err: any) {
      return rejectWithValue(err.message || "Toggle category failed");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categoryManager/createCategory",
  async (payload: Omit<Category, "id">, { rejectWithValue }) => {
    try {
      const res = await axios.post<Category>(API, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Create category failed");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categoryManager/updateCategory",
  async (payload: Category, { rejectWithValue }) => {
    try {
      await axios.put(`${API}/${payload.id}`, payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message || "Update category failed");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categoryManager/deleteCategory",
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Delete category failed");
    }
  }
);

type CategoryState = {
  categories: Category[];
  loading: boolean;
  error?: string | null;
  totalPages: number;
};

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  totalPages: 1,
};

const slice = createSlice({
  name: "categoryManager",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchCategories.fulfilled, (s, a) => {
      s.loading = false; s.categories = a.payload.categories; s.totalPages = a.payload.totalPages;
    });
    b.addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = (a.payload as string) || "Error"; });

    b.addCase(toggleCategoryStatus.fulfilled, (s, a) => {
      const { id, status } = a.payload;
      const i = s.categories.findIndex(c => c.id === id);
      if (i !== -1) s.categories[i].status = status;
    });

    b.addCase(createCategory.fulfilled, (s, a) => { s.categories.unshift(a.payload); });
    b.addCase(updateCategory.fulfilled, (s, a) => {
      const i = s.categories.findIndex(c => c.id === a.payload.id);
      if (i !== -1) s.categories[i] = a.payload;
    });
    b.addCase(deleteCategory.fulfilled, (s, a) => {
      s.categories = s.categories.filter(c => c.id !== a.payload);
    });
  },
});

export default slice.reducer;
