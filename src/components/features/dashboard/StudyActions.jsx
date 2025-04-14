import React from "react";
import { Card, Button } from "antd";
import {
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const StudyActions = ({ focusTime, streak, newMatches }) => {
  const navigate = useNavigate();

  return (
    <div className="study-actions">
      <Card className="action-card">
        <div className="action-icon">
          <ClockCircleOutlined />
        </div>
        <h3>Today's Focus Time</h3>
        <p>
          {focusTime.current} / {focusTime.goal}
        </p>
        <Button type="primary" onClick={() => navigate("/timer")}>
          Start Timer
        </Button>
      </Card>

      <Card className="action-card">
        <div className="action-icon">
          <TrophyOutlined />
        </div>
        <h3>Current Streak</h3>
        <p>{streak} Days</p>
        <Button type="primary" onClick={() => navigate("/stats")}>
          View Stats
        </Button>
      </Card>

      <Card className="action-card">
        <div className="action-icon">
          <TeamOutlined />
        </div>
        <h3>Study Partners</h3>
        <p>{newMatches} New Matches</p>
        <Button type="primary" onClick={() => navigate("/study-group")}>
          Join Session
        </Button>
      </Card>
    </div>
  );
};

export default StudyActions;
