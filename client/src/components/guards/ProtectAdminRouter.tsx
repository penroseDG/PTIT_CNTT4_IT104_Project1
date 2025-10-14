import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

// bảo vệ trang admin
export default function AdminProtectedRoute({ children }: Props) {
  const currentAdmin = localStorage.getItem("currentAdmin");
  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
