import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-[#4f46e5] text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        <h1 className="font-semibold text-sm sm:text-base pl-4 md:pl-28">
          📒 Tài Chính Cá Nhân K24_Rikkei
        </h1>

        <div className="relative pr-4 md:pr-28">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-sm">Tài khoản</span>
            <ChevronDown size={18} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-40 bg-white text-gray-800 rounded shadow-md border border-gray-100 z-50">
              <div className="px-4 py-2 border-b text-sm">user@example.com</div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowModal(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal Logout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Xác nhận đăng xuất</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc muốn đăng xuất?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("currentUser");
                  navigate("/signup");
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
