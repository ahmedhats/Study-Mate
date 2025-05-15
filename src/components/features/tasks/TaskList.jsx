import React, { useState } from "react";
import {
  List,
  Checkbox,
  Typography,
  Button,
  Popconfirm,
  Tag,
  Space,
  Progress,
  Collapse,
  Divider,
  Tooltip,
  Avatar,
} from "antd";
import {
  DeleteOutlined,
  CaretRightOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  EditTwoTone,
  CrownTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./TaskList.css";

const { Text } = Typography;
const { Panel } = Collapse;

const getPriorityColor = (priority) => {
  const colors = {
    urgent: "red",
    high: "orange",
    medium: "blue",
    low: "green",
  };
  return colors[priority] || "default";
};

const getImportanceColor = (importance) => {
  const colors = {
    critical: "red",
    important: "orange",
    normal: "blue",
    optional: "green",
  };
  return colors[importance] || "default";
};

const getStatusColor = (status) => {
  const colors = {
    todo: "default",
    in_progress: "processing",
    completed: "success",
    archived: "default",
  };
  return colors[status] || "default";
};

const formatStatus = (status) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const TaskList = ({
  tasks = [],
  onToggleCompletion,
  onDeleteTask,
  onUpdateTask,
  onEditTask,
  currentUser = {},
}) => {
  const [expandedTasks, setExpandedTasks] = useState([]);

  const toggleExpand = (taskId) => {
    if (expandedTasks.includes(taskId)) {
      setExpandedTasks(expandedTasks.filter((id) => id !== taskId));
    } else {
      setExpandedTasks([...expandedTasks, taskId]);
    }
  };

  const handleSubtaskToggle = (taskId, subtaskIndex, checked) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = checked;

    // Calculate new progress based on subtasks
    const totalSubtasks = updatedSubtasks.length;
    const completedSubtasks = updatedSubtasks.filter(
      (st) => st.completed
    ).length;
    const progress = totalSubtasks
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

    // Update task with new subtasks and progress
    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      progress,
      // If all subtasks are completed, mark the task as completed
      status:
        totalSubtasks && completedSubtasks === totalSubtasks
          ? "completed"
          : completedSubtasks > 0
          ? "in_progress"
          : task.status,
    };

    onUpdateTask(taskId, updatedTask);
  };

  const calculateProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      // If no subtasks, base progress on task completion status
      return task.status === "completed" ? 100 : 0;
    }

    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  const getProgressStatus = (percent) => {
    if (percent === 100) return "success";
    if (percent > 0) return "active";
    return "normal";
  };

  const canEditTask = (task) => {
    if (!task || !currentUser?._id) return false;

    // User is the creator
    if (
      task.createdBy?._id === currentUser._id ||
      task.createdBy === currentUser._id
    ) {
      return true;
    }

    // Check team members permissions
    if (task.teamMembers && task.teamMembers.length > 0) {
      const userTeamMember = task.teamMembers.find(
        (m) => m.user?._id === currentUser._id || m.user === currentUser._id
      );

      return (
        userTeamMember &&
        (userTeamMember.permissions === "edit" ||
          userTeamMember.permissions === "admin")
      );
    }

    return false;
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case "view":
        return <EyeOutlined />;
      case "edit":
        return <EditTwoTone twoToneColor="#52c41a" />;
      case "admin":
        return <CrownTwoTone twoToneColor="#faad14" />;
      default:
        return <EyeOutlined />;
    }
  };

  return (
    <List
      dataSource={Array.isArray(tasks) ? tasks : []}
      renderItem={(task) => {
        const progress = task.progress || calculateProgress(task);
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const canEdit = canEditTask(task);

        return (
          <List.Item
            className="task-list-item"
            actions={[
              <Space>
                {task.importance && (
                  <Tag color={getImportanceColor(task.importance)}>
                    {task.importance.toUpperCase()}
                  </Tag>
                )}
                <Tag color={getPriorityColor(task.priority)}>
                  {(task.priority || "").toUpperCase()}
                </Tag>
                <Tag color={getStatusColor(task.status)}>
                  {formatStatus(task.status || "")}
                </Tag>
                {canEdit && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEditTask && onEditTask(task)}
                  />
                )}
                {(task.createdBy === currentUser?._id ||
                  task.createdBy?._id === currentUser?._id ||
                  task.teamMembers?.some(
                    (m) =>
                      (m.user === currentUser?._id ||
                        m.user?._id === currentUser?._id) &&
                      m.permissions === "admin"
                  )) && (
                  <Popconfirm
                    title="Delete this task?"
                    description="Are you sure you want to delete this task?"
                    onConfirm={() => onDeleteTask(task._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </Space>,
            ]}
          >
            <div className="task-container">
              <div className="task-header">
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={task.status === "completed"}
                      onChange={() => onToggleCompletion(task._id)}
                      disabled={!canEdit}
                    />
                  }
                  title={
                    <div className="task-title-container">
                      <Text delete={task.status === "completed"}>
                        {task.title}
                      </Text>
                      {hasSubtasks && (
                        <Button
                          type="text"
                          size="small"
                          className="expand-button"
                          icon={
                            <CaretRightOutlined
                              className={
                                expandedTasks.includes(task._id)
                                  ? "expanded"
                                  : ""
                              }
                            />
                          }
                          onClick={() => toggleExpand(task._id)}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">{task.description}</Text>
                      <br />
                      <Text type="secondary">
                        Due: {dayjs(task.dueDate).format("MMMM D, YYYY")}
                      </Text>
                      {(hasSubtasks || progress > 0) && (
                        <div className="task-progress">
                          <Progress
                            percent={progress}
                            size="small"
                            status={getProgressStatus(progress)}
                            style={{ marginTop: "8px" }}
                          />
                        </div>
                      )}

                      {/* Show team members */}
                      {task.teamMembers && task.teamMembers.length > 0 && (
                        <div className="task-team-members">
                          <Tooltip title="Team Members">
                            <span style={{ marginRight: "5px" }}>
                              <TeamOutlined />
                            </span>
                          </Tooltip>
                          <Avatar.Group maxCount={3} size="small">
                            {task.teamMembers.map((member, idx) => (
                              <Tooltip
                                key={idx}
                                title={`${
                                  member.user?.name || member.name || "User"
                                } (${member.permissions})`}
                              >
                                <Avatar
                                  icon={getPermissionIcon(member.permissions)}
                                  style={{
                                    backgroundColor:
                                      member.permissions === "admin"
                                        ? "#faad14"
                                        : member.permissions === "edit"
                                        ? "#52c41a"
                                        : "#1890ff",
                                  }}
                                >
                                  {(
                                    member.user?.name?.[0] ||
                                    member.name?.[0] ||
                                    "U"
                                  ).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                        </div>
                      )}
                    </div>
                  }
                />
              </div>

              {hasSubtasks && expandedTasks.includes(task._id) && (
                <div className="subtasks-container">
                  <Divider style={{ margin: "12px 0" }} />
                  <List
                    size="small"
                    dataSource={task.subtasks}
                    renderItem={(subtask, index) => (
                      <List.Item className="subtask-item">
                        <Checkbox
                          checked={subtask.completed}
                          onChange={(e) =>
                            handleSubtaskToggle(
                              task._id,
                              index,
                              e.target.checked
                            )
                          }
                          disabled={!canEdit}
                        >
                          <Text delete={subtask.completed}>
                            {subtask.title}
                          </Text>
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default TaskList;
