import React, { useState } from "react";
import { useAppSelector } from "../../hooks/useRedux";
import { selectAuthUser } from "../../store/slice/authSlice";
import ChangeInfoModal from "../../components/ui/modalUser/ModalChangeInfor";
import ChangePasswordModal from "../../components/ui/modalUser/ChangePasswordModal";

export default function Home() {
  const me = useAppSelector(selectAuthUser);
  const [openInfo, setOpenInfo] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
      <h3 className="text-center text-lg font-semibold text-indigo-700 mb-4">
        Quản Lý Thông Tin Cá Nhân
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input readOnly value={me?.fullName ?? ""} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        <input readOnly value={me?.email ?? ""}    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        <input readOnly value={me?.phone ?? ""}    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        <input readOnly value={me?.gender ?? ""}   className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <button onClick={() => setOpenInfo(true)} className="w-full px-6 py-2.5 border-2 border-indigo-600 text-indigo-600 bg-[#F4F2FD] font-medium rounded-lg">
          Change Information
        </button>
        <button onClick={() => setOpenPwd(true)} className="w-full px-6 py-2.5 border-2 border-indigo-600 text-indigo-600 bg-[#F4F2FD] font-medium rounded-lg">
          Change Password
        </button>
      </div>

      <ChangeInfoModal open={openInfo} onClose={() => setOpenInfo(false)} />
      <ChangePasswordModal open={openPwd} onClose={() => setOpenPwd(false)} />
    </div>
  );
}
