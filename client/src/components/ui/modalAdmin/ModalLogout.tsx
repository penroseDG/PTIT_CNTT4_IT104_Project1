import React, { useEffect, useRef } from "react";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function ModalLogout({ onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Đóng bằng ESC + Enter để xác nhận
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onConfirm]);

  // Đóng khi click ra ngoài
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="logout-title"
      aria-describedby="logout-desc"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-100 animate-[fadeIn_.15s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            {/* icon cảnh báo */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M10.3 3.7 1.6 18.3A2 2 0 0 0 3.3 21h17.4a2 2 0 0 0 1.7-2.7L13.7 3.7a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
          </div>
          <div>
            <h3 id="logout-title" className="text-[16px] font-semibold text-gray-900">
              Đăng xuất khỏi hệ thống?
            </h3>
            <p id="logout-desc" className="mt-1 text-sm text-gray-600">
              Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-2 rounded-lg text-sm text-white bg-[#4338CA] hover:brightness-110 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* animation keyframes (inline để không cần global css) */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
