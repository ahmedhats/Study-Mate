import React from "react";
import { List, Checkbox, Tag } from "antd";
import { getPriorityColor } from "./utils";

const TaskList = ({ tasks, onToggleCompletion }) => {
  return (
    <List
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item
          actions={[
            <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>,
            <Tag>{task.dueDate}</Tag>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Checkbox
                checked={task.completed}
                onChange={() => onToggleCompletion(task.id)}
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
  );
};

export default TaskList;
