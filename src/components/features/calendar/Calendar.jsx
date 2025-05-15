import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { message, Modal, Tag, Spin, Empty, Alert, Button } from "antd";
import {
  getAllTasks,
  updateTask,
  createTask,
} from "../../../services/api/taskService";
import { getAllUsers } from "../../../services/api/userService";
import TaskModal from "../tasks/TaskModal";

// Remove the problematic CSS imports
// FullCalendar automatically includes necessary styles

const getPriorityColor = (priority) => {
  const colors = {
    urgent: "#f5222d",
    high: "#fa8c16",
    medium: "#1890ff",
    low: "#52c41a",
  };
  return colors[priority] || "#1890ff";
};

const getImportanceBackground = (importance) => {
  const colors = {
    critical: "#fff1f0",
    important: "#fff7e6",
    normal: "#e6f7ff",
    optional: "#f6ffed",
  };
  return colors[importance] || "#e6f7ff";
};

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTasks();
      if (response.data && response.data.success) {
        setTasks(response.data.data || []);
      } else {
        setError("Failed to load tasks. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(
        "Error loading tasks. Please check your connection and try again."
      );
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    }
  };

  // Convert tasks to calendar events
  const getEvents = () => {
    return tasks.map((task) => ({
      id: task._id,
      title: task.title,
      start: task.dueDate,
      end: task.dueDate,
      allDay: true,
      backgroundColor: getPriorityColor(task.priority),
      borderColor: getPriorityColor(task.priority),
      textColor: "#ffffff",
      extendedProps: {
        description: task.description,
        priority: task.priority,
        importance: task.importance,
        status: task.status,
        taskData: task,
      },
    }));
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalVisible(true);
  };

  const handleEventModalClose = () => {
    setSelectedEvent(null);
    setIsModalVisible(false);
  };

  const handleDateClick = (info) => {
    // Pre-populate a new task with the selected date
    setEditingTask({
      dueDate: info.dateStr,
      priority: "medium",
      importance: "normal",
      status: "todo",
    });
    setIsTaskModalVisible(true);
  };

  const handleEditTask = () => {
    if (selectedEvent) {
      setEditingTask(selectedEvent.extendedProps.taskData);
      setIsTaskModalVisible(true);
      setIsModalVisible(false);
    }
  };

  const handleTaskModalCancel = () => {
    setIsTaskModalVisible(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingTask && editingTask._id) {
        // Updating existing task
        await updateTask(editingTask._id, values);
        message.success("Task updated successfully");
      } else {
        // Creating new task
        await createTask(values);
        message.success("Task created successfully");
      }
      setIsTaskModalVisible(false);
      // Refresh calendar after task update
      await fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div
        className="calendar-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <Spin size="large" tip="Loading calendar..." />
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="calendar-container">
        <Alert
          message="Error Loading Calendar"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchTasks}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <div className="calendar-container">
        <Empty
          description="No tasks found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>Click anywhere on the calendar to add a task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={getEvents()}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: "short",
        }}
        dayMaxEvents={3}
        nowIndicator={true}
      />

      {/* Task Detail Modal */}
      <Modal
        title={selectedEvent?.title || "Task Details"}
        open={isModalVisible}
        onCancel={handleEventModalClose}
        footer={[
          <button
            key="edit"
            className="ant-btn ant-btn-primary"
            onClick={handleEditTask}
          >
            Edit Task
          </button>,
          <button
            key="close"
            className="ant-btn"
            onClick={handleEventModalClose}
          >
            Close
          </button>,
        ]}
      >
        {selectedEvent && (
          <div>
            <p>
              <strong>Description:</strong>{" "}
              {selectedEvent.extendedProps.description || "No description"}
            </p>
            <p>
              <strong>Priority:</strong>{" "}
              <Tag
                color={getPriorityColor(selectedEvent.extendedProps.priority)}
              >
                {selectedEvent.extendedProps.priority?.toUpperCase() ||
                  "MEDIUM"}
              </Tag>
            </p>
            <p>
              <strong>Importance:</strong>{" "}
              <Tag
                color={getImportanceBackground(
                  selectedEvent.extendedProps.importance
                )}
              >
                {selectedEvent.extendedProps.importance?.toUpperCase() ||
                  "NORMAL"}
              </Tag>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag>
                {selectedEvent.extendedProps.status
                  ?.toUpperCase()
                  .replace("_", " ") || "TODO"}
              </Tag>
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedEvent.start).toLocaleDateString()}
            </p>
            {selectedEvent.extendedProps.taskData.teamMembers?.length > 0 && (
              <p>
                <strong>Team Members:</strong>{" "}
                {selectedEvent.extendedProps.taskData.teamMembers.map(
                  (member, index) => (
                    <Tag key={index}>
                      {member.user?.name || "User"} ({member.permissions})
                    </Tag>
                  )
                )}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Task Edit Modal */}
      <TaskModal
        open={isTaskModalVisible}
        onCancel={handleTaskModalCancel}
        onSubmit={handleTaskSubmit}
        editingTask={editingTask}
        users={users}
      />
    </div>
  );
};

export default Calendar;
