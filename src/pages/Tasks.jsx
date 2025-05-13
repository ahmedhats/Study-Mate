import React, { useState, useEffect } from "react";
import { Card, message, Spin } from "antd";
import TaskModal from "../components/features/tasks/TaskModal";
import TaskHeader from "../components/features/tasks/TaskHeader";
import TaskList from "../components/features/tasks/TaskList";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api/taskService";
import websocketService from "../services/websocket/websocketService";

const TasksPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to task updates
    const handleTaskUpdate = (data) => {
      setTasks((prevTasks) => {
        const taskIndex = prevTasks.findIndex(
          (task) => task._id === data.taskId
        );
        if (taskIndex !== -1) {
          const updatedTasks = [...prevTasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            ...data.update,
          };
          return updatedTasks;
        }
        return prevTasks;
      });
    };

    websocketService.subscribe("task_update", handleTaskUpdate);

    // Cleanup on unmount
    return () => {
      websocketService.unsubscribe("task_update", handleTaskUpdate);
      websocketService.disconnect();
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getAllTasks();
      setTasks(response.data || []);
    } catch (error) {
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (values) => {
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        completed: false,
      };

      const response = await createTask(taskData);
      const newTask = response.data;

      // Notify other users about the new task
      websocketService.sendTaskUpdate(newTask._id, newTask);

      setTasks([...tasks, newTask]);
      setIsModalVisible(false);
      message.success("Task added successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add task");
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
      };

      const response = await updateTask(taskId, updatedTask);

      // Notify other users about the task update
      websocketService.sendTaskUpdate(taskId, updatedTask);

      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
    } catch (error) {
      message.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);

      // Notify other users about the task deletion
      websocketService.sendTaskUpdate(taskId, { deleted: true });

      setTasks(tasks.filter((t) => t._id !== taskId));
      message.success("Task deleted successfully");
    } catch (error) {
      message.error("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <TaskHeader onAddTask={() => setIsModalVisible(true)} />
      <Card style={{ margin: "24px" }}>
        <TaskList
          tasks={tasks}
          onToggleCompletion={toggleTaskCompletion}
          onDeleteTask={handleDeleteTask}
        />
      </Card>

      <TaskModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleAddTask}
      />
    </>
  );
};

export default TasksPage;
