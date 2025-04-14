import React from "react";
import SearchHeader from "../components/features/search/SearchHeader";
import SearchBar from "../components/features/search/SearchBar";

const SearchPage = () => {
  const onSearch = (value) => {
    console.log("Search:", value);
  };

  return (
    <div style={{ padding: "24px" }}>
      <SearchHeader />
      <SearchBar onSearch={onSearch} />
    </div>
  );
};

export default SearchPage;
