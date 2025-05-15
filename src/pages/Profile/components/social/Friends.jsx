import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  List,
  Avatar,
  Button,
  Input,
  Tabs,
  Badge,
  Modal,
  Tag,
  Empty,
  Spin,
  message,
  Divider,
  notification,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckOutlined,
  UserDeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  getUserFriends,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  getSentRequests,
  cancelFriendRequest,
} from "../../../../services/api/socialService";
import {
  formatLastActive,
  isUserOnline,
} from "../../../../utils/dateFormatter";

const { TabPane } = Tabs;
const { Search } = Input;

const Friends = forwardRef(({ onFriendRequestCanceled }, ref) => {
  const [activeKey, setActiveKey] = useState("myFriends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Expose fetchFriendsData through ref
  useImperativeHandle(ref, () => ({
    fetchFriendsData
  }));

  // Load friends and requests on component mount
  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);

      // Get friends list
      const friendsResponse = await getUserFriends();
      if (friendsResponse.error) {
        throw new Error(friendsResponse.error);
      }
      setFriends(friendsResponse.data || []);

      // Get pending requests
      const pendingResponse = await getPendingRequests();
      if (pendingResponse.error) {
        throw new Error(pendingResponse.error);
      }
      setPendingRequests(pendingResponse.data || []);

      // Get sent requests
      const sentResponse = await getSentRequests();
      if (sentResponse.error) {
        throw new Error(sentResponse.error);
      }
      setSentRequests(sentResponse.data || []);
    } catch (error) {
      console.error("Error fetching friends data:", error);
      notification.error({
        message: "Failed to Load Friends Data",
        description: error.message || "There was a problem loading your friends data.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    if (!value || value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      // Call the real search API
      const response = await searchUsers(value.trim());

      if (response.error) {
        throw new Error(response.error);
      }

      // Filter out users who are already friends or have pending requests
      const existingUserIds = [
        ...friends.map((user) => user._id),
        ...pendingRequests.map((user) => user._id),
        ...sentRequests.map((user) => user._id),
      ];

      const filteredResults = (response.data || []).filter(
        (user) => !existingUserIds.includes(user._id)
      );

      setSearchResults(filteredResults);

      // Show message if no results after filtering
      if (response.data?.length > 0 && filteredResults.length === 0) {
        message.info(
          "All matching users are already your friends or have pending requests"
        );
      }
    } catch (error) {
      console.error("Error searching users:", error);
      message.error("Failed to search users");

      // Mock data for development in case API fails
      setSearchResults([
        {
          _id: "user1",
          name: "David Brown",
          email: "david@example.com",
          major: "engineering",
          statistics: { lastActive: new Date(Date.now() - 10 * 60000) },
        },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      // Call the real API to send a friend request
      const response = await sendFriendRequest(userId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Show success message
      notification.success({
        message: "Friend Request Sent",
        description: "Your friend request has been sent successfully!",
        placement: "topRight",
      });

      // Move the user from search results to sent requests
      const user = searchResults.find((user) => user._id === userId);
      if (user) {
        setSentRequests([...sentRequests, user]);
        setSearchResults(searchResults.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      notification.error({
        message: "Failed to Send Request",
        description:
          error.message || "There was a problem sending your friend request.",
        placement: "topRight",
      });
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      // Find the friend request for this user
      const request = pendingRequests.find(request => request.sender._id === userId);
      if (!request) {
        throw new Error("Friend request not found");
      }

      // Call the API to accept the request
      const response = await acceptFriendRequest(request._id);

      if (response.error) {
        throw new Error(response.error);
      }

      notification.success({
        message: "Friend Request Accepted",
        description: "You are now friends!",
        placement: "topRight",
      });

      // Refresh the friends list to ensure it's up to date
      await fetchFriendsData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      notification.error({
        message: "Failed to Accept Request",
        description: error.message || "There was a problem accepting the friend request.",
        placement: "topRight",
      });
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      // Find the friend request for this user
      const request = pendingRequests.find(request => request.sender._id === userId);
      if (!request) {
        throw new Error("Friend request not found");
      }

      // Call the API to reject the request
      const response = await rejectFriendRequest(request._id);

      if (response.error) {
        throw new Error(response.error);
      }

      notification.success({
        message: "Friend Request Rejected",
        description: "The friend request has been rejected.",
        placement: "topRight",
      });

      // Refresh the friends list to ensure it's up to date
      await fetchFriendsData();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      notification.error({
        message: "Failed to Reject Request",
        description: error.message || "There was a problem rejecting the friend request.",
        placement: "topRight",
      });
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      // Call the real API to remove a friend
      const response = await removeFriend(userId);

      if (response.error) {
        throw new Error(response.error);
      }

      message.success("Friend removed successfully");

      // Update UI to reflect the change
      setFriends(friends.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error removing friend:", error);
      message.error("Failed to remove friend");
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      const response = await cancelFriendRequest(userId);

      if (response.error) {
        throw new Error(response.error);
      }

      message.success("Friend request canceled");

      // Update UI to reflect the change
      setSentRequests(sentRequests.filter((user) => user._id !== userId));

      // Notify parent component to refresh recommended friends
      if (onFriendRequestCanceled) {
        onFriendRequestCanceled();
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
      message.error("Failed to cancel friend request");
    }
  };

  // Helper function to format the major field
  const formatMajor = (majorValue) => {
    const majorMap = {
      computer_science: "Computer Science",
      biology: "Biology",
      engineering: "Engineering",
      mathematics: "Mathematics",
      business: "Business",
      literature: "Literature",
      physics: "Physics",
      chemistry: "Chemistry",
      psychology: "Psychology",
      medicine: "Medicine",
      arts: "Arts",
      other: "Other",
    };
    return majorMap[majorValue] || majorValue;
  };

  // Render user item for the list
  const renderUserItem = (user, actions) => {
    const isOnline = user.statistics?.lastActive
      ? isUserOnline(user.statistics.lastActive)
      : false;

    return (
      <List.Item actions={actions}>
        <List.Item.Meta
          avatar={
            <Badge
              dot
              status={isOnline ? "success" : "default"}
              offset={[-4, 36]}
            >
              <Avatar>{user.name ? user.name[0] : "U"}</Avatar>
            </Badge>
          }
          title={user.name}
          description={
            <div>
              <div>{user.email}</div>
              {user.major && <div>Field: {formatMajor(user.major)}</div>}
              {user.statistics?.lastActive && (
                <div className="last-active">
                  {isOnline ? (
                    "Online now"
                  ) : (
                    <>
                      <ClockCircleOutlined style={{ marginRight: 5 }} />
                      Last active:{" "}
                      {formatLastActive(user.statistics.lastActive)}
                    </>
                  )}
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h2>Friends</h2>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => setSearchModalVisible(true)}
        >
          Find Friends
        </Button>
      </div>

      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane
          tab={<span>My Friends ({friends.length})</span>}
          key="myFriends"
        >
          {loading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : friends.length > 0 ? (
            <List
              dataSource={friends}
              renderItem={(user) =>
                renderUserItem(user, [
                  <Button
                    icon={<UserDeleteOutlined />}
                    danger
                    onClick={() => handleRemoveFriend(user._id)}
                  >
                    Remove
                  </Button>,
                ])
              }
            />
          ) : (
            <Empty
              description="You don't have any friends yet. Find friends to add them to your network!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <Badge count={pendingRequests.length} size="small" offset={[10, 0]}>
              <span>Pending Requests</span>
            </Badge>
          }
          key="pendingRequests"
        >
          {loading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : pendingRequests.length > 0 ? (
            <List
              dataSource={pendingRequests}
              renderItem={(request) =>
                renderUserItem(request.sender, [
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAcceptRequest(request.sender._id)}
                  >
                    Accept
                  </Button>,
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => handleRejectRequest(request.sender._id)}
                  >
                    Reject
                  </Button>,
                ])
              }
            />
          ) : (
            <Empty
              description="No pending friend requests"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>

        <TabPane
          tab={<span>Sent Requests ({sentRequests.length})</span>}
          key="sentRequests"
        >
          {loading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : sentRequests.length > 0 ? (
            <List
              dataSource={sentRequests}
              renderItem={(user) =>
                renderUserItem(user, [
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => handleCancelRequest(user._id)}
                  >
                    Cancel
                  </Button>,
                ])
              }
            />
          ) : (
            <Empty
              description="You haven't sent any friend requests"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>
      </Tabs>

      {/* Find Friends Modal */}
      <Modal
        title="Find Friends"
        open={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false);
          setSearchResults([]);
        }}
        footer={null}
        width={600}
      >
        <Search
          placeholder="Search by name, email or field of study"
          enterButton="Search"
          size="large"
          loading={searching}
          onSearch={handleSearch}
          allowClear
        />

        <Divider />

        {searching ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : searchResults.length > 0 ? (
          <List
            dataSource={searchResults}
            renderItem={(user) =>
              renderUserItem(user, [
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAddFriend(user._id)}
                >
                  Add
                </Button>,
              ])
            }
          />
        ) : (
          <Empty
            description="Search for users to add as friends"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    </div>
  );
});

export default Friends;
