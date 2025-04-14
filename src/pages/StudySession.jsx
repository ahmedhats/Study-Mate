import React, { useState, useEffect } from "react";
import { Card, Button, Progress, Space, Typography } from "antd";
import {
  ClockCircleOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "./StudySession.css";

const { Title, Text } = Typography;

const StudySession = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [goalTime] = useState(4 * 60 * 60); // 4 hours in seconds

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const progress = Math.min((time / goalTime) * 100, 100);

  return (
    <div className="study-session-container">
      <Card className="study-session-card">
        <Title level={2}>Study Session</Title>

        <div className="timer-display">
          <Progress
            type="circle"
            percent={progress}
            format={() => (
              <div className="timer-text">
                <ClockCircleOutlined />
                <Text>{formatTime(time)}</Text>
              </div>
            )}
            size={200}
          />
        </div>

        <Space className="timer-controls">
          <Button
            type="primary"
            size="large"
            icon={isActive ? <PauseOutlined /> : <PlayCircleOutlined />}
            onClick={toggleTimer}
          >
            {isActive ? "Pause" : "Start"}
          </Button>
        </Space>

        <div className="session-info">
          <Text>Daily Goal: {formatTime(goalTime)}</Text>
          <Text>Progress: {Math.round(progress)}%</Text>
        </div>
      </Card>
    </div>
  );
};

export default StudySession;
