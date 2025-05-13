import React from "react";
import {
  List,
  Checkbox,
  Typography,
  Button,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

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

const TaskList = ({ tasks, onToggleCompletion, onDeleteTask }) => {
  return (
    <List
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item
          actions={[
            <Space>
              <Tag color={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Tag>
              <Tag color={getStatusColor(task.status)}>
                {formatStatus(task.status)}
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
          <List.Item.Meta
            avatar={
              <Checkbox
                checked={task.status === "completed"}
                onChange={() => onToggleCompletion(task._id)}
              />
            }
            title={
              <Text delete={task.status === "completed"}>{task.title}</Text>
            }
            description={
              <div>
                <Text type="secondary">{task.description}</Text>
                <br />
                <Text type="secondary">
                  Due: {dayjs(task.dueDate).format("MMMM D, YYYY")}
                </Text>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default TaskList;
