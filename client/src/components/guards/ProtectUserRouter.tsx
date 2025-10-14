import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

// bảo vệ trang user
export default function ProtectedRoute({ children }: Props) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}
