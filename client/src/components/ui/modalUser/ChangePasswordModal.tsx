import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { changePassword } from "../../../store/slice/authSlice";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ open, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!oldPassword || !newPassword) {
      alert("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu mới không khớp.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      onClose();
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      alert("Đổi mật khẩu thành công.");
    } catch (err) {
      console.error(err);
      alert("Đổi mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-600">Old Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">New Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm New Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
