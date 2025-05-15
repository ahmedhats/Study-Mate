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
} from "antd";
import { DeleteOutlined, CaretRightOutlined } from "@ant-design/icons";
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

  return (
    <List
      dataSource={Array.isArray(tasks) ? tasks : []}
      renderItem={(task) => {
        const progress = task.progress || calculateProgress(task);
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;

        return (
          <List.Item
            className="task-list-item"
            actions={[
              <Space>
                <Tag color={getPriorityColor(task.priority)}>
                  {(task.priority || "").toUpperCase()}
                </Tag>
                <Tag color={getStatusColor(task.status)}>
                  {formatStatus(task.status || "")}
                </Tag>
                <Popconfirm
                  title="Delete this task?"
                  description="Are you sure you want to delete this task?"
                  onConfirm={() => onDeleteTask(task._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
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
