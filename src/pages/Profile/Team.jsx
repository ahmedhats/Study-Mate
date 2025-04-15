import React, { useState } from "react";
import { Table, Avatar, Tag, Button, Input, Select } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const Team = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const teamMembers = [
    {
      key: "1",
      name: "John Doe",
      role: "Developer",
      status: "Active",
      lastActive: "2 hours ago",
      email: "john@example.com",
    },
    {
      key: "2",
      name: "Jane Smith",
      role: "Designer",
      status: "Away",
      lastActive: "5 hours ago",
      email: "jane@example.com",
    },
    {
      key: "3",
      name: "Mike Johnson",
      role: "Manager",
      status: "Active",
      lastActive: "1 hour ago",
      email: "mike@example.com",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="team-member">
          <Avatar size="small">{text.charAt(0)}</Avatar>
          <div className="member-info">
            <span className="member-name">{text}</span>
            <span className="member-email">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "warning"}>{status}</Tag>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <div className="team-actions">
          <Button type="link">View</Button>
          <Button type="link">Edit</Button>
          <Button type="link" danger>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = teamMembers.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="team-container">
      <div className="team-header">
        <h2>Team Members</h2>
        <p>Manage your team members and their roles</p>
      </div>

      <div className="team-filters">
        <Search
          placeholder="Search team members"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
        >
          <Option value="all">All Status</Option>
          <Option value="Active">Active</Option>
          <Option value="Away">Away</Option>
        </Select>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Member
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={false}
        className="team-table"
      />
    </div>
  );
};

export default Team;
