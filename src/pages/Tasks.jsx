import React, { useState, useEffect } from "react";
import {
  Card,
  message,
  Spin,
  notification,
  Select,
  Row,
  Col,
  Input,
  Radio,
  Button,
  Tabs,
} from "antd";
import { CalendarOutlined, RobotOutlined, OrderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import TaskModal from "../components/features/tasks/TaskModal";
import TaskHeader from "../components/features/tasks/TaskHeader";
import TaskList from "../components/features/tasks/TaskList";
import TodoList from "../components/features/tasks/TodoList";
import AIAssistant from "../components/features/tasks/AIAssistant";
import TaskManager from '../components/features/tasks/TaskManager';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api/taskService";
import { getAllUsers } from "../services/api/userService";
import websocketService from "../services/websocket/websocketService";
import "./Tasks.css";

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const TasksPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("classic"); // 'classic' or 'todo'

  // Filtering state
  const [importanceFilter, setImportanceFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("dueDate"); // Default sort by due date

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    // Get current user data from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.user) {
        setCurrentUser(userData.user);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
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

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
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
      setEditingTask(null);
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
        setEditingTask(null);
        message.success("Task saved locally (offline mode)");
      }
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      // First find the task in our local state
      const task = tasks.find((t) => t._id === taskId);
      if (!task) {
        console.error(`Task with ID ${taskId} not found`);
        return;
      }

      console.log(
        `Found task to toggle: ${task.title} (${task._id}), current status: ${task.status}`
      );

      // Determine the new status (toggle between "completed" and previous state)
      const isCurrentlyCompleted = task.status === "completed";
      const newStatus = isCurrentlyCompleted ? "todo" : "completed";

      console.log(`Changing status from ${task.status} to ${newStatus}`);

      // Create a copy of the task with updated status
      const updatedTask = {
        ...task,
        status: newStatus,
      };

      // Handle subtasks based on the new main task status
      if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
        if (newStatus === "completed") {
          // If marking task as completed, mark all subtasks as completed
          updatedTask.subtasks = updatedTask.subtasks.map((st) => ({
            ...st,
            completed: true,
          }));
          updatedTask.progress = 100;
          console.log("Marking all subtasks as completed");
        } else {
          // If unmarking task, leave subtasks as they are but recalculate progress
          const completedSubtasks = updatedTask.subtasks.filter(
            (st) => st.completed
          ).length;
          updatedTask.progress = Math.round(
            (completedSubtasks / updatedTask.subtasks.length) * 100
          );
          console.log(
            `Keeping subtask states, progress: ${updatedTask.progress}%`
          );
        }
      }

      // Update local state immediately for better UI feedback
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? updatedTask : t))
      );

      try {
        // Send update to server
        console.log("Sending update to server:", updatedTask);
        const response = await updateTask(taskId, updatedTask);
        websocketService.sendTaskUpdate(taskId, updatedTask);
        console.log("Server update successful:", response);

        // No need to refresh all tasks - we've already updated our local state
      } catch (err) {
        console.error("Error updating task on server:", err);
        // We've already updated the local state, so the UI reflects the change
        // Also update backup in localStorage
        localStorage.setItem(
          "tasks_backup",
          JSON.stringify(tasks.map((t) => (t._id === taskId ? updatedTask : t)))
        );
      }
    } catch (error) {
      console.error("Error in toggleTaskCompletion:", error);
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

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleTaskModalCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  // Update subtask completion
  const handleUpdateSubtask = (taskId, subtaskIndex, checked) => {
    try {
      console.log(
        `Updating subtask ${subtaskIndex} of task ${taskId} to ${
          checked ? "completed" : "uncompleted"
        }`
      );

      // Find the task in our state
      const task = tasks.find((t) => t._id === taskId);
      if (!task || !task.subtasks) {
        console.error(`Task with ID ${taskId} not found or has no subtasks`);
        return;
      }

      // Clone the task and subtasks to avoid mutating state directly
      const updatedTask = { ...task };
      const updatedSubtasks = [...task.subtasks];

      // Update the specific subtask's completion status
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        completed: checked,
      };

      // Calculate new progress based on subtasks
      const totalSubtasks = updatedSubtasks.length;
      const completedSubtasks = updatedSubtasks.filter(
        (st) => st.completed
      ).length;
      const progress = totalSubtasks
        ? Math.round((completedSubtasks / totalSubtasks) * 100)
        : 0;

      console.log(
        `New progress: ${progress}% (${completedSubtasks}/${totalSubtasks} subtasks completed)`
      );

      // Determine the appropriate task status based on subtasks
      let newStatus = task.status;

      if (completedSubtasks === 0) {
        newStatus = "todo";
      } else if (completedSubtasks === totalSubtasks) {
        newStatus = "completed";
      } else if (completedSubtasks > 0 && completedSubtasks < totalSubtasks) {
        newStatus = "in_progress";
      }

      console.log(`Updating task status from ${task.status} to ${newStatus}`);

      // Create the fully updated task object
      updatedTask.subtasks = updatedSubtasks;
      updatedTask.progress = progress;
      updatedTask.status = newStatus;

      // Update UI immediately for better user experience
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? updatedTask : t))
      );

      // Then update on the server
      try {
        console.log("Sending updated task to server:", updatedTask);
        updateTask(taskId, updatedTask)
          .then((response) =>
            console.log("Server update successful:", response)
          )
          .catch((error) => console.error("Server update failed:", error));

        websocketService.sendTaskUpdate(taskId, updatedTask);
      } catch (error) {
        console.error("Error updating task on server:", error);
        // Update local storage for offline support
        localStorage.setItem(
          "tasks_backup",
          JSON.stringify(tasks.map((t) => (t._id === taskId ? updatedTask : t)))
        );
      }
    } catch (error) {
      console.error("Error in handleUpdateSubtask:", error);
      message.error("Failed to update subtask");
    }
  };

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];

    // Apply importance filter
    if (importanceFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.importance === importanceFilter
      );
    }

    // Apply priority filter
    if (priorityFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityFilter
      );
    }

    // Apply status filter
    if (statusFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === statusFilter
      );
    }

    // Apply search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          // Sort by due date (ascending)
          return (
            new Date(a.dueDate || "9999-12-31") -
            new Date(b.dueDate || "9999-12-31")
          );
        case "importance":
          // Sort by importance (critical > important > normal > optional)
          const importanceOrder = {
            critical: 0,
            important: 1,
            normal: 2,
            optional: 3,
          };
          return (
            (importanceOrder[a.importance || "normal"] || 2) -
            (importanceOrder[b.importance || "normal"] || 2)
          );
        case "priority":
          // Sort by priority (urgent > high > medium > low)
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (
            (priorityOrder[a.priority || "medium"] || 2) -
            (priorityOrder[b.priority || "medium"] || 2)
          );
        default:
          return 0;
      }
    });

    return filteredTasks;
  };

  // Function to navigate to calendar view
  const goToCalendarView = () => {
    navigate("/calendar");
  };

  // Handle tab change
  const handleViewChange = (key) => {
    setActiveView(key);
  };

  // Handle adding a new task
  const handleAddNewTask = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleAICreateTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Task creation failed");
      }
      websocketService.sendTaskUpdate(
        response.data.data._id,
        response.data.data
      );
      message.success("Task added successfully");
      await fetchTasks();
    } catch (error) {
      message.error("Failed to create task: " + error.message);
      console.error("Error creating task:", error);
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
      <TaskHeader onAddTask={handleAddNewTask} />

      <Card style={{ margin: "24px" }} className="tasks-card">
        <Tabs
          activeKey={activeView}
          onChange={handleViewChange}
          type="card"
          size="large"
          style={{ marginBottom: "16px" }}
        >
          <TabPane tab="Classic View" key="classic">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8} lg={5}>
                <Search
                  placeholder="Search tasks"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "100%" }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <Select
                  placeholder="Filter by importance"
                  style={{ width: "100%" }}
                  value={importanceFilter}
                  onChange={setImportanceFilter}
                  allowClear
                >
                  <Option value="critical">Critical</Option>
                  <Option value="important">Important</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="optional">Optional</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <Select
                  placeholder="Filter by priority"
                  style={{ width: "100%" }}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  allowClear
                >
                  <Option value="urgent">Urgent</Option>
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <Select
                  placeholder="Filter by status"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                >
                  <Option value="todo">To Do</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={goToCalendarView}
                  style={{ width: "100%" }}
                >
                  Calendar View
                </Button>
              </Col>
              <Col xs={24}>
                <Radio.Group
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <Radio.Button value="dueDate">Sort by Due Date</Radio.Button>
                  <Radio.Button value="importance">Sort by Importance</Radio.Button>
                  <Radio.Button value="priority">Sort by Priority</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>

            <TaskList
              tasks={getFilteredTasks()}
              onToggleCompletion={toggleTaskCompletion}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onEditTask={handleOpenEditTask}
              currentUser={currentUser}
            />
          </TabPane>

          <TabPane tab="Todo View" key="todo">
            <TodoList
              todos={tasks}
              loading={loading}
              onToggleCompletion={toggleTaskCompletion}
              onDeleteTodo={handleDeleteTask}
              onEditTodo={handleOpenEditTask}
              onUpdateSubtask={handleUpdateSubtask}
              onAddNewTodo={handleAddNewTask}
              currentUser={currentUser}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <OrderedListOutlined />
                Tasks
              </span>
            }
            key="tasks"
          >
            <div style={{ marginBottom: 24 }}>
              <TaskManager tasks={tasks} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RobotOutlined />
                AI Assistant
              </span>
            }
            key="ai"
          >
            <AIAssistant onCreateTask={handleAICreateTask} />
          </TabPane>
        </Tabs>
      </Card>

      <TaskModal
        open={isModalVisible}
        onCancel={handleTaskModalCancel}
        onSubmit={handleAddTask}
        editingTask={editingTask}
        users={users}
      />
    </>
  );
};

export default TasksPage;
