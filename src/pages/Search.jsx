import React from "react";
import { Typography, Input, Card, Space } from "antd";

const { Title } = Typography;
const { Search } = Input;

const SearchPage = () => {
  const onSearch = (value) => {
    console.log("Search:", value);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Search</Title>
        <Card>
          <Search
            placeholder="Search for anything..."
            allowClear
            enterButton="Search"
            size="large"
            onSearch={onSearch}
          />
        </Card>
      </Space>
    </div>
  );
};

export default SearchPage;
