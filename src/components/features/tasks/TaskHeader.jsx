import React from "react";
import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TaskHeader = ({ onAddTask }) => {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          My Tasks
        </Title>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Tasks</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddTask}>
          Add Task
        </Button>
      </div>
    </>
  );
};

export default TaskHeader;
