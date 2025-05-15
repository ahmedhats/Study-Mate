﻿import React, { Suspense, useState } from "react";
import { Layout, Spin } from "antd";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/layout/sidebar";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./styles/App.css";

// Lazy load all components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Timer = React.lazy(() => import("./pages/Timer"));
const Stats = React.lazy(() => import("./pages/Stats"));
const StudyGroup = React.lazy(() => import("./pages/StudyGroup"));
const Team = React.lazy(() => import("./pages/Team"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Search = React.lazy(() => import("./pages/Search"));
const Inbox = React.lazy(() => import("./pages/Inbox"));
const MineDesign = React.lazy(() => import("./pages/mine-design/MineDesign"));
const Purweb = React.lazy(() => import("./pages/purweb/Purweb"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Signup = React.lazy(() => import("./pages/auth/Signup"));
const ProfileSetup = React.lazy(() => import("./pages/auth/profilesetup"));

const { Content } = Layout;

const LoadingFallback = () => (
  <div className="loading-container">
    <Spin size="large" />
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userData = localStorage.getItem("userData");
  const isAuthenticated = userData !== null;
  let profileCompleted = false;
  if (isAuthenticated) {
    try {
      const parsed = JSON.parse(userData);
      profileCompleted = parsed.user?.profileCompleted === true;
    } catch {}
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but profile not completed, redirect to /profile-setup
  const isOnProfileSetup = location.pathname === "/profile-setup";
  const isLoggingOut = location.pathname === "/logout";
  if (!profileCompleted && !isOnProfileSetup && !isLoggingOut) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

// Auth Layout - without sidebar
const AuthLayout = ({ children }) => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">{children}</Content>
    </Layout>
  );
};

// Main Layout - with sidebar
const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="main-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Content className="content-wrapper">{children}</Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthLayout>
                  <Signup />
                </AuthLayout>
              }
            />
            <Route
              path="/welcome"
              element={
                <AuthLayout>
                  <Welcome />
                </AuthLayout>
              }
            />
            <Route
              path="/profile-setup"
              element={
                <AuthLayout>
                  <ProfileSetup />
                </AuthLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/timer"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Timer />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Stats />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-group"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <StudyGroup />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Team />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Tasks />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Search />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Inbox />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mine-design/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MineDesign />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purweb/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Purweb />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
