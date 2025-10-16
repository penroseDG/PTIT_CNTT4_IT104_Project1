// src/components/user/ChangeInfoModal.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import {
  selectAuthUser,
  selectAuthLoading,
  selectAuthError,
  updateProfile,
  type AuthUser,
} from "../../../store/slice/authSlice";

export default function ChangeInfoModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);
  const globalError = useAppSelector(selectAuthError);

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", gender: "Male" as "Male"|"Female"|"Other" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !me) return;
    setForm({
      fullName: me.fullName ?? "",
      email: me.email ?? "",
      phone: me.phone ?? "",
      gender: (me.gender as any) ?? "Male",
    });
    setSubmitError(null);
    setOk(null);
    setErrors({});
  }, [open, me]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.fullName.trim()) err.fullName = "Name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Email is invalid";
    if (form.phone && !/^[0-9+\-()\s]{8,20}$/.test(form.phone)) err.phone = "Phone is invalid";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSave = async () => {
    setSubmitError(null); setOk(null);
    if (!me) { setSubmitError("Bạn chưa đăng nhập."); return; }
    if (!validate()) return;
    const payload: Partial<AuthUser> = {
      id: me.id,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
    };
    try {
      await dispatch(updateProfile(payload)).unwrap();
      setOk("Updated successfully.");
      onClose();
    } catch (e: any) {
      setSubmitError(typeof e === "string" ? e : "Update failed.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[90%] max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Change Information</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
          {globalError && <div className="text-red-600 text-sm">{globalError}</div>}
          {ok && <div className="text-green-600 text-sm">{ok}</div>}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
            <input name="fullName" value={form.fullName} onChange={onChange}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? "border-red-400" : "border-gray-300"}`} />
            {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={form.email} onChange={onChange}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.email ? "border-red-400" : "border-gray-300"}`} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${errors.phone ? "border-red-400" : "border-gray-300"}`} />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={onChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
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
