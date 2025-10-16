import  { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ModalLogout from "../components/ui/modalAdmin/ModalLogout";
import AdminHeader from "../components/common/Admin/AdminHeader";
import AdminSidebar from "../components/common/Admin/AdminSideBar";

export default function Admin() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    setShowLogoutConfirm(false);
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <AdminHeader onLogout={() => setShowLogoutConfirm(true)} />
      <AdminSidebar onOpenLogout={() => setShowLogoutConfirm(true)} />
      <main
        className="relative p-8"
        style={{ marginLeft: "250px", paddingTop: "80px" }}
      >
        <Outlet />
      </main>
      {showLogoutConfirm && (
        <ModalLogout
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
