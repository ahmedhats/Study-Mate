import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Typography } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { getUserStats } from "../../services/api/statsService";

const { Title } = Typography;

const Stats = () => {
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    completedTasks: 0,
    studyStreak: 0,
    weeklyGoal: 0,
    weeklyProgress: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Your Progress</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Study Time"
              value={formatTime(stats.totalStudyTime)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Study Streak"
              value={stats.studyStreak}
              prefix={<FireOutlined />}
              suffix="days"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Weekly Goal"
              value={stats.weeklyProgress}
              prefix={<TrophyOutlined />}
              suffix={`/ ${stats.weeklyGoal} hours`}
            />
            <Progress
              percent={Math.min(
                (stats.weeklyProgress / stats.weeklyGoal) * 100,
                100
              )}
              size="small"
              style={{ marginTop: "8px" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: "24px" }}>
        <Title level={4}>Study Distribution</Title>
        {/* Add study distribution chart here */}
      </Card>
    </div>
  );
};

export default Stats;
