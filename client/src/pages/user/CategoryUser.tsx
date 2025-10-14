import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchTransactions } from "../../store/slice/financeSlice";

const API_BASE = "http://localhost:8080"; 

type CategoryItem = {
  id: number;
  name: string;
  limit: number;
  monthId: number;
};

type Txn = {
  id: number;
  monthId: number;
  categoryId: number;
  amount: number;           
  type?: "expense" | "income";
  note?: string;
  createdAt?: string;
};

const thousandVN = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(n)));
const fmtUSDLike = (n: number) => `${thousandVN(n)} $`; // hiển thị như Figma
const toDigits = (s: string) => s.replace(/[^\d]/g, "");

export default function Category() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentMonthData, selectedMonth, transactions } = useSelector(
    (s: RootState) => s.financeSlice
  );

  const [list, setList] = useState<CategoryItem[]>([]);

  // form inline (thêm/sửa)
  const [nameInput, setNameInput] = useState("");
  const [limitRaw, setLimitRaw] = useState("");
  const [editing, setEditing] = useState<CategoryItem | null>(null);

  // modal xác nhận xóa
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CategoryItem | null>(null);

  // fetch categories + transactions
  useEffect(() => {
    if (!currentMonthData?.id) return;

    axios
      .get<CategoryItem[]>(`${API_BASE}/categories`, {
        params: { monthId: currentMonthData.id },
      })
      .then((r) =>
        setList(r.data.map((it: any) => ({ ...it, limit: Number(it.limit) || 0 })))
      )
      .catch((e) => console.error(e));

    dispatch(fetchTransactions(currentMonthData.id));
  }, [currentMonthData?.id, dispatch]);

  // 
  const spentByCategory = useMemo(() => {
    const map = new Map<number, number>();
    (transactions as unknown as Txn[] | undefined)?.forEach((t) => {
      if (t.monthId !== currentMonthData?.id) return;
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + Math.max(0, Number(t.amount) || 0));
    });
    return map;
  }, [transactions, currentMonthData?.id]);

  //  helpers 
  const resetForm = () => {
    setEditing(null);
    setNameInput("");
    setLimitRaw("");
  };

  // thêm / lưu sửa
  const handleSubmit = async () => {
    if (!currentMonthData?.id) return;
    const name = nameInput.trim();
    const limit = Number(limitRaw || "0");

    if (!name) return alert("Vui lòng nhập tên danh mục!");
    if (!limit || isNaN(limit) || limit <= 0) return alert("Giới hạn (VND) chưa hợp lệ!");

    try {
      if (editing) {
        // UPDATE category
        const { data } = await axios.patch<CategoryItem>(
          `${API_BASE}/categories/${editing.id}`,
          { name, limit }
        );
        setList((prev) => prev.map((x) => (x.id === editing.id ? { ...data, limit } : x)));

        // Nếu bạn muốn điều chỉnh lại giao dịch theo limit mới, xử lý tại đây.
        await dispatch(fetchTransactions(currentMonthData.id)).unwrap();
      } else {
        // CREATE category
        const { data: createdCat } = await axios.post<CategoryItem>(`${API_BASE}/categories`, {
          name,
          limit,
          monthId: currentMonthData.id,
        });

        setList((prev) => [{ ...createdCat, limit: Number(createdCat.limit) || 0 }, ...prev]);

        // ✅ Ghi transaction CHI bằng đúng limit để "Số tiền còn lại" giảm ngay
        await axios.post(`${API_BASE}/transactions`, {
          monthId: currentMonthData.id,
          categoryId: createdCat.id,
          amount: limit,             // số tiền chi
          type: "expense",
          note: `Khởi tạo danh mục "${name}"`,
          createdAt: new Date().toISOString(),
        });

        // Cập nhật remaining
        await dispatch(fetchTransactions(currentMonthData.id)).unwrap();
      }

      resetForm();
    } catch (e) {
      console.error(e);
      alert("Không thể lưu danh mục. Vui lòng thử lại!");
    }
  };

  // ===== chuẩn bị sửa =====
  const startEdit = (c: CategoryItem) => {
    setEditing(c);
    setNameInput(c.name);
    setLimitRaw(String(c.limit));
  };

  // ===== xóa =====
  const askDelete = (c: CategoryItem) => {
    setPendingDelete(c);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !currentMonthData?.id) return;
    try {
      await axios.delete(`${API_BASE}/categories/${pendingDelete.id}`);
      setList((prev) => prev.filter((x) => x.id !== pendingDelete.id));
    } catch (e) {
      console.error(e);
      alert("Không thể xóa danh mục. Vui lòng thử lại!");
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const invalid =
    !nameInput.trim() || !limitRaw || Number(limitRaw) <= 0 || isNaN(Number(limitRaw));

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">💼</span>
          <h2 className="text-xl font-semibold text-gray-800">
            Quản lý danh mục (Theo tháng{selectedMonth ? ` ${selectedMonth}` : ""})
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Tên danh mục"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-[350px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Giới hạn (VND)"
            value={limitRaw ? thousandVN(Number(limitRaw)) : ""}
            onChange={(e) => setLimitRaw(toDigits(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[200px]"
          />
          <button
            onClick={handleSubmit}
            disabled={invalid}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>

          {editing && (
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {list.map((c) => {
            return (
              <div
                key={c.id}
                className="relative w-[212px] h-[82px] border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <button
                  aria-label={`Xóa ${c.name}`}
                  className="absolute right-2 top-2 w-5 h-5 leading-5 text-xs    text-gray-500 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    askDelete(c);
                  }}
                  title="Xóa danh mục"
                >
                  ×
                </button>

                <button
                  aria-label={`Sửa ${c.name}`}
                  className="absolute right-2 top-8 w-5 h-5 flex items-center justify-center rounded-md text-black hover:text-indigo-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(c);
                  }}
                  title="Sửa danh mục"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 000-1.42l-1.5-1.5a1.003 1.003 0 00-1.42 0l-1.12 1.12 3.75 3.75 1.29-1.29z"/>
                  </svg>
                </button>

                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">$</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500">{fmtUSDLike(c.limit)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800">Xóa danh mục?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Bạn chắc chắn muốn xóa{" "}
                  <span className="font-medium text-gray-800">{pendingDelete?.name}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingDelete(null);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
