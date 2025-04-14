import React from "react";
import { Layout, Breadcrumb, Typography, Space, Button } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SunOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const DashboardHeader = () => {
  return (
    <Header className="site-layout-background content-header">
      <div className="header-left">
        <Breadcrumb separator=">">
          <Breadcrumb.Item>Main Menu</Breadcrumb.Item>
          <Breadcrumb.Item style={{ color: "#7c3aed" }}>
            Dashboard
          </Breadcrumb.Item>
        </Breadcrumb>
        <Title level={4} className="page-title">
          Dashboard
        </Title>
      </div>
      <div className="header-right">
        <Space size="middle">
          <Button shape="circle" icon={<SearchOutlined />} />
          <Button shape="circle" icon={<SunOutlined />} />
          <Button shape="circle" icon={<BellOutlined />} />
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            className="add-widget-btn"
          >
            Add Widget
          </Button>
        </Space>
      </div>
    </Header>
  );
};

export default DashboardHeader;
