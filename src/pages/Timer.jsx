import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Progress,
  Space,
  Radio,
  InputNumber,
  Typography,
} from "antd";
import {
  PlayCircleOutlined,
  PauseOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import "../styles/Timer.css";

// Only import notificationSound if it exists, otherwise fallback
let notificationSound;
try {
  notificationSound = require("../assets/notification.mp3");
} catch (e) {
  notificationSound = null;
}

const { Title, Text } = Typography;

const Timer = () => {
  const [mode, setMode] = useState("pomodoro");
  const [time, setTime] = useState(25 * 60); // 25 minutes for Pomodoro
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);

  // Pomodoro settings
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [isBreak, setIsBreak] = useState(false);

  const audioRef = React.useRef(null);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            if (mode === "pomodoro") {
              if (!isBreak) {
                setIsBreak(true);
                setTime(breakTime * 60);
                setTimeout(() => {
                  if (audioRef.current) audioRef.current.play();
                }, 100);
                return breakTime * 60;
              } else {
                setIsBreak(false);
                setTime(workTime * 60);
                setTimeout(() => {
                  if (audioRef.current) audioRef.current.play();
                }, 100);
                return workTime * 60;
              }
            }
            setIsActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, time, mode, isBreak, workTime, breakTime]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "pomodoro") {
      setTime(workTime * 60);
      setIsBreak(false);
    } else {
      setTime(customTime * 60);
    }
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    setIsActive(false);
    if (e.target.value === "pomodoro") {
      setTime(workTime * 60);
      setIsBreak(false);
    } else {
      setTime(customTime * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="timer-container">
      {notificationSound && (
        <audio ref={audioRef} src={notificationSound} preload="auto" />
      )}
      <Card className="timer-card">
        <Title level={2}>
          {mode === "pomodoro" ? "Pomodoro Timer" : "Custom Timer"}
        </Title>

        <Radio.Group
          value={mode}
          onChange={handleModeChange}
          className="timer-mode"
        >
          <Radio.Button value="pomodoro">Pomodoro</Radio.Button>
          <Radio.Button value="custom">Custom Timer</Radio.Button>
        </Radio.Group>

        {mode === "pomodoro" && (
          <div className="timer-settings">
            <Space>
              <div>
                <Text>Work Time (min)</Text>
                <InputNumber
                  min={1}
                  max={60}
                  value={workTime}
                  onChange={(value) => setWorkTime(value)}
                />
              </div>
              <div>
                <Text>Break Time (min)</Text>
                <InputNumber
                  min={1}
                  max={30}
                  value={breakTime}
                  onChange={(value) => setBreakTime(value)}
                />
              </div>
            </Space>
          </div>
        )}

        {mode === "custom" && (
          <div className="timer-settings">
            <Text>Timer Duration (min)</Text>
            <InputNumber
              min={1}
              max={120}
              value={customTime}
              onChange={(value) => {
                setCustomTime(value);
                setTime(value * 60);
              }}
            />
          </div>
        )}

        <div className="timer-display">
          <Progress
            type="circle"
            percent={
              mode === "pomodoro"
                ? (((isBreak ? breakTime * 60 : workTime * 60) - time) /
                    (isBreak ? breakTime * 60 : workTime * 60)) *
                  100
                : ((customTime * 60 - time) / (customTime * 60)) * 100
            }
            format={() => (
              <div className="timer-text">
                <Text>{formatTime(time)}</Text>
                <Text type="secondary">
                  {isBreak ? "Break Time" : "Work Time"}
                </Text>
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
          <Button size="large" icon={<RedoOutlined />} onClick={resetTimer}>
            Reset
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Timer;
