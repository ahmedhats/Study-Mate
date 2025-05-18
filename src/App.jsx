import React, { Suspense, useState, useEffect } from "react";
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
import ActivityTracker from "./components/common/ActivityTracker";
import NotificationHub from "./components/common/NotificationHub";
import "./styles/App.css";
import DirectVideoTest from "./components/features/studySessions/DirectVideoTest";

// Lazy load all components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Timer = React.lazy(() => import("./pages/Timer"));
const Stats = React.lazy(() => import("./pages/Stats"));
const StudyGroup = React.lazy(() => import("./pages/StudyGroup"));
const Team = React.lazy(() => import("./pages/Team"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const CalendarPage = React.lazy(() => import("./pages/CalendarPage"));
const Search = React.lazy(() => import("./pages/Search"));
const Inbox = React.lazy(() => import("./pages/Inbox"));
const MessagingPage = React.lazy(() => import("./components/features/messaging/MessagingPage"));
const MineDesign = React.lazy(() => import("./pages/mine-design/MineDesign"));
const Purweb = React.lazy(() => import("./pages/purweb/Purweb"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Social = React.lazy(() => import("./pages/Profile/Social"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Signup = React.lazy(() => import("./pages/auth/Signup"));
const ProfileSetup = React.lazy(() => import("./pages/auth/profilesetup"));
const VerifyEmail = React.lazy(() => import("./pages/auth/VerifyEmail"));
const CommunityDetailPage = React.lazy(() =>
  import("./pages/CommunityDetailPage")
);
const StudySession = React.lazy(() => import("./pages/StudySession"));
const AgoraStudyRoom = React.lazy(() =>
  import("./components/features/studySessions/AgoraStudyRoom")
);
const Users = React.lazy(() => import("./pages/Users"));

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
  let isAccountVerified = false;

  if (isAuthenticated) {
    try {
      console.log("Checking protected route access");
      const parsed = JSON.parse(userData);
      // Support both data structures (with or without user object)
      const user = parsed.user || parsed;

      console.log("User data in ProtectedRoute:", user);

      // Check verification and profile status
      profileCompleted = user.profileCompleted === true;
      isAccountVerified = user.isAccountVerified === true;

      console.log("Auth status:", {
        isAuthenticated,
        isAccountVerified,
        profileCompleted,
        path: location.pathname,
      });
    } catch (error) {
      console.error("Error parsing user data in ProtectedRoute:", error);
      // Handle parse error gracefully
      localStorage.removeItem("userData"); // Clear invalid data
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not verified, redirect to login with verification message
  if (!isAccountVerified) {
    console.log("Not verified, redirecting to login with message");
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message:
            "Please verify your email before accessing this page. Check your inbox for the verification link.",
        }}
        replace
      />
    );
  }

  // Special case: If user is already on profile-setup page, allow it
  const isOnProfileSetup = location.pathname === "/profile-setup";
  if (isOnProfileSetup) {
    console.log("User is on profile setup page, allowing access");
    return children;
  }

  // If profile is not completed, redirect to profile setup
  if (!profileCompleted) {
    console.log("Profile not completed, redirecting to profile setup");
    return <Navigate to="/profile-setup" replace />;
  }

  // All checks passed, render the protected route content
  console.log("All checks passed, rendering protected content");
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 992 && !collapsed) {
        setCollapsed(true);
      } else if (
        window.innerWidth >= 1200 &&
        collapsed &&
        windowWidth >= 1200
      ) {
        // Only auto-expand if we were already on a large screen
        setCollapsed(false);
      }
    };

    // Set initial state
    if (window.innerWidth < 992) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed, windowWidth]);

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
          {/* Activity tracker to update last active status */}
          <ActivityTracker />
          {/* Notification Hub for real-time notifications */}
          <NotificationHub />
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
              path="/verify-email"
              element={
                <AuthLayout>
                  <VerifyEmail />
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
            <Route
              path="/video-test"
              element={
                <AuthLayout>
                  <DirectVideoTest />
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

            {/* Add a direct route for the social tab specifically for sidebar navigation */}
            <Route
              path="/profile/social"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Add Calendar route */}
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CalendarPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Add Community Detail route */}
            <Route
              path="/community/:communityId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CommunityDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Add Study Sessions route */}
            <Route
              path="/study-sessions"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <StudySession />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Add Study Session Room route */}
            <Route
              path="/study-session/:sessionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AgoraStudyRoom />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Add MessagingPage routes here */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MessagingPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MessagingPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Add Users route for creating new conversations */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Users />
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
