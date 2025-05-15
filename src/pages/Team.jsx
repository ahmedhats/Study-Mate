import React, { useState, useEffect } from "react";
import { Card, Spin, message, Empty } from "antd";
import TeamHeader from "../components/features/team/TeamHeader";
import TeamMemberList from "../components/features/team/TeamMemberList";
import { getUserFriends } from "../services/api/userService";

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await getUserFriends();

        if (response.error) {
          throw new Error(response.error);
        }

        // Format the data for display
        const formattedFriends =
          response.data?.map((friend) => ({
            id: friend._id,
            name: friend.name,
            role: friend.major ? formatMajor(friend.major) : "Study Mate User",
            email: friend.email,
            status: friend.status || "offline",
            lastActive: friend.statistics?.lastActive || null,
          })) || [];

        setTeamMembers(formattedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
        message.error("Failed to load friends data");

        // Fallback to demo data if API fails
        setTeamMembers([
          {
            id: 1,
            name: "John Doe",
            role: "Team Lead",
            email: "john.doe@example.com",
            status: "online",
            lastActive: new Date(Date.now() - 1000 * 60), // 1 minute ago
          },
          {
            id: 2,
            name: "Jane Smith",
            role: "Developer",
            email: "jane.smith@example.com",
            status: "offline",
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          },
          {
            id: 3,
            name: "Mike Johnson",
            role: "Designer",
            email: "mike.johnson@example.com",
            status: "offline",
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();

    // Set up interval to refresh friend data
    const intervalId = setInterval(() => {
      fetchFriends();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Helper function to format major values
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

  return (
    <div style={{ padding: "24px" }}>
      <TeamHeader />
      <Card>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : teamMembers.length > 0 ? (
          <TeamMemberList teamMembers={teamMembers} />
        ) : (
          <Empty
            description="No study mates found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default TeamPage;
