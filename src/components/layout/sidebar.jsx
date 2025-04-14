// src/components/layout/Sidebar.jsx
import React from "react";
import { Layout, Menu, Avatar, Typography, Space, Button } from "antd";
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
} from "@ant-design/icons";
import "../../styles/sidebar.css";

const { Sider } = Layout;
const { Text } = Typography;

// Helper function to create menu items (optional but keeps structure clean)
// Added 'path' property for linking and key generation
function getItem(label, key, icon, path, children, type, onClick) {
  return { key, icon, children, label, type, onClick, path };
}

const Sidebar = ({ collapsed, setCollapsed, userData, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Menu Item Definitions ---
  // Assign unique keys and paths. Use paths for navigation.
  const sidebarMenuItems = [
    getItem("Main Menu", "grp1", null, null, null, "group"), // Group title
    getItem("Dashboard", "dashboard", <HomeOutlined />, "/dashboard"),
    getItem("Search", "search", <SearchOutlined />, "/search"), // Example path
    getItem("Inbox", "inbox", <InboxOutlined />, "/inbox"), // Example path
    getItem("My Task", "my-task", <CheckSquareOutlined />, "/tasks"), // Example path
    getItem("Team", "team", <TeamOutlined />, "/team"), // Example path

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

    // Logout item doesn't navigate, it triggers an action
    getItem("Logout", "logout", <LogoutOutlined />, null, null, null, onLogout),
  ];

  // --- Handle Menu Item Click ---
  const handleMenuClick = ({ key }) => {
    const clickedItem = findMenuItem(sidebarMenuItems, key);
    if (clickedItem?.onClick) {
      // If item has an onClick handler (like Logout), call it
      clickedItem.onClick();
    } else if (clickedItem?.path) {
      // Otherwise, navigate if it has a path
      navigate(clickedItem.path);
    }
    // Add logic for submenu clicks if needed (usually handled by AntD)
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

  return (
    // Use collapsedWidth={80} which is the Ant Design default
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      className="app-sidebar" // Use a more specific class name
      theme="light"
    >
      {/* Content Wrapper enables flex layout for trigger */}
      <div className="sidebar-content-wrapper">
        {/* Scrollable area for header, menu, etc. */}
        <div className="sidebar-scrollable-content">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <Space align="center" className="sidebar-header-space">
              <Avatar size={40} className="sidebar-avatar">
                {userData
                  ? `${userData.firstName?.charAt(
                      0
                    )}${userData.lastName?.charAt(0)}`
                  : "??"}
              </Avatar>
              {!collapsed && (
                <div className="user-info">
                  <Text strong className="user-name">
                    {userData
                      ? `${userData.firstName} ${userData.lastName}`
                      : "Loading..."}
                  </Text>
                  <Text type="secondary" className="user-email">
                    {userData?.email}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          {/* Sidebar Menu */}
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()} // Dynamically set selected keys
            defaultOpenKeys={getDefaultOpenKeys()} // Keep relevant submenus open
            items={sidebarMenuItems}
            className="sidebar-menu"
            inlineCollapsed={collapsed}
            onClick={handleMenuClick} // Centralized click handler
          />

          {/* Add Folder Button */}
          {!collapsed && (
            <Button
              type="text"
              icon={<PlusOutlined />}
              className="add-folder-btn"
            >
              Add Folder
            </Button>
          )}
        </div>{" "}
        {/* End scrollable content */}
        {/* Sidebar Footer/Trigger Area (Stays at bottom) */}
        <div className="sidebar-trigger-area">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-trigger-btn"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} // Accessibility
          />
        </div>
      </div>{" "}
      {/* End content wrapper */}
    </Sider>
  );
};

export default Sidebar;
