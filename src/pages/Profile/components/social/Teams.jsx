import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Button,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Empty,
  Spin,
  message,
  Divider,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [teamDetailsModalVisible, setTeamDetailsModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch teams data when component mounts
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      // For now, let's use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockTeams = [
        {
          id: "team1",
          name: "Study Group Alpha",
          description: "A group focused on computer science topics",
          members: [
            { id: "user1", name: "John Doe", role: "admin" },
            { id: "user2", name: "Jane Smith", role: "member" },
          ],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "team2",
          name: "Math Enthusiasts",
          description: "Discussing advanced mathematics and problem-solving",
          members: [
            { id: "user1", name: "John Doe", role: "member" },
            { id: "user3", name: "Bob Johnson", role: "admin" },
            { id: "user4", name: "Alice Williams", role: "member" },
          ],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      ];

      setTeams(mockTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      message.error("Failed to load teams data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (values) => {
    try {
      // In a real implementation, this would be an API call
      console.log("Creating team with values:", values);

      // For now, let's simulate creating a team
      const newTeam = {
        id: `team${teams.length + 1}`,
        name: values.name,
        description: values.description,
        members: [
          // Current user as admin
          { id: "currentUser", name: "Current User", role: "admin" },
        ],
        createdAt: new Date(),
      };

      setTeams([...teams, newTeam]);
      message.success("Team created successfully");
      setCreateTeamModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating team:", error);
      message.error("Failed to create team");
    }
  };

  const showTeamDetails = (team) => {
    setSelectedTeam(team);
    setTeamDetailsModalVisible(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h2>My Teams</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateTeamModalVisible(true)}
        >
          Create Team
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin />
        </div>
      ) : teams.length > 0 ? (
        <List
          className="teams-list"
          itemLayout="horizontal"
          dataSource={teams}
          renderItem={(team) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="link"
                  onClick={() => showTeamDetails(team)}
                >
                  View Details
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<TeamOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                }
                title={team.name}
                description={
                  <>
                    <div>{team.description}</div>
                    <div>
                      {team.members.length} member
                      {team.members.length !== 1 ? "s" : ""}
                    </div>
                    <div>Created: {formatDate(team.createdAt)}</div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="You don't have any teams yet. Create a team to get started!"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Create Team Modal */}
      <Modal
        title="Create New Team"
        open={createTeamModalVisible}
        onCancel={() => {
          setCreateTeamModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTeam}>
          <Form.Item
            name="name"
            label="Team Name"
            rules={[
              { required: true, message: "Please enter a team name" },
              { max: 50, message: "Team name too long" },
            ]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter a description" },
              { max: 200, message: "Description too long" },
            ]}
          >
            <TextArea
              placeholder="Brief description of your team"
              rows={4}
              maxLength={200}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Team
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Team Details Modal */}
      {selectedTeam && (
        <Modal
          title={selectedTeam.name}
          open={teamDetailsModalVisible}
          onCancel={() => setTeamDetailsModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setTeamDetailsModalVisible(false)}
            >
              Close
            </Button>,
          ]}
          width={600}
        >
          <div className="team-details">
            <p className="team-description">{selectedTeam.description}</p>
            <Divider />
            <div className="team-meta">
              <p>
                <strong>Created:</strong> {formatDate(selectedTeam.createdAt)}
              </p>
            </div>
            <Divider />
            <div className="team-members">
              <div className="section-header">
                <h3>Members ({selectedTeam.members.length})</h3>
                <Button
                  type="primary"
                  icon={<UsergroupAddOutlined />}
                  size="small"
                >
                  Invite Members
                </Button>
              </div>
              <List
                dataSource={selectedTeam.members}
                renderItem={(member) => (
                  <List.Item
                    actions={[
                      member.role === "admin" && <Tag color="blue">Admin</Tag>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{member.name[0]}</Avatar>}
                      title={member.name}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Teams;
