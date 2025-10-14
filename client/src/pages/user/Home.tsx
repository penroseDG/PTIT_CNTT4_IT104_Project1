import React from "react";

export default function Home() {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
      <h3 className="text-center text-lg font-semibold text-indigo-700 mb-4">
        Quản Lý Thông Tin Cá Nhân
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text" 
          defaultValue="Nguyễn Văn A"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="email"
          defaultValue="nguyenvana@gmail.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="tel"
          defaultValue="0987654321"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          defaultValue="Male"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <button className="w-full px-6 py-2.5 border-2 border-indigo-600 text-indigo-600 bg-[#F4F2FD] font-medium rounded-lg">
          Change Information
        </button>
        <button className="w-full px-6 py-2.5 border-2 border-indigo-600 text-indigo-600 bg-[#F4F2FD] font-medium rounded-lg">
          Change Password
        </button>
      </div>
    </div>
  );
}
