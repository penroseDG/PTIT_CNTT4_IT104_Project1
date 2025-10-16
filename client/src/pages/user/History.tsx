import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchTransactions } from "../../store/slice/financeSlice";

const API_BASE = "http://localhost:8080";

type Category = { id: number; name: string; monthId?: number; monthlyCategoryId?: number };

type TxnStrict = {
  id: number;
  monthlyCategoryId: number;
  categoryId: number;
  amount: number;
  note: string;
  type?: "expense" | "income";
  createdAt?: string;
};

const thousandVN = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(n)));
const fmtMoney = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} VND`;

export default function History() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentMonthData, transactions } = useSelector((s: RootState) => s.financeSlice);

  const [cats, setCats] = useState<Category[]>([]);
  const [amountRaw, setAmountRaw] = useState("");
  const [catId, setCatId] = useState<number | "">("");
  const [note, setNote] = useState("");

  const [sortAsc, setSortAsc] = useState(true);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 5;

  // === Fetch categories + đảm bảo có "danh mục mặc định" khi đổi tháng ===
  useEffect(() => {
    if (!currentMonthData?.id) return;

    (async () => {
      try {
        const id = currentMonthData.id;

        // Thử monthId (legacy), nếu trống thì thử monthlyCategoryId (new)
        let r = await axios.get<Category[]>(`${API_BASE}/categories`, { params: { monthId: id } });
        if (!Array.isArray(r.data) || r.data.length === 0) {
          r = await axios.get<Category[]>(`${API_BASE}/categories`, { params: { monthlyCategoryId: id } });
        }

        // Nếu vẫn chưa có danh mục -> tạo 1 danh mục mặc định cho tháng này
        if (!r.data || r.data.length === 0) {
          const created = await axios.post<Category>(`${API_BASE}/categories`, {
            name: "Chi tiêu khác",
            monthlyCategoryId: id,
          });
          setCats([created.data]);
          setCatId(created.data.id); // chọn sẵn
        } else {
          setCats(r.data);
          // Bảo đảm catId hiện tại còn tồn tại, nếu không thì chọn cái đầu tiên
          setCatId((prev) => {
            const ok = r.data.some((c) => c.id === prev);
            return ok ? prev : r.data[0]?.id ?? "";
          });
        }
      } catch (err) {
        console.error(err);
        setCats([]);
        setCatId("");
      }
    })();

    // Lấy lại giao dịch của tháng này
    dispatch(fetchTransactions(currentMonthData.id));

    // Reset form khi đổi tháng
    setAmountRaw("");
    setNote("");
    setPage(1);
  }, [currentMonthData?.id, dispatch]);

  // Chuẩn hoá txns
  const normalizedTxns: TxnStrict[] = useMemo(() => {
    const fallbackMonthlyId = Number(currentMonthData?.id ?? 0);
    return (transactions as any[]).map((t) => ({
      id: Number(t?.id ?? 0),
      monthlyCategoryId: Number(t?.monthlyCategoryId ?? t?.monthId ?? fallbackMonthlyId),
      categoryId: Number(t?.categoryId ?? 0),
      amount: Number(t?.amount ?? t?.total ?? 0),
      note: String(t?.note ?? ""),
      type: t?.type,
      createdAt: t?.createdAt,
    }));
  }, [transactions, currentMonthData?.id]);

  // Lọc + sắp xếp
  const filtered = useMemo(() => {
    const monthlyId = Number(currentMonthData?.id ?? 0);
    const list = normalizedTxns.filter((t) => t.monthlyCategoryId === monthlyId);
    const byQuery = query.trim()
      ? list.filter((t) => (t.note || "").toLowerCase().includes(query.trim().toLowerCase()))
      : list;
    const sorted = [...byQuery].sort((a, b) => (sortAsc ? a.amount - b.amount : b.amount - a.amount));
    return sorted;
  }, [normalizedTxns, currentMonthData?.id, query, sortAsc]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages, page]);
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  // Thêm giao dịch
  const onAdd = async () => {
    if (!currentMonthData?.id) return;
    const amount = Number(amountRaw.replace(/[^\d]/g, ""));
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Số tiền không hợp lệ!");
      return;
    }

    // Nếu vì lý do nào đó vẫn chưa có category -> tạo nhanh danh mục mặc định
    let finalCatId = catId;
    if (!finalCatId) {
      const created = await axios.post<Category>(`${API_BASE}/categories`, {
        name: "Chi tiêu khác",
        monthlyCategoryId: currentMonthData.id,
      });
      setCats((prev) => [created.data, ...prev]);
      finalCatId = created.data.id;
      setCatId(finalCatId);
    }

    try {
      await axios.post(`${API_BASE}/transactions`, {
        monthlyCategoryId: currentMonthData.id,
        categoryId: finalCatId,
        amount,
        type: "expense",
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });

      await dispatch(fetchTransactions(currentMonthData.id)).unwrap();
      setAmountRaw("");
      setNote("");
      setPage(1);
    } catch (e) {
      console.error(e);
      alert("Không thể thêm giao dịch.");
    }
  };

  // Xoá giao dịch
  const onDelete = async (tx: { id: number }) => {
    if (!currentMonthData?.id) return;
    if (!confirm("Xóa giao dịch này?")) return;
    try {
      await axios.delete(`${API_BASE}/transactions/${tx.id}`);
      await dispatch(fetchTransactions(currentMonthData.id)).unwrap();
    } catch (e) {
      console.error(e);
      alert("Không thể xóa giao dịch.");
    }
  };

  const catName = (id: number) => cats.find((c) => c.id === id)?.name || "-";

  return (
    <div className="space-y-4">
      {/* Thêm giao dịch */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Số tiền"
            inputMode="numeric"
            value={amountRaw ? thousandVN(Number(amountRaw)) : ""}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^\d]/g, ""))}
            className="h-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
          />

          <select
            value={catId === "" ? "" : String(catId)}
            onChange={(e) => setCatId(e.target.value ? Number(e.target.value) : "")}
            className="h-10 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
          >
            {/* Nếu chưa có danh mục, vẫn hiển thị option trống */}
            {cats.length === 0 && <option value="">(Sẽ tạo danh mục mặc định)</option>}
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-10 flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={onAdd} className="h-10 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Thêm
          </button>
        </div>
      </div>

      {/* Bảng lịch sử + controls */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch (theo tháng)</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortAsc((v) => !v)}
              className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm"
              title="Sắp xếp theo số tiền"
            >
              Sắp xếp theo số tiền {sortAsc ? "↑" : "↓"}
            </button>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="tìm nội dung"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => setPage(1)}
                title="Tìm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zM4 9.5C4 6.47 6.47 4 9.5 4S15 6.47 15 9.5 12.53 15 9.5 15 4 12.53 4 9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2">STT</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Note</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">Chưa có giao dịch.</td>
                </tr>
              )}
              {rows.map((tx, idx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">{start + idx + 1}</td>
                  <td className="px-3 py-2">{catName(tx.categoryId)}</td>
                  <td className="px-3 py-2">{fmtMoney(tx.amount)}</td>
                  <td className="px-3 py-2">{tx.note}</td>
                  <td className="px-3 py-2">
                    <button className="p-1 rounded hover:bg-gray-100 text-black" onClick={() => onDelete({ id: tx.id })} title="Xóa">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="Trước">←</button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <button key={n} onClick={() => setPage(n)}
                className={["w-8 h-8 flex items-center justify-center border rounded", page === n ? "bg-indigo-600 text-white" : "hover:bg-gray-50"].join(" ")}>
                {n}
              </button>
            );
          })}

          <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Tiếp">→</button>
        </div>
      </div>
    </div>
  );
}