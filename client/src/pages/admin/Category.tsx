import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchCategories,
  toggleCategoryStatus,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slice/categoryManagerSlice";
import type { Category } from "../../utils/type";
import { Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function CategoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, totalPages } = useSelector((s: RootState) => s.categoryManager);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  // modal states
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [openConfirm, setOpenConfirm] = useState<null | Category>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchCategories({ page, limit, search: searchTerm }));
    }, 350);
    return () => clearTimeout(t);
  }, [dispatch, page, limit, searchTerm]);

  const openAdd = () => {
    setEditing(null);
    setName(""); setImageUrl(""); setNameErr("");
    setOpenForm(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name || "");
    setImageUrl(c.imageUrl || "");
    setNameErr("");
    setOpenForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameErr("Name is required"); return; }

    if (editing) {
      await dispatch(updateCategory({ ...editing, name: name.trim(), imageUrl: imageUrl.trim() || undefined })).unwrap();
    } else {
      await dispatch(createCategory({ name: name.trim(), imageUrl: imageUrl.trim() || undefined, status: true })).unwrap();
    }
    setOpenForm(false);
  };

  const handleToggle = (c: Category) => dispatch(toggleCategoryStatus(c));
  const handleDelete = async () => {
    if (!openConfirm) return;
    await dispatch(deleteCategory(openConfirm.id)).unwrap();
    setOpenConfirm(null);
  };

  const goPrev = () => page > 1 && setPage(p => p - 1);
  const goNext = () => page < totalPages && setPage(p => p + 1);

  const badge = (active: boolean) =>
    active ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-[2px]">
        <span className="text-base leading-none">•</span> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 rounded-full px-2 py-[2px]">
        <span className="text-base leading-none">•</span> Inactive
      </span>
    );

  return (
    <div className="flex flex-col bg-gray-50 p-2 overflow-hidden h-[610px]">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="bg-[#4338CA] text-white px-4 py-2 rounded-lg hover:brightness-110 transition text-sm font-medium"
          type="button"
          onClick={openAdd}
        >
          Add Category
        </button>

        <div className="w-full max-w-xs relative">
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm flex flex-col flex-1 overflow-auto max-h-[540px]">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Đang tải…</div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="w-[60px] px-4 py-3 text-left text-[11px] font-medium text-gray-500">STT</th>
                  <th className="w-[240px] px-4 py-3 text-left text-[11px] font-medium text-gray-500">Name</th>
                  <th className="w-[160px] px-4 py-3 text-left text-[11px] font-medium text-gray-500">Image</th>
                  <th className="w-[120px] px-4 py-3 text-left text-[11px] font-medium text-gray-500">Status</th>
                  <th className="w-[220px] px-4 py-3 text-left text-[11px] font-medium text-gray-500">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-6 text-sm">Không có dữ liệu.</td>
                  </tr>
                ) : (
                  categories.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-all h-[56px] border-b border-gray-100">
                      <td className="px-4 text-sm text-gray-700">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 text-sm font-medium text-gray-900 truncate">{c.name}</td>
                      <td className="px-4 text-sm text-gray-700">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-9 h-9 rounded border border-gray-200 object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded border border-gray-300 bg-gray-50 grid place-items-center text-[11px] text-gray-400">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-4 text-sm">{badge(c.status)}</td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-7 px-3 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium"
                            onClick={() => openEdit(c)}
                          >
                            Edit
                          </button>
                          {c.status ? (
                            <button
                              type="button"
                              onClick={() => handleToggle(c)}
                              className="h-7 px-3 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggle(c)}
                              className="h-7 px-3 rounded bg-green-500 hover:bg-green-600 text-white text-xs font-medium"
                            >
                              Unblock
                            </button>
                          )}
                         
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-end">
          <div className="flex items-center gap-1.5">
            <button onClick={goPrev} disabled={page === 1}
              className="h-8 w-8 grid place-items-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`h-8 w-8 text-sm border rounded ${page === p ? "bg-[#4338CA] text-white border-[#4338CA]" : "border-gray-300 hover:bg-gray-100"}`}>
                {p}
              </button>
            ))}
            <button onClick={goNext} disabled={page === totalPages}
              className="h-8 w-8 grid place-items-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 " onMouseDown={(e) => e.target === e.currentTarget && setOpenForm(false)}>
          <form onSubmit={handleSave}
            className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-100 p-5 space-y-3">
            <h3 className="text-base font-semibold">{editing ? "Edit Category" : "Add Category"}</h3>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameErr(""); }}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 ${nameErr ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-gray-300"}`}
                placeholder="Category name"
              />
              {nameErr && <p className="mt-1 text-xs text-red-600">{nameErr}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Image URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 border-gray-300 focus:ring-gray-300"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpenForm(false)} className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" className="px-3.5 py-2 rounded-lg text-sm text-white bg-[#4338CA] hover:brightness-110">
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
