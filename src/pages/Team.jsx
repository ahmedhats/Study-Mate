import React from "react";
import { Card } from "antd";
import TeamHeader from "../components/features/team/TeamHeader";
import TeamMemberList from "../components/features/team/TeamMemberList";

const TeamPage = () => {
  const [teamMembers] = React.useState([
    {
      id: 1,
      name: "John Doe",
      role: "Team Lead",
      email: "john.doe@example.com",
      status: "online",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Developer",
      email: "jane.smith@example.com",
      status: "offline",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Designer",
      email: "mike.johnson@example.com",
      status: "online",
    },
  ]);

  return (
    <div style={{ padding: "24px" }}>
      <TeamHeader />
      <Card>
        <TeamMemberList teamMembers={teamMembers} />
      </Card>
    </div>
  );
};

export default TeamPage;
