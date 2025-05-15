import React, { useState, useEffect } from "react";
import { Card, message, Spin, notification } from "antd";
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
  }, []);

  const notifyUpcomingTasks = (tasks) => {
    const now = new Date();
    tasks.forEach((task) => {
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const diff = (due - now) / (1000 * 60 * 60 * 24); // days
        if (diff <= 1 && diff >= 0) {
          notification.warning({
            message: "Task Due Soon",
            description: `Task "${task.title}" is due in less than 1 day!`,
            duration: 5,
          });
        }
      }
    });
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getAllTasks();
      // Ensure each task has a progress field calculated from subtasks
      const tasksWithProgress = (response.data?.data || []).map((task) => {
        if (!task.progress && task.subtasks && task.subtasks.length > 0) {
          const totalSubtasks = task.subtasks.length;
          const completedSubtasks = task.subtasks.filter(
            (st) => st.completed
          ).length;
          task.progress = Math.round((completedSubtasks / totalSubtasks) * 100);
        }
        return task;
      });

      setTasks(tasksWithProgress);
      notifyUpcomingTasks(tasksWithProgress);
      // Update local storage backup on successful fetch
      localStorage.setItem("tasks_backup", JSON.stringify(tasksWithProgress));
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch tasks";
      message.error(errMsg);
      console.error("Tasks fetch error:", error);
      // Fallback: Load tasks from local storage backup
      const localTasks = JSON.parse(
        localStorage.getItem("tasks_backup") || "[]"
      );
      setTasks(localTasks);
      notifyUpcomingTasks(localTasks);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (values) => {
    try {
      // Ensure subtasks are properly formatted
      const subtasks = values.subtasks || [];

      const taskData = {
        ...values,
        dueDate: values.dueDate
          ? values.dueDate.format("YYYY-MM-DD")
          : undefined,
        completed: false,
        subtasks,
        progress: 0, // Initial progress is 0
      };

      // Calculate initial progress if there are completed subtasks
      if (subtasks.length > 0) {
        const completedSubtasks = subtasks.filter((st) => st.completed).length;
        taskData.progress = Math.round(
          (completedSubtasks / subtasks.length) * 100
        );
      }

      // Ensure required fields are present
      if (!taskData.title || !taskData.priority || !taskData.status) {
        message.error("Title, priority, and status are required.");
        return;
      }

      const response = await createTask(taskData);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Task creation failed");
      }
      websocketService.sendTaskUpdate(
        response.data.data._id,
        response.data.data
      );
      setIsModalVisible(false);
      message.success("Task added successfully");
      await fetchTasks();
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Failed to add task";
      message.error(errMsg);
      console.error("Task add error:", error);
      // Fallback: Add to local storage if backend is down
      if (
        !navigator.onLine ||
        errMsg.includes("Network") ||
        errMsg.includes("Failed to fetch")
      ) {
        const localTasks = JSON.parse(
          localStorage.getItem("tasks_backup") || "[]"
        );
        // Generate a temporary ID for offline task
        const tempId = `local-${Date.now()}`;
        const offlineTask = {
          ...values,
          _id: tempId,
          dueDate: values.dueDate
            ? values.dueDate.format("YYYY-MM-DD")
            : undefined,
          completed: false,
          subtasks: values.subtasks || [],
          progress: 0,
        };

        // Calculate progress if there are subtasks
        if (offlineTask.subtasks.length > 0) {
          const completedSubtasks = offlineTask.subtasks.filter(
            (st) => st.completed
          ).length;
          offlineTask.progress = Math.round(
            (completedSubtasks / offlineTask.subtasks.length) * 100
          );
        }

        localTasks.push(offlineTask);
        localStorage.setItem("tasks_backup", JSON.stringify(localTasks));
        setTasks([...tasks, offlineTask]);
        setIsModalVisible(false);
        message.success("Task saved locally (offline mode)");
      }
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        status: !task.completed ? "completed" : "todo",
      };

      // If the task is being marked as completed, mark all subtasks as completed too
      if (
        updatedTask.completed &&
        updatedTask.subtasks &&
        updatedTask.subtasks.length > 0
      ) {
        updatedTask.subtasks = updatedTask.subtasks.map((st) => ({
          ...st,
          completed: true,
        }));
        updatedTask.progress = 100;
      }
      // If the task is being unchecked, don't change subtasks
      else if (
        !updatedTask.completed &&
        updatedTask.subtasks &&
        updatedTask.subtasks.length > 0
      ) {
        // Recalculate progress
        const completedSubtasks = updatedTask.subtasks.filter(
          (st) => st.completed
        ).length;
        updatedTask.progress = Math.round(
          (completedSubtasks / updatedTask.subtasks.length) * 100
        );
      }

      try {
        await updateTask(taskId, updatedTask);
        websocketService.sendTaskUpdate(taskId, updatedTask);
        await fetchTasks();
      } catch (err) {
        // If backend fails, still update locally
        const newTasks = tasks.map((t) => (t._id === taskId ? updatedTask : t));
        setTasks(newTasks);
        localStorage.setItem("tasks_backup", JSON.stringify(newTasks));
        websocketService.sendTaskUpdate(taskId, updatedTask);
      }
    } catch (error) {
      message.error("Failed to update task");
    }
  };

  const handleUpdateTask = async (taskId, updatedTaskData) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        ...updatedTaskData,
      };

      try {
        await updateTask(taskId, updatedTask);
        websocketService.sendTaskUpdate(taskId, updatedTask);

        // Update local state without refetching from server
        const newTasks = tasks.map((t) => (t._id === taskId ? updatedTask : t));
        setTasks(newTasks);
        localStorage.setItem("tasks_backup", JSON.stringify(newTasks));
      } catch (err) {
        // If backend fails, still update locally
        const newTasks = tasks.map((t) => (t._id === taskId ? updatedTask : t));
        setTasks(newTasks);
        localStorage.setItem("tasks_backup", JSON.stringify(newTasks));
        websocketService.sendTaskUpdate(taskId, updatedTask);
      }
    } catch (error) {
      message.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      try {
        await deleteTask(taskId);
        websocketService.sendTaskUpdate(taskId, { deleted: true });
        await fetchTasks();
        message.success("Task deleted successfully");
        return;
      } catch (err) {
        // If backend fails, still delete locally
      }
      // Remove from UI and local storage if backend fails
      const newTasks = tasks.filter((t) => t._id !== taskId);
      setTasks(newTasks);
      localStorage.setItem("tasks_backup", JSON.stringify(newTasks));
      message.success("Task deleted locally (offline mode)");
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
          onUpdateTask={handleUpdateTask}
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
