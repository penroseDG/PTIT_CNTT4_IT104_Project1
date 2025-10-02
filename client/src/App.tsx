import React from "react";
import { Outlet } from "react-router-dom";
import { App as AntdApp } from "antd"; 

export default function App() {
  return (
      <AntdApp>
      <Outlet />
    </AntdApp>
  );
}
