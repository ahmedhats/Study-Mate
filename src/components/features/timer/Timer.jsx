import React, { useState, useEffect } from "react";
import { Card, Button, Progress, Space, Typography, Modal } from "antd";
import {
  ClockCircleOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Timer = ({ onComplete }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [goalTime, setGoalTime] = useState(25 * 60); // 25 minutes in seconds
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [breakTime, setBreakTime] = useState(5 * 60); // 5 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time + 1 >= goalTime) {
            setIsActive(false);
            if (!isBreak) {
              setIsBreak(true);
              setTime(0);
              setGoalTime(breakTime);
              setIsActive(true);
            } else {
              setIsBreak(false);
              setTime(0);
              setGoalTime(25 * 60);
              onComplete?.();
            }
            return 0;
          }
          return time + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, goalTime, isBreak, breakTime, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTime(0);
    setIsActive(false);
    setIsBreak(false);
    setGoalTime(25 * 60);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((time / goalTime) * 100, 100);

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <Text>{isBreak ? "Break Time" : "Study Time"}</Text>
        </Space>
      }
      extra={
        <Button
          icon={<SettingOutlined />}
          onClick={() => setIsSettingsVisible(true)}
        />
      }
    >
      <div style={{ textAlign: "center" }}>
        <Progress
          type="circle"
          percent={progress}
          format={() => (
            <div style={{ fontSize: "24px" }}>{formatTime(time)}</div>
          )}
          size={200}
        />

        <Space style={{ marginTop: "24px" }}>
          <Button
            type="primary"
            size="large"
            icon={isActive ? <PauseOutlined /> : <PlayCircleOutlined />}
            onClick={toggleTimer}
          >
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button size="large" onClick={resetTimer}>
            Reset
          </Button>
        </Space>
      </div>

      <Modal
        title="Timer Settings"
        open={isSettingsVisible}
        onCancel={() => setIsSettingsVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text>Study Duration (minutes)</Text>
            <input
              type="number"
              min="1"
              max="120"
              value={Math.floor(goalTime / 60)}
              onChange={(e) => setGoalTime(parseInt(e.target.value) * 60)}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>
          <div>
            <Text>Break Duration (minutes)</Text>
            <input
              type="number"
              min="1"
              max="30"
              value={Math.floor(breakTime / 60)}
              onChange={(e) => setBreakTime(parseInt(e.target.value) * 60)}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>
          <Button
            type="primary"
            onClick={() => setIsSettingsVisible(false)}
            style={{ width: "100%" }}
          >
            Save Settings
          </Button>
        </Space>
      </Modal>
    </Card>
  );
};

export default Timer;
