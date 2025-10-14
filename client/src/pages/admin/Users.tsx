import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Lock, Unlock } from "lucide-react";
import {
  fetchUsers,
  toggleUserStatus,
} from "../../store/slice/userManagerSlice";
import type { User } from "../../utils/type";
import type { RootState, AppDispatch } from "../../store/store";

export default function UserManagerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, totalPages } = useSelector(
    (state: RootState) => state.userManager
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Lấy danh sách user (debounce 400ms)
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(fetchUsers({ page: currentPage, limit, search: searchTerm }));
    }, 400);
    return () => clearTimeout(delay);
  }, [dispatch, currentPage, limit, searchTerm]);

  // Đổi trạng thái user
  const handleToggleStatus = (user: User) => {
    dispatch(toggleUserStatus(user));
  };

  // Pagination
  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  const renderGender = (gender: boolean | null) =>
    gender === true ? "Male" : gender === false ? "Female" : "—";

  const renderStatus = (status: boolean | null) => {
    if (status === true)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <span className="text-lg">•</span> Hoạt động
        </span>
      );
    if (status === false)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
          <span className="text-lg">•</span> Bị khóa
        </span>
      );
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
          <span className="text-lg">•</span> —
        </span>
      );
  };

  return (
    <div className="flex flex-col bg-gray-50 p-2 overflow-hidden h-[610px]">
      {/* Search */}
      <div className="mb-4 flex justify-end flex-shrink-0">
        <div className="w-full max-w-xs relative">
          <input
            type="text"
            placeholder="Search here"
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1); // reset về trang 1 khi gõ search
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Search">
            <Search size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm flex flex-col flex-1 overflow-auto max-h-[540px]">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Đang tải...</div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="w-[60px] px-4 py-3 text-left text-xs font-medium text-gray-500">STT</th>
                  <th className="w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="w-[240px] px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="w-[140px] px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                  <th className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500">Gender</th>
                  <th className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-6 text-sm">
                      Không có dữ liệu người dùng.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-all h-[56px] border-b border-gray-100"
                    >
                      <td className="px-4 text-sm text-gray-700">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 text-sm font-medium text-gray-900 truncate">
                        {user.fullName || "—"}
                      </td>
                      <td className="px-4 text-sm text-gray-700 truncate">
                        {user.email}
                      </td>
                      <td className="px-4 text-sm text-gray-700">{user.phone || "—"}</td>
                      <td className="px-4 text-sm text-gray-700">{renderGender(user.gender)}</td>
                      <td className="px-4 text-sm">{renderStatus(user.status)}</td>
                      <td className="px-4">
                        {user.status ? (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 rounded-full hover:bg-green-100 text-green-600 flex items-center gap-1"
                          >
                            <Unlock size={16} />
                            <span className="text-xs font-medium">Active</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 rounded-full hover:bg-red-100 text-red-600 flex items-center gap-1"
                          >
                            <Lock size={16} />
                            <span className="text-xs font-medium">Deactivate</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-3 flex justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 border rounded transition ${
                  currentPage === page
                    ? "bg-[#4338CA] text-white border-[#4338CA]"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
