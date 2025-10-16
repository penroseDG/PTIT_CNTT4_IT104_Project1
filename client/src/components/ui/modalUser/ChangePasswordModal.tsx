// src/components/user/ChangePasswordModal.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { changePassword, selectAuthLoading, selectAuthError } from "../../../store/slice/authSlice";

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const globalError = useAppSelector(selectAuthError);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!oldPassword) err.oldPassword = "Old password is required";
    if (!newPassword) err.newPassword = "New password is required";
    else if (newPassword.length < 6) err.newPassword = "At least 6 characters";
    if (confirm !== newPassword) err.confirm = "Passwords do not match";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSave = async () => {
    setSubmitError(null); setOk(null);
    if (!validate()) return;
    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      setOk("Password changed successfully.");
      setOldPassword(""); setNewPassword(""); setConfirm("");
      onClose();
    } catch (e: any) {
      const msg = typeof e === "string" ? e : "Change password failed";
      // map lỗi thân thiện
      setSubmitError(
        msg === "OLD_PASSWORD_INCORRECT" ? "Mật khẩu cũ không đúng."
        : msg === "NEW_PASSWORD_TOO_SHORT" ? "Mật khẩu mới tối thiểu 6 ký tự."
        : msg
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[90%] max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
          {globalError && <div className="text-red-600 text-sm">{globalError}</div>}
          {ok && <div className="text-green-600 text-sm">{ok}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Old Password <span className="text-red-500">*</span></label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.oldPassword ? "border-red-400" : "border-gray-300"}`} />
            {errors.oldPassword && <p className="text-sm text-red-500 mt-1">{errors.oldPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password <span className="text-red-500">*</span></label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.newPassword ? "border-red-400" : "border-gray-300"}`} />
            {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password <span className="text-red-500">*</span></label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.confirm ? "border-red-400" : "border-gray-300"}`} />
            {errors.confirm && <p className="text-sm text-red-500 mt-1">{errors.confirm}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t">
          <button onClick={onClose} disabled={loading} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={loading} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
