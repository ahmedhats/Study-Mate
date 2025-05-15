import React from "react";
import { Card, Typography, Button, Space } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/features/calendar/Calendar";
import "../components/features/calendar/Calendar.css";

const { Title } = Typography;

const CalendarPage = () => {
  const navigate = useNavigate();

  const goToTaskListView = () => {
    navigate("/tasks");
  };

  return (
    <div className="calendar-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Task Calendar
        </Title>
        <Button
          type="primary"
          icon={<UnorderedListOutlined />}
          onClick={goToTaskListView}
        >
          List View
        </Button>
      </div>
      <Card style={{ margin: "0 24px 24px" }}>
        <Calendar />
      </Card>
    </div>
  );
};

export default CalendarPage;
