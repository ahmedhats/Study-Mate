import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { message, Modal, Tag, Spin, Empty, Alert, Button, List, Checkbox } from "antd";
import {
  getAllTasks,
  updateTask,
  createTask,
  deleteTask,
} from "../../../services/api/taskService";
import { getAllUsers } from "../../../services/api/userService";
import TaskModal from "../tasks/TaskModal";
import { ExclamationCircleOutlined } from "@ant-design/icons";

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
      console.log("Fetch tasks response:", response);
      
      if (response.data && response.data.success) {
        const tasks = response.data.data || [];
        console.log("Fetched tasks:", tasks);
        setTasks(tasks);
      } else if (response.error) {
        console.error("Fetch tasks error:", response.error);
        setError(response.error);
        message.error(response.error);
      } else {
        console.error("Fetch tasks failed:", response);
        setError("Failed to load tasks. Please try again later.");
        message.error("Failed to load tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Error loading tasks. Please check your connection and try again.");
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
    const events = tasks.map((task) => {
      console.log("Converting task to event:", task);
      // Ensure task._id exists and is converted to string
      const taskId = task._id ? task._id.toString() : null;
      if (!taskId) {
        console.error("Task is missing ID:", task);
        return null;
      }

      return {
        id: taskId,
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
          taskId: taskId, // Add taskId directly to extendedProps for easier access
          taskData: task,
        },
      };
    }).filter(Boolean); // Remove any null events
    console.log("Generated calendar events:", events);
    return events;
  };

  const handleEventClick = (info) => {
    console.log("Event clicked:", info.event);
    console.log("Event data:", info.event.extendedProps);
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
      let response;
      
      if (editingTask && editingTask._id) {
        // Updating existing task
        response = await updateTask(editingTask._id, values);
      } else {
        // Creating new task
        response = await createTask(values);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && response.data.success) {
        message.success(editingTask ? "Task updated successfully" : "Task created successfully");
        setIsTaskModalVisible(false);
        setEditingTask(null);
        // Refresh calendar after task update
        await fetchTasks();
      } else {
        throw new Error("Failed to save task");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      message.error(error.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      console.log("Selected Event Full:", selectedEvent);
      console.log("Selected Event Props:", selectedEvent?.extendedProps);
      console.log("Task Data:", selectedEvent?.extendedProps?.taskData);
      
      // Try to get taskId from multiple possible locations
      const taskId = selectedEvent?.extendedProps?.taskId || 
                    selectedEvent?.extendedProps?.taskData?._id?.toString() || 
                    selectedEvent?.id;
                    
      console.log("Task ID to delete:", taskId);

      if (!taskId) {
        console.error("Missing task ID:", {
          selectedEvent: selectedEvent,
          extendedProps: selectedEvent?.extendedProps,
          taskData: selectedEvent?.extendedProps?.taskData,
          eventId: selectedEvent?.id
        });
        message.error("Invalid task selected");
        return;
      }

      Modal.confirm({
        title: "Delete Task",
        icon: <ExclamationCircleOutlined />,
        content: "Are you sure you want to delete this task?",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            setLoading(true);
            console.log("Attempting to delete task with ID:", taskId);
            
            const response = await deleteTask(taskId);
            console.log("Delete API Response:", response);

            if (response.error) {
              console.error("Delete API Error:", response.error);
              throw new Error(response.error);
            }

            // Immediately close the modal
            setIsModalVisible(false);
            
            // Clear the selected event
            setSelectedEvent(null);

            // Update local state to remove the task
            setTasks(prevTasks => {
              const newTasks = prevTasks.filter(task => task._id !== taskId);
              console.log("Updated tasks after deletion:", newTasks);
              return newTasks;
            });

            message.success("Task deleted successfully");

            // Force a refresh of the calendar events
            const calendarApi = document.querySelector('.calendar-container .fc')._calendar;
            if (calendarApi) {
              calendarApi.refetchEvents();
            }

            // Finally refresh from server
            await fetchTasks();
          } catch (error) {
            console.error("Error in delete operation:", error);
            message.error(error.message || "Failed to delete task");
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      message.error(error.message || "Failed to delete task");
    }
  };

  const handleSubtaskChange = async (taskId, subtaskIndex, checked) => {
    try {
      if (!selectedEvent?.extendedProps?.taskData?._id) {
        message.error("Invalid task selected");
        return;
      }
      
      const taskData = selectedEvent.extendedProps.taskData;
      const updatedSubtasks = [...taskData.subtasks];
      updatedSubtasks[subtaskIndex].completed = checked;
      
      const response = await updateTask(taskData._id, {
        ...taskData,
        subtasks: updatedSubtasks,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the local state
      const updatedEvent = {
        ...selectedEvent,
        extendedProps: {
          ...selectedEvent.extendedProps,
          taskData: {
            ...taskData,
            subtasks: updatedSubtasks,
          },
        },
      };
      setSelectedEvent(updatedEvent);
      
      // Refresh tasks to update the calendar
      await fetchTasks();
    } catch (error) {
      console.error("Error updating subtask:", error);
      message.error(error.message || "Failed to update subtask");
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

  if (error) {
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

  return (
    <div className="calendar-container">
      {tasks.length === 0 && !loading && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Empty
            description="No tasks found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <p>Click anywhere on the calendar to add a task</p>
        </div>
      )}
      
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
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              console.log("Edit button clicked");
              handleEditTask();
            }}
          >
            Edit Task
          </Button>,
          <Button
            key="close"
            onClick={() => {
              console.log("Close button clicked");
              handleEventModalClose();
            }}
          >
            Close
          </Button>,
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
              <Tag color={getPriorityColor(selectedEvent.extendedProps.priority)}>
                {selectedEvent.extendedProps.priority?.toUpperCase() || "MEDIUM"}
              </Tag>
            </p>
            <p>
              <strong>Importance:</strong>{" "}
              <Tag
                color={getImportanceBackground(
                  selectedEvent.extendedProps.importance
                )}
              >
                {selectedEvent.extendedProps.importance?.toUpperCase() || "NORMAL"}
              </Tag>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag>
                {selectedEvent.extendedProps.status?.toUpperCase().replace("_", " ") || "TODO"}
              </Tag>
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedEvent.start).toLocaleDateString()}
            </p>
            
            {/* Subtasks Section */}
            {selectedEvent.extendedProps.taskData.subtasks?.length > 0 && (
              <div>
                <strong>Subtasks:</strong>
                <List
                  size="small"
                  dataSource={selectedEvent.extendedProps.taskData.subtasks}
                  renderItem={(subtask, index) => (
                    <List.Item>
                      <Checkbox
                        checked={subtask.completed}
                        onChange={(e) =>
                          handleSubtaskChange(
                            selectedEvent.extendedProps.taskData._id,
                            index,
                            e.target.checked
                          )
                        }
                      >
                        {subtask.title}
                      </Checkbox>
                    </List.Item>
                  )}
                />
              </div>
            )}
            
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
