import React, { useState } from "react";
import { Input, Card, Select } from "antd";

const { Search } = Input;
const { Option } = Select;

const SearchBar = ({ onSearch, onTopicChange }) => {
  const [topic, setTopic] = useState("all");

  const handleTopicChange = (value) => {
    setTopic(value);
    if (onTopicChange) {
      onTopicChange(value);
    }
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Search
        placeholder="Search for communities..."
        allowClear
        enterButton="Search"
        size="large"
        onSearch={onSearch}
        addonBefore={
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={handleTopicChange}
            value={topic}
          >
            <Option value="all">All Topics</Option>
            <Option value="programming">Programming</Option>
            <Option value="math">Mathematics</Option>
            <Option value="science">Science</Option>
            <Option value="languages">Languages</Option>
            <Option value="arts">Arts</Option>
          </Select>
        }
      />
    </Card>
  );
};

export default SearchBar;
