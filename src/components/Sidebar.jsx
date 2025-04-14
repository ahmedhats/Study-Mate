import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  InboxOutlined,
  SearchOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/team",
      icon: <TeamOutlined />,
      label: "Team",
    },
    {
      key: "/inbox",
      icon: <InboxOutlined />,
      label: "Inbox",
    },
    {
      key: "/search",
      icon: <SearchOutlined />,
      label: "Search",
    },
    {
      key: "/tasks",
      icon: <CheckSquareOutlined />,
      label: "Tasks",
    },
  ];

  return (
    <Sider
      width={250}
      className="site-layout-sider"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
