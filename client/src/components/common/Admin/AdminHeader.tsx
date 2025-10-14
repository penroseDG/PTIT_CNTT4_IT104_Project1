import { useState } from "react";

type Props = {
  onLogout: () => void;
};

export default function AdminHeader({ onLogout }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8"
      style={{
        height: "60px",
        backgroundColor: "#F8F9FA",
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
      }}
    >
      <h1 className="text-base font-bold text-gray-900 select-none">
        Financial <span className="text-[#4338CA]">Manager</span>
      </h1>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-lg hover:ring-2 hover:ring-[#4338CA] transition"
          aria-label="Open menu"
        >
          👤
        </button>

        {open && (
          <div className="absolute top-11 right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 p-2">
            <button
              type="button"
              className="w-full text-center px-4 py-2 text-sm hover:bg-gray-50 text-black hover:text-[#4338CA] rounded transition"
              onClick={() => setOpen(false)}
            >
              Change Password
            </button>
            <button
              type="button"
              className="w-full text-center mt-1 px-4 py-2 text-sm text-white bg-red-700 hover:bg-red-600 rounded"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
