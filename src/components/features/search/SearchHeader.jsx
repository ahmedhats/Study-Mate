import React from "react";
import { Typography, Space } from "antd";

const { Title } = Typography;

const SearchHeader = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Search</Title>
    </Space>
  );
};

export default SearchHeader;
