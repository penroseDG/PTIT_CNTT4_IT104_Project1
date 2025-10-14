import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { updateProfile } from "../../../store/slice/authSlice";

type Props = {
  open: boolean;
  onClose: () => void;
  user?: {
    id: number | string;
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
  } | null;
};

export default function ChangeInfoModal({ open, onClose, user }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "Male");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(user?.gender || "Male");
  }, [user, open]);

  const save = async () => {
    if (!fullName.trim() || !email.trim()) {
      alert("Name và Email là bắt buộc.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          id: user?.id,
          fullName,
          email,
          phone,
          gender,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Change Information</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name <span className="text-red-500">*</span></label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0987654321"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
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
