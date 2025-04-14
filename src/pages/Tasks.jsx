import React, { useState } from "react";
import {
  Typography,
  List,
  Card,
  Checkbox,
  Tag,
  Space,
  Button,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TaskModal from "../components/TaskModal";

const { Title } = Typography;

const TasksPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleAddTask = (values) => {
    setTasks([...tasks, { ...values, id: Date.now(), completed: false }]);
    setIsModalVisible(false);
    message.success("Task added successfully");
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority] || "blue";
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          My Tasks
        </Title>
      </div>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Tasks</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Add Task
            </Button>
          </div>
        }
        style={{ margin: "24px" }}
      >
        <List
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Tag color={getPriorityColor(task.priority)}>
                  {task.priority}
                </Tag>,
                <Tag>{task.dueDate}</Tag>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                }
                title={
                  <span
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </span>
                }
                description={task.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <TaskModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleAddTask}
      />
    </>
  );
};

export default TasksPage;
