import React, { useState } from "react";
import { Layout } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Sidebar from "./components/layout/sidebar";
import AppRoutes from "./routes";
import "./styles/App.css";

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  });

  return (
    <Layout className="main-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        userData={userData}
        onLogout={() => console.log("Logout clicked")}
      />
      <Layout className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Content className="content-wrapper">
          <div className="page-container">
            <AppRoutes />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "*",
      element: <MainLayout />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
