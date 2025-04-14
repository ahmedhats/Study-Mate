import React, { useState, Suspense } from "react";
import { Layout, Spin } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/sidebar";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./styles/App.css";

// Lazy load components for better performance
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Timer = React.lazy(() => import("./pages/Timer"));
const Stats = React.lazy(() => import("./pages/Stats"));
const StudyGroup = React.lazy(() => import("./pages/StudyGroup"));
const Team = React.lazy(() => import("./pages/Team"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Search = React.lazy(() => import("./pages/Search"));
const Inbox = React.lazy(() => import("./pages/Inbox"));

const { Content } = Layout;

// Define routes configuration
const routes = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/timer", element: <Timer /> },
  { path: "/stats", element: <Stats /> },
  { path: "/study-group", element: <StudyGroup /> },
  { path: "/team", element: <Team /> },
  { path: "/tasks", element: <Tasks /> },
  { path: "/search", element: <Search /> },
  { path: "/inbox", element: <Inbox /> },
];

const LoadingFallback = () => (
  <div className="loading-container">
    <Spin size="large" />
  </div>
);

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
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <div className="page-container">
                <Routes>
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                </Routes>
              </div>
            </Suspense>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;
