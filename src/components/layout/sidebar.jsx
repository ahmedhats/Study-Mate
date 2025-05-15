// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Space,
  Button,
  Drawer,
  Grid,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  InboxOutlined,
  SearchOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  HomeOutlined,
  AppstoreOutlined,
  PlusOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../../styles/sidebar.css";

const { Sider } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// Helper function to create menu items (optional but keeps structure clean)
// Added 'path' property for linking and key generation
function getItem(label, key, icon, path, children, type, onClick) {
  return { key, icon, children, label, type, onClick, path };
}

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("User data from localStorage:", parsedData);

        // Get user data from either structure
        const user = parsedData.user || parsedData;

        // Debug user data
        console.log("User name:", user.name);
        console.log("User email:", user.email);

        // Ensure we have at least basic user data
        if (!user.name && parsedData.name) {
          user.name = parsedData.name;
        }

        if (!user.email && parsedData.email) {
          user.email = parsedData.email;
        }

        setUserData(user);
      }
    } catch (error) {
      console.error("Error loading user data in sidebar:", error);
    }
  }, []);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    // Clear any user data from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("userProfile");
    // Navigate to login page
    navigate("/login");
  };

  // --- Menu Item Definitions ---
  // Assign unique keys and paths. Use paths for navigation.
  const sidebarMenuItems = [
    getItem("Main Menu", "grp1", null, null, null, "group"), // Group title
    getItem("Dashboard", "dashboard", <HomeOutlined />, "/dashboard"),
    getItem("Search", "search", <SearchOutlined />, "/search"), // Example path
    getItem("Inbox", "inbox", <InboxOutlined />, "/inbox"), // Example path
    getItem("My Task", "my-task", <CheckSquareOutlined />, "/tasks"), // Example path
    getItem("Social", "social", <TeamOutlined />, "/profile/social"), // Updated label and path

    getItem("Teamspaces", "grp2", null, null, null, "group"), // Group title
    getItem("Mine Design", "mine-design", <AppstoreOutlined />, null, [
      // Submenu key
      getItem("Intro Design", "intro-design", null, "/mine-design/intro"),
      getItem("About Company", "about-company", null, "/mine-design/about"),
      // ... other sub-items
    ]),
    getItem("Purweb Design", "purweb-design", <AppstoreOutlined />, null, [
      // Submenu key
      getItem("Intro Design", "purweb-intro", null, "/purweb/intro"),
      // ... other sub-items
    ]),

    { type: "divider", key: "divider-1" }, // Divider

    // Logout item with handleLogout function
    getItem(
      "Logout",
      "logout",
      <LogoutOutlined />,
      null,
      null,
      null,
      handleLogout
    ),
  ];

  // --- Handle Menu Item Click ---
  const handleMenuClick = ({ key }) => {
    const clickedItem = findMenuItem(sidebarMenuItems, key);
    if (clickedItem?.onClick) {
      clickedItem.onClick();
    } else if (clickedItem?.path) {
      navigate(clickedItem.path);
    }
    // Close the Drawer on mobile after any menu click
    if (isMobile) setDrawerVisible(false);
  };

  // Helper to find a menu item by key in nested structure
  const findMenuItem = (items, key) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findMenuItem(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // --- Determine Selected Keys based on current URL ---
  // This logic might need adjustment based on your exact route structure
  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    let selectedKey = "dashboard"; // Default key

    const findKey = (items) => {
      for (const item of items) {
        if (item.path && currentPath.startsWith(item.path)) {
          // More specific paths should match first if nested
          if (
            !findMenuItem(item.children || [], selectedKey)?.path?.startsWith(
              item.path
            )
          ) {
            selectedKey = item.key;
          }
        }
        if (item.children) {
          findKey(item.children); // Recurse
        }
      }
    };

    findKey(sidebarMenuItems);
    return [selectedKey];
  };

  // --- Determine Open Submenus (Optional - for complex nesting) ---
  const getDefaultOpenKeys = () => {
    // You could add logic here to open submenus based on the selected key
    return ["mine-design", "purweb-design"]; // Keep teamspaces open by default for now
  };

  // --- Responsive rendering ---
  const isMobile = !screens.md;

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!userData) return "??";

    if (userData.name) {
      // If we have a full name
      const nameParts = userData.name.split(" ");
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[
          nameParts.length - 1
        ].charAt(0)}`.toUpperCase();
      }
      return userData.name.charAt(0).toUpperCase();
    }

    // Fallback to email
    return userData.email ? userData.email.charAt(0).toUpperCase() : "?";
  };

  const sidebarContent = (
    <div className="sidebar-content-wrapper">
      <div className="sidebar-scrollable-content">
        <div
          className="sidebar-header"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          <Space align="center" className="sidebar-header-space">
            <Avatar size={40} className="sidebar-avatar">
              {getUserInitials()}
            </Avatar>
            {!collapsed && (
              <div className="user-info">
                <Text strong className="user-name">
                  {userData?.name || "Loading..."}
                </Text>
                <Text type="secondary" className="user-email">
                  {userData?.email || ""}
                </Text>
              </div>
            )}
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getDefaultOpenKeys()}
          items={sidebarMenuItems}
          className="sidebar-menu"
          inlineCollapsed={collapsed && !isMobile}
          onClick={handleMenuClick}
        />
      </div>
    </div>
  );

  if (isMobile) {
    // Render Drawer for mobile
    return (
      <>
        <Button
          className="sidebar-mobile-trigger"
          icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          style={{ position: "fixed", top: 16, left: 16, zIndex: 1100 }}
          onClick={() => setDrawerVisible((v) => !v)}
        />
        <Drawer
          title="Menu"
          placement="top"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          height="auto"
          bodyStyle={{ padding: 0 }}
          className="sidebar-mobile-drawer"
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  // Desktop: render Sider
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      className="app-sidebar"
      theme="light"
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
