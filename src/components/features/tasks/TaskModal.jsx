import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Divider,
  List,
  Checkbox,
  Tabs,
  Table,
  Tag,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TaskModal = ({
  open,
  onCancel,
  onSubmit,
  editingTask = null,
  users = [],
}) => {
  const [form] = Form.useForm();
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState("view");

  useEffect(() => {
    if (editingTask) {
      // Populate form with existing task data
      form.setFieldsValue({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        importance: editingTask.importance || "normal",
        status: editingTask.status,
        dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null,
      });

      // Set subtasks
      if (editingTask.subtasks && editingTask.subtasks.length > 0) {
        setSubtasks(editingTask.subtasks);
      }

      // Set team members
      if (editingTask.teamMembers && editingTask.teamMembers.length > 0) {
        setTeamMembers(editingTask.teamMembers);
      }
    }
  }, [editingTask, form]);

  const handleCancel = () => {
    form.resetFields();
    setSubtasks([]);
    setNewSubtask("");
    setTeamMembers([]);
    setSelectedUser(null);
    setSelectedPermission("view");
    setActiveTab("1");
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format the task data
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : undefined,
        subtasks: subtasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        })),
        teamMembers: teamMembers.map(member => ({
          user: member.user,
          permissions: member.permissions
        }))
      };

      console.log("Submitting task data:", taskData); // Debug log

      // Call the onSubmit prop with the formatted data
      await onSubmit(taskData);
      
      // Reset form and state
      form.resetFields();
      setSubtasks([]);
      setTeamMembers([]);
      setNewSubtask("");
      setSelectedUser(null);
      setSelectedPermission("view");
      setActiveTab("1");
    } catch (error) {
      console.error("Form validation failed:", error);
      if (error.errorFields) {
        // Handle validation errors
        error.errorFields.forEach(field => {
          message.error(`${field.name}: ${field.errors[0]}`);
        });
      } else {
        message.error("Failed to save task. Please try again.");
      }
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { title: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskCompletion = (index, checked) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].completed = checked;
    setSubtasks(updatedSubtasks);
  };

  const addTeamMember = () => {
    if (!selectedUser) return;

    // Check if user is already a team member
    if (teamMembers.some((member) => member.user === selectedUser)) {
      return;
    }

    // Add team member
    setTeamMembers([
      ...teamMembers,
      {
        user: selectedUser,
        permissions: selectedPermission,
        name: users.find((u) => u._id === selectedUser)?.name || "Unknown User",
      },
    ]);

    // Reset selection
    setSelectedUser(null);
  };

  const removeTeamMember = (userId) => {
    setTeamMembers(teamMembers.filter((member) => member.user !== userId));
  };

  const updateTeamMemberPermission = (userId, newPermission) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.user === userId
          ? { ...member, permissions: newPermission }
          : member
      )
    );
  };

  const getPermissionColor = (permission) => {
    const colors = {
      view: "blue",
      edit: "green",
      admin: "purple",
    };
    return colors[permission] || "blue";
  };

  const getImportanceColor = (importance) => {
    const colors = {
      critical: "red",
      important: "orange",
      normal: "blue",
      optional: "green",
    };
    return colors[importance] || "blue";
  };

  return (
    <Modal
      title={editingTask ? "Edit Task" : "Add New Task"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={700}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Task Details" key="1">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: "medium",
              importance: "normal",
              status: "todo",
              dueDate: dayjs(),
            }}
            onSubmit={handleSubmit}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: "Please enter a task title",
                },
                {
                  min: 3,
                  max: 100,
                  message: "Title must be between 3 and 100 characters",
                },
              ]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  max: 1000,
                  message: "Description cannot exceed 1000 characters",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter task description"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>

            <Space size="large" style={{ width: "100%", flexWrap: "wrap" }}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[
                  {
                    required: true,
                    message: "Please select a priority",
                  },
                ]}
              >
                <Select style={{ width: 120 }}>
                  <Option value="urgent">Urgent</Option>
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="importance"
                label="Importance"
                rules={[
                  {
                    required: true,
                    message: "Please select importance",
                  },
                ]}
              >
                <Select style={{ width: 120 }}>
                  <Option value="critical">
                    <Tag color={getImportanceColor("critical")}>Critical</Tag>
                  </Option>
                  <Option value="important">
                    <Tag color={getImportanceColor("important")}>Important</Tag>
                  </Option>
                  <Option value="normal">
                    <Tag color={getImportanceColor("normal")}>Normal</Tag>
                  </Option>
                  <Option value="optional">
                    <Tag color={getImportanceColor("optional")}>Optional</Tag>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[
                  {
                    required: true,
                    message: "Please select a status",
                  },
                ]}
              >
                <Select style={{ width: 120 }}>
                  <Option value="todo">To Do</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[
                  {
                    required: true,
                    message: "Please select a due date",
                  },
                ]}
              >
                <DatePicker style={{ width: 200 }} />
              </Form.Item>
            </Space>

            <Divider orientation="left">Subtasks</Divider>

            <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
              <Input
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onPressEnter={addSubtask}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addSubtask}
              >
                Add
              </Button>
            </Space.Compact>

            <List
              size="small"
              bordered
              dataSource={subtasks}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSubtask(index)}
                    />,
                  ]}
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={(e) =>
                      handleSubtaskCompletion(index, e.target.checked)
                    }
                  >
                    {item.title}
                  </Checkbox>
                </List.Item>
              )}
              locale={{ emptyText: "No subtasks added" }}
            />
          </Form>
        </TabPane>

        <TabPane tab="Team Members" key="2">
          <div style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Select
                placeholder="Select user"
                style={{ width: 200 }}
                value={selectedUser}
                onChange={setSelectedUser}
                showSearch
                optionFilterProp="children"
              >
                {users.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={selectedPermission}
                onChange={setSelectedPermission}
              >
                <Option value="view">View Only</Option>
                <Option value="edit">Can Edit</Option>
                <Option value="admin">Admin</Option>
              </Select>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addTeamMember}
                disabled={!selectedUser}
              >
                Add Member
              </Button>
            </Space>

            <Table
              dataSource={teamMembers}
              columns={[
                {
                  title: "Name",
                  dataIndex: "name",
                  key: "name",
                  render: (text, record) => (
                    <Space>
                      <UserOutlined />
                      {text || record.user}
                    </Space>
                  ),
                },
                {
                  title: "Permissions",
                  dataIndex: "permissions",
                  key: "permissions",
                  render: (text, record) => (
                    <Select
                      value={text}
                      style={{ width: 120 }}
                      onChange={(value) =>
                        updateTeamMemberPermission(record.user, value)
                      }
                    >
                      <Option value="view">
                        <Tag color={getPermissionColor("view")}>View Only</Tag>
                      </Option>
                      <Option value="edit">
                        <Tag color={getPermissionColor("edit")}>Can Edit</Tag>
                      </Option>
                      <Option value="admin">
                        <Tag color={getPermissionColor("admin")}>Admin</Tag>
                      </Option>
                    </Select>
                  ),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeTeamMember(record.user)}
                    />
                  ),
                },
              ]}
              pagination={false}
              size="small"
              locale={{ emptyText: "No team members added" }}
              rowKey="user"
            />
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default TaskModal;
