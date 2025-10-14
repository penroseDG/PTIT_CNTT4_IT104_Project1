import { Info, Shapes, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const sidebarItems = [
  { name: "Information", icon: Info, path: "/userhome" },
  { name: "Category", icon: Shapes, path: "category" },
  { name: "History", icon: History, path: "history" },
];

export default function UserSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="fixed top-[80px] left-4 md:left-8 z-40 flex flex-col gap-3">
      {sidebarItems.map(({ name, icon: Icon, path }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`flex items-center gap-2 w-[130px] px-3 py-2 rounded-md text-sm border shadow-md transition-all ${
            pathname === path
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}
        >
          <Icon size={16} />
          {name}
        </button>
      ))}
    </aside>
  );
}
