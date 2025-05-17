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
  Badge,
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
  CalendarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "../../styles/sidebar.css";

// Add a new import for the conversation service
import { getUserConversations } from "../../services/api/conversationService";

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Track window size changes for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 992 && !collapsed) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1200 && collapsed) {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed, setCollapsed]);

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

  // Add new effect to fetch unread message count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await getUserConversations();
        if (response.success) {
          // Calculate unread count by checking each conversation
          let count = 0;
          
          // Check if response.conversations exists (matches backend response format)
          const conversations = response.conversations || [];
          
          conversations.forEach(conversation => {
            if (userData && conversation.lastMessage) {
              // Find current user's participant record
              const userParticipant = conversation.participants.find(
                p => p.userId._id === userData._id
              );
              
              if (userParticipant) {
                // Compare timestamps to determine if message is unread
                const lastMessageTime = new Date(conversation.lastMessage.timestamp).getTime();
                const lastReadTime = new Date(userParticipant.lastReadTimestamp).getTime();
                
                if (lastMessageTime > lastReadTime) {
                  count += 1;
                }
              }
            }
          });
          
          setUnreadMessageCount(count);
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    // Only fetch if we have user data
    if (userData) {
      fetchUnreadMessages();
      
      // Set up polling for unread message updates
      const interval = setInterval(fetchUnreadMessages, 60000); // Every minute
      
      return () => clearInterval(interval);
    }
  }, [userData]);

  const handleProfileClick = () => {
    navigate("/profile");
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const handleLogout = () => {
    // Clear any user data from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("userProfile");
    // Navigate to login page
    navigate("/login");
    // Close mobile drawer if open
    if (drawerVisible) {
      setDrawerVisible(false);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // --- Menu Item Definitions ---
  // Assign unique keys and paths. Use paths for navigation.
  const sidebarMenuItems = [
    getItem("Main Menu", "grp1", null, null, null, "group"), // Group title
    getItem("Dashboard", "dashboard", <HomeOutlined />, "/dashboard"),
    getItem("Communities", "search", <SearchOutlined />, "/search"), // Communities page
    getItem("Inbox", "inbox", <InboxOutlined />, "/inbox"), // Example path
    getItem(
      "Messages", 
      "messages", 
      <Badge count={unreadMessageCount} offset={[10, 0]} size="small">
        <MessageOutlined />
      </Badge>, 
      "/messages"
    ), // Messaging feature
    getItem("My Task", "my-task", <CheckSquareOutlined />, "/tasks"), // Example path
    getItem("Calendar", "calendar", <CalendarOutlined />, "/calendar"), // New Calendar item
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
    const currentPath = location.pathname;
    const openKeys = [];

    // Add mine-design to open keys if on a mine-design path
    if (currentPath.includes("/mine-design")) {
      openKeys.push("mine-design");
    }

    // Add purweb-design to open keys if on a purweb path
    if (currentPath.includes("/purweb")) {
      openKeys.push("purweb-design");
    }

    return openKeys;
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

      {/* Collapse/Expand Trigger - Hide on very small screens */}
      {windowWidth > 576 && (
        <div className="sidebar-trigger-area">
          <Button
            type="text"
            className="sidebar-trigger-btn"
            onClick={toggleCollapsed}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          >
            {!collapsed && "Collapse Menu"}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    // Render Drawer for mobile
    return (
      <>
        <Button
          className="sidebar-mobile-trigger"
          icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setDrawerVisible((v) => !v)}
        />
        <Drawer
          title="Menu"
          placement="left"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={windowWidth < 400 ? "85%" : "270px"}
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
