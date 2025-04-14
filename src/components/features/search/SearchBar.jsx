import React from "react";
import { Input, Card } from "antd";

const { Search } = Input;

const SearchBar = ({ onSearch }) => {
  return (
    <Card>
      <Search
        placeholder="Search for anything..."
        allowClear
        enterButton="Search"
        size="large"
        onSearch={onSearch}
      />
    </Card>
  );
};

export default SearchBar;
