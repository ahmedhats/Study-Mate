import React, { useState, useEffect } from "react";
import { message as antMessage, Tabs, Card } from "antd";
import SearchHeader from "../components/features/search/SearchHeader";
import SearchBar from "../components/features/search/SearchBar";
import CommunityList from "../components/features/search/CommunityList";
import {
  getCommunities,
  joinCommunity,
  toggleFavoriteCommunity,
} from "../services/api/communityService";

const { TabPane } = Tabs;

const SearchPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: "",
    topic: "all",
  });

  // Fetch communities on mount and when search params change
  useEffect(() => {
    fetchCommunities();
  }, [searchParams]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const response = await getCommunities(searchParams);
      if (response.success) {
        setCommunities(response.data);
      } else {
        antMessage.error(response.message || "Failed to load communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      antMessage.error("An error occurred while loading communities");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchParams((prev) => ({
      ...prev,
      query: value,
    }));
  };

  const handleTopicChange = (topic) => {
    setSearchParams((prev) => ({
      ...prev,
      topic,
    }));
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const response = await joinCommunity(communityId);
      if (response.success) {
        // Update local community data
        setCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? { ...community, isMember: !community.isMember }
              : community
          )
        );

        antMessage.success(
          response.data.joined
            ? "Successfully joined the community!"
            : "Left the community"
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error joining community:", error);
      antMessage.error(error.message || "Failed to join community");
    }
  };

  const handleFavoriteCommunity = async (communityId) => {
    try {
      const response = await toggleFavoriteCommunity(communityId);
      if (response.success) {
        // Update local community data
        setCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? { ...community, isFavorite: !community.isFavorite }
              : community
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      antMessage.error(error.message || "Failed to update favorite status");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <SearchHeader />

      <SearchBar onSearch={handleSearch} onTopicChange={handleTopicChange} />

      <Tabs defaultActiveKey="all" style={{ marginTop: 16 }}>
        <TabPane tab="All Communities" key="all">
          <CommunityList
            communities={communities}
            loading={loading}
            onJoin={handleJoinCommunity}
            onFavorite={handleFavoriteCommunity}
          />
        </TabPane>
        <TabPane tab="My Communities" key="my">
          <CommunityList
            communities={communities.filter((c) => c.isMember)}
            loading={loading}
            onJoin={handleJoinCommunity}
            onFavorite={handleFavoriteCommunity}
          />
        </TabPane>
        <TabPane tab="Favorites" key="favorites">
          <CommunityList
            communities={communities.filter((c) => c.isFavorite)}
            loading={loading}
            onJoin={handleJoinCommunity}
            onFavorite={handleFavoriteCommunity}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SearchPage;
