// src/store/slice/financeSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { FinanceState, IMonthlyCategory, ITransaction } from "../../utils/type";

const MONTHLY_API = "http://localhost:8080/monthlyCategories";
const TRANS_API   = "http://localhost:8080/transactions";

// Lấy/khởi tạo bản ghi tháng 
export const fetchMonthlyCategory = createAsyncThunk<
  IMonthlyCategory,
  string,
  { rejectValue: string }
>("finance/fetchMonthlyCategory", async (monthYYYYMM, { rejectWithValue }) => {
  try {
    const res = await axios.get<IMonthlyCategory[]>(MONTHLY_API, {
      params: { month_like: `^${monthYYYYMM}` },
    });
    if (res.data.length > 0) return res.data[0];

    // nếu chưa có thì tạo mới với totalBudget=0
    const created = await axios.post<IMonthlyCategory>(MONTHLY_API, {
      month: `${monthYYYYMM}-01`,
      totalBudget: 0,
    });
    return created.data;
  } catch {
    return rejectWithValue("Không tải được dữ liệu tháng.");
  }
});

export const fetchTransactions = createAsyncThunk<
  ITransaction[],
  number,
  { rejectValue: string }
>("finance/fetchTransactions", async (monthlyCategoryId, { rejectWithValue }) => {
  try {
    const res = await axios.get<ITransaction[]>(TRANS_API, {
      params: { monthlyCategoryId }, // nếu db đã đổi tên key
    });
    return res.data;
  } catch {
    return rejectWithValue("Không tải được giao dịch.");
  }
});


export const updateMonthlyBudget = createAsyncThunk<
  IMonthlyCategory,
  { id: number; totalBudget: number },
  { rejectValue: string }
>("finance/updateMonthlyBudget", async ({ id, totalBudget }, { rejectWithValue }) => {
  try {
    const res = await axios.patch<IMonthlyCategory>(`${MONTHLY_API}/${id}`, { totalBudget });
    return res.data;
  } catch {
    return rejectWithValue("Cập nhật ngân sách thất bại.");
  }
});

const initialState: FinanceState = {
  monthlycategories: [],
  transactions: [],
  selectedMonth: "",
  currentMonthData: null,
  remaining: 0,
  warningMessage: "",
  loading: false,
  error: null,
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setSelectedMonth(state, action: PayloadAction<string>) {
      state.selectedMonth = action.payload;
    },
    recomputeRemaining(state) {
      if (!state.currentMonthData) { state.remaining = 0; return; }
      const spent = state.transactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const budget = state.currentMonthData.totalBudget || 0;
      state.remaining = Math.max(0, budget - spent);
      state.warningMessage = spent > budget ? "Chi tiêu đã vượt quá ngân sách!" : "";
    },
  },
  extraReducers: (b) => {
    // fetch month
    b.addCase(fetchMonthlyCategory.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchMonthlyCategory.fulfilled, (s, a) => {
      s.loading = false;
      s.currentMonthData = a.payload;
      const idx = s.monthlycategories.findIndex(m => m.id === a.payload.id);
      if (idx === -1) s.monthlycategories.push(a.payload);
    });
    b.addCase(fetchMonthlyCategory.rejected, (s, a) => {
      s.loading = false; s.error = a.payload || "Error";
    });

    // fetch transactions
    b.addCase(fetchTransactions.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchTransactions.fulfilled, (s, a) => {
      s.loading = false; s.transactions = a.payload;
      if (s.currentMonthData) {
        const spent = s.transactions.reduce((sum, t) => sum + (t.total || 0), 0);
        const budget = s.currentMonthData.totalBudget || 0;
        s.remaining = Math.max(0, budget - spent);
        s.warningMessage = spent > budget ? "Chi tiêu đã vượt quá ngân sách!" : "";
      } else {
        s.remaining = 0; s.warningMessage = "";
      }
    });
    b.addCase(fetchTransactions.rejected, (s, a) => {
      s.loading = false; s.error = a.payload || "Error";
    });

    // update budget
    b.addCase(updateMonthlyBudget.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(updateMonthlyBudget.fulfilled, (s, a) => {
      s.loading = false;
      s.currentMonthData = a.payload;
      const idx = s.monthlycategories.findIndex(m => m.id === a.payload.id);
      if (idx !== -1) s.monthlycategories[idx] = a.payload;

      const spent = s.transactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const budget = a.payload.totalBudget || 0;
      s.remaining = Math.max(0, budget - spent);
      s.warningMessage = spent > budget ? "Chi tiêu đã vượt quá ngân sách!" : "";
    });
    b.addCase(updateMonthlyBudget.rejected, (s, a) => {
      s.loading = false; s.error = a.payload || "Error";
    });
  },
});

export const { setSelectedMonth, recomputeRemaining } = financeSlice.actions;
export default financeSlice.reducer;
