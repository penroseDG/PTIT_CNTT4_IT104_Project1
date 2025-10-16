import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  fetchMonthlyCategory,
  fetchTransactions,
  updateMonthlyBudget,
  setSelectedMonth,
} from "../store/slice/financeSlice";   

import UserHeader from "../components/common/user/UserHeader";
import UserSidebar from "../components/common/user/UserSideBar";

export default function User() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentMonthData, remaining, warningMessage, loading, selectedMonth } =
    useSelector((state: RootState) => state.financeSlice);

  const [budgetInput, setBudgetInput] = useState("");
  const [monthInput, setMonthInput] = useState(
    selectedMonth || new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (!monthInput) return;
    dispatch(setSelectedMonth(monthInput));
    dispatch(fetchMonthlyCategory(monthInput)).then((res: any) => {
      if (res?.payload?.id) dispatch(fetchTransactions(res.payload.id));
    });
  }, [monthInput, dispatch]);

  const handleSaveBudget = () => {
    if (!currentMonthData) return;
    const totalBudget = Number(budgetInput);
    if (isNaN(totalBudget) || totalBudget <= 0) {
      alert("Vui lòng nhập ngân sách hợp lệ!");
      return;
    }
    dispatch(updateMonthlyBudget({ id: currentMonthData.id, totalBudget }))
      .unwrap()
      .then(() => {
        // refetch để cập nhật remaining/ warningMessage
        dispatch(fetchTransactions(currentMonthData.id));
        setBudgetInput("");
      });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-gray-700">
      <UserHeader />
      <UserSidebar />
      {/* phần main */}
      <main className="pt-[80px] pb-5 px-4 max-w-5xl mx-auto space-y-6">
        <div className="bg-[#4F46E5] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Kiểm soát chi tiêu thông minh
            </h1>
          </div>
          <p className="text-center text-indigo-100 text-sm md:text-base">
            Theo dõi ngân sách và thu chi hàng tháng dễ dàng
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="text-3xl">📊</span>
          <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700">
            Quản Lý Tài Chính Cá Nhân
          </h2>
        </div>

        {/* Số tiền còn lại  */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-center">
          <p className="text-gray-600 mb-2 text-sm md:text-base">Số tiền còn lại</p>
          <p className="text-4xl text-green-500">
            {loading ? "..." : `${remaining.toLocaleString()} VND`}
          </p>
        </div>

        {/* Chọn tháng */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">📅</span>
              <span className="font-medium">Chọn tháng:</span>
            </div>
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Ngân sách tháng */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">💰</span>
              <span className="font-medium">Ngân sách tháng:</span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="VD: 5000000"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
              <button
                onClick={handleSaveBudget}
                disabled={loading || !currentMonthData}
                className="px-6 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300"
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>

        {/* Cảnh báo chi tiêu */}
        {warningMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 shadow-sm text-center">
            {warningMessage}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
