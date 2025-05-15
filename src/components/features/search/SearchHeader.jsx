import React from "react";
import { Typography, Space } from "antd";

const { Title, Text } = Typography;

const SearchHeader = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Communities</Title>
      <Text type="secondary">
        Find and join communities based on your interests
      </Text>
    </Space>
  );
};

export default SearchHeader;
