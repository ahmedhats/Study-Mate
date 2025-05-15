import React, { useState } from "react";
import {
  Card,
  Checkbox,
  Typography,
  Tag,
  Space,
  Progress,
  Button,
  Collapse,
  List,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CaretRightOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./Todo.css";

const { Text, Title } = Typography;
const { Panel } = Collapse;

/**
 * Todo component for displaying and managing a single task
 */
const Todo = ({
  todo,
  onToggleCompletion,
  onDelete,
  onEdit,
  onUpdateSubtask,
  currentUser,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Handle toggling the expanded state
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Handle subtask toggle
  const handleSubtaskToggle = (subtaskIndex, checked) => {
    if (onUpdateSubtask) {
      onUpdateSubtask(todo._id, subtaskIndex, checked);
    }
  };

  // Get priority color based on priority level
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "red",
      high: "orange",
      medium: "blue",
      low: "green",
    };
    return colors[priority] || "default";
  };

  // Get importance color based on importance level
  const getImportanceColor = (importance) => {
    const colors = {
      critical: "red",
      important: "orange",
      normal: "blue",
      optional: "green",
    };
    return colors[importance] || "default";
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    const colors = {
      todo: "default",
      in_progress: "processing",
      completed: "success",
      archived: "default",
    };
    return colors[status] || "default";
  };

  // Format status text for display
  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Calculate progress based on subtasks
  const calculateProgress = () => {
    if (!todo.subtasks || todo.subtasks.length === 0) {
      return todo.status === "completed" ? 100 : 0;
    }

    const totalSubtasks = todo.subtasks.length;
    const completedSubtasks = todo.subtasks.filter((st) => st.completed).length;
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  // Get progress status for styling
  const getProgressStatus = (percent) => {
    if (percent === 100) return "success";
    if (percent > 0) return "active";
    return "normal";
  };

  // Check if current user can edit the task
  const canEditTask = () => {
    if (!todo || !currentUser?._id) return false;

    // User is the creator
    if (
      todo.createdBy?._id === currentUser._id ||
      todo.createdBy === currentUser._id
    ) {
      return true;
    }

    // Check team members permissions
    if (todo.teamMembers && todo.teamMembers.length > 0) {
      const userTeamMember = todo.teamMembers.find(
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

  // Check if current user can delete the task
  const canDeleteTask = () => {
    return (
      todo.createdBy === currentUser?._id ||
      todo.createdBy?._id === currentUser?._id ||
      todo.teamMembers?.some(
        (m) =>
          (m.user === currentUser?._id || m.user?._id === currentUser?._id) &&
          m.permissions === "admin"
      )
    );
  };

  const progress = todo.progress || calculateProgress();
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const canEdit = canEditTask();
  const canDelete = canDeleteTask();
  const dueDate = todo.dueDate ? dayjs(todo.dueDate) : null;
  const isOverdue =
    dueDate && dayjs().isAfter(dueDate) && todo.status !== "completed";

  return (
    <Card
      className={`todo-card ${isOverdue ? "todo-overdue" : ""} ${
        todo.status === "completed" ? "todo-completed" : ""
      }`}
      bodyStyle={{ padding: "12px" }}
    >
      <div className="todo-header">
        <div className="todo-checkbox-title">
          <Checkbox
            checked={todo.status === "completed"}
            onChange={() => onToggleCompletion && onToggleCompletion(todo._id)}
            disabled={!canEdit}
            className="todo-checkbox"
          />
          <div className="todo-title-container">
            <Text
              delete={todo.status === "completed"}
              strong
              className="todo-title"
            >
              {todo.title}
            </Text>
            {dueDate && (
              <Tooltip title={`Due: ${dueDate.format("MMM D, YYYY")}`}>
                <Space
                  className={`todo-due-date ${
                    isOverdue ? "todo-overdue-text" : ""
                  }`}
                >
                  <ClockCircleOutlined />
                  <span>{dueDate.format("MMM D")}</span>
                </Space>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="todo-actions">
          {canEdit && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit && onEdit(todo)}
              size="small"
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Delete this task?"
              description="Are you sure you want to delete this task?"
              onConfirm={() => onDelete && onDelete(todo._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          )}
        </div>
      </div>

      {todo.description && (
        <div className="todo-description">
          <Text type="secondary">{todo.description}</Text>
        </div>
      )}

      <div className="todo-tags">
        {todo.importance && (
          <Tag color={getImportanceColor(todo.importance)}>
            {todo.importance.toUpperCase()}
          </Tag>
        )}
        <Tag color={getPriorityColor(todo.priority)}>
          {(todo.priority || "").toUpperCase()}
        </Tag>
        <Tag color={getStatusColor(todo.status)}>
          {formatStatus(todo.status || "")}
        </Tag>
        {todo.teamMembers && todo.teamMembers.length > 0 && (
          <Tooltip title={`${todo.teamMembers.length} team member(s)`}>
            <Tag icon={<TeamOutlined />} color="blue">
              Team
            </Tag>
          </Tooltip>
        )}
      </div>

      {hasSubtasks && (
        <div className="todo-progress">
          <div className="progress-header">
            <Text type="secondary">Progress: {progress}%</Text>
            <Button
              type="text"
              size="small"
              className={`expand-button ${expanded ? "expanded" : ""}`}
              icon={<CaretRightOutlined />}
              onClick={toggleExpand}
            />
          </div>
          <Progress
            percent={progress}
            size="small"
            status={getProgressStatus(progress)}
            showInfo={false}
          />
        </div>
      )}

      {expanded && hasSubtasks && (
        <div className="subtasks-container">
          <List
            size="small"
            dataSource={todo.subtasks}
            renderItem={(subtask, index) => (
              <List.Item className="subtask-item">
                <Checkbox
                  checked={subtask.completed}
                  onChange={(e) => handleSubtaskToggle(index, e.target.checked)}
                  disabled={!canEdit}
                >
                  <Text delete={subtask.completed}>{subtask.title}</Text>
                </Checkbox>
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};

export default Todo;
