import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const StudyStats = ({ userData }) => {
  const stats = {
    totalHours: userData?.statistics?.totalHours || 0,
    completedTasks: userData?.statistics?.completedTasks || 0,
    studyStreak: userData?.statistics?.studyStreak || 0,
    weeklyGoal: userData?.statistics?.weeklyGoal || userData?.productivity?.weeklyGoal || 20,
  };

  const weeklyGoalPercentage = stats.weeklyGoal 
    ? Math.min((stats.totalHours / stats.weeklyGoal) * 100, 100) 
    : 0;

  return (
    <Card
      className="study-stats-card content-card"
      title="Study Statistics"
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Total Study Hours"
              value={stats.totalHours}
              prefix={<ClockCircleOutlined />}
              suffix="hrs"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Completed Tasks"
              value={stats.completedTasks}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Study Streak"
              value={stats.studyStreak}
              prefix={<TrophyOutlined />}
              suffix="days"
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <Progress
          percent={weeklyGoalPercentage}
          status="active"
          format={(percent) => `${Math.round(percent)}% of weekly goal`}
        />
      </div>
    </Card>
  );
};

export default StudyStats;
