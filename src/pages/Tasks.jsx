import React, { useState } from "react";
import { Card, message } from "antd";
import TaskModal from "../components/features/tasks/TaskModal";
import TaskHeader from "../components/features/tasks/TaskHeader";
import TaskList from "../components/features/tasks/TaskList";

const TasksPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleAddTask = (values) => {
    const formattedValues = {
      ...values,
      id: Date.now(),
      completed: false,
      dueDate: values.dueDate.format("YYYY-MM-DD"),
    };
    setTasks([...tasks, formattedValues]);
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

  return (
    <>
      <TaskHeader onAddTask={() => setIsModalVisible(true)} />
      <Card style={{ margin: "24px" }}>
        <TaskList tasks={tasks} onToggleCompletion={toggleTaskCompletion} />
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
