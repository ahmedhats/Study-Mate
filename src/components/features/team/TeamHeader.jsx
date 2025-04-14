import React from "react";
import { Typography, Space } from "antd";

const { Title } = Typography;

const TeamHeader = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Team Members</Title>
    </Space>
  );
};

export default TeamHeader;
 