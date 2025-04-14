import React from "react";
import { Card, Row, Col, Progress, Typography } from "antd";
import {
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import StudyStats from "../components/features/dashboard/StudyStats";
import "./Stats.css";

const { Title, Text } = Typography;

const Stats = () => {
  const mockData = {
    studyStats: {
      totalHours: 45,
      completedTasks: 12,
      studyStreak: 5,
      weeklyGoal: 20,
    },
    weeklyProgress: 75,
    monthlyStats: {
      totalSessions: 28,
      averageSessionLength: 95, // in minutes
      completionRate: 85,
    },
  };

  return (
    <div className="stats-container">
      <Title level={2}>Study Statistics</Title>

      <StudyStats userData={{ studyStats: mockData.studyStats }} />

      <Row gutter={[24, 24]} className="detailed-stats">
        <Col xs={24} md={12}>
          <Card title="Weekly Progress">
            <Progress
              type="dashboard"
              percent={mockData.weeklyProgress}
              format={(percent) => `${percent}%`}
            />
            <Text className="stat-description">
              {mockData.weeklyProgress}% of weekly goal completed
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Monthly Overview">
            <div className="monthly-stats">
              <div className="stat-item">
                <ClockCircleOutlined className="stat-icon" />
                <div className="stat-content">
                  <Text>Total Sessions</Text>
                  <Title level={4}>{mockData.monthlyStats.totalSessions}</Title>
                </div>
              </div>

              <div className="stat-item">
                <TrophyOutlined className="stat-icon" />
                <div className="stat-content">
                  <Text>Average Session Length</Text>
                  <Title level={4}>
                    {Math.round(mockData.monthlyStats.averageSessionLength)} min
                  </Title>
                </div>
              </div>

              <div className="stat-item">
                <CheckCircleOutlined className="stat-icon" />
                <div className="stat-content">
                  <Text>Task Completion Rate</Text>
                  <Title level={4}>
                    {mockData.monthlyStats.completionRate}%
                  </Title>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Stats;
