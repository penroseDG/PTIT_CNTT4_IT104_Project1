import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

type Props = {
  onOpenLogout: () => void;
};

function SidebarItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "mx-auto w-[238px] h-[40px] flex items-center px-4 rounded-md",
          "text-[14px] font-medium tracking-normal select-none",
          "border-b border-b-[#DEE2E6]",
          "transition-all duration-150 ease-in-out",
          isActive
            ? "text-[#4338CA] bg-white shadow-sm"
            : "text-[#000000] hover:text-[#4338CA] hover:bg-white",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminSidebar({ onOpenLogout }: Props) {
  return (
    <aside
      className="fixed left-0 z-20"
      style={{
        top: "60px",
        width: "250px", // ✅ giảm chiều ngang
        height: "calc(100vh - 60px)",
        backgroundColor: "#F8F9FA",
        borderRight: "1px solid #DEE2E6",
      }}
    >
      {/* Khoảng cách đầu theo Figma (60 header + spacing nhỏ hơn vì item thấp) */}
      <nav className="pt-[20px] flex flex-col gap-1">
        <SidebarItem to="dashboard">▦ Dashboard</SidebarItem>
        <SidebarItem to="users">👥 Users</SidebarItem>
        <SidebarItem to="category">☷ Category</SidebarItem>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <button
          type="button"
          onClick={onOpenLogout}
          className={[
            "mx-auto w-[238px] h-[38px]",
            "flex items-center gap-2 px-4 text-[14px] font-medium rounded",
            "text-[#000000] hover:text-[#4338CA] hover:bg-white transition-colors",
          ].join(" ")}
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
    