import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Tag, Progress, Row, Col, Button, InputNumber, message, Alert } from 'antd';
import { ClockCircleOutlined, ScheduleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Text, Title } = Typography;

const TaskManager = ({ tasks }) => {
  const [schedule, setSchedule] = useState(null);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(5);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Priority weights for sorting
  const priorityWeights = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Importance weights for sorting
  const importanceWeights = {
    critical: 4,
    important: 3,
    normal: 2,
    optional: 1
  };

  // Priority colors
  const priorityColors = {
    urgent: '#f5222d',
    high: '#fa541c',
    medium: '#faad14',
    low: '#52c41a'
  };

  // Importance colors
  const importanceColors = {
    critical: '#ff4d4f',
    important: '#ffa940',
    normal: '#4096ff',
    optional: '#95de64'
  };

  // Deadline alert colors
  const deadlineColors = {
    1: '#ff4d4f', // Red for 1 day
    2: '#fa8c16', // Orange for 2 days
    3: '#faad14'  // Yellow for 3 days
  };

  // Sort tasks by importance, priority, and due date
  const getSortedTasks = () => {
    if (!Array.isArray(tasks)) return [];
    
    return [...tasks]
      .filter(task => {
        // Filter out completed tasks
        if (task.status === 'completed') return false;

        const estimatedTime = task.estimatedTime || 0;
        if (estimatedTime <= maxHoursPerDay) return true;

        // If task exceeds maxHoursPerDay, check if it's close to deadline
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Include task if it's within 3 days of deadline
        return daysUntilDeadline <= 3;
      })
      .sort((a, b) => {
        // First sort by importance
        const importanceDiff = (importanceWeights[b.importance] || 0) - (importanceWeights[a.importance] || 0);
        if (importanceDiff !== 0) return importanceDiff;

        // Then by priority
        const priorityDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // Finally by due date
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
        return dateA - dateB;
      });
  };

  // Helper function to get days until deadline
  const getDaysUntilDeadline = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  // Helper function to get alert type based on days until deadline
  const getAlertType = (daysLeft) => {
    if (daysLeft <= 1) return "error";
    if (daysLeft <= 2) return "warning";
    return "info";
  };

  // Helper function to render deadline alert for tasks exceeding workload
  const renderDeadlineAlert = (task) => {
    const estimatedTime = task.estimatedTime || 0;
    if (estimatedTime <= maxHoursPerDay) return null;

    const daysLeft = getDaysUntilDeadline(task.dueDate);
    if (daysLeft > 3) return null;

    return (
      <Alert
        message={
          <Space>
            <WarningOutlined />
            <Text>This task exceeds your {maxHoursPerDay}-hour workload limit</Text>
            <Tag color={deadlineColors[daysLeft]}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </Tag>
          </Space>
        }
        type={getAlertType(daysLeft)}
        style={{ 
          marginBottom: 8,
          borderLeft: `4px solid ${deadlineColors[daysLeft]}`
        }}
      />
    );
  };

  const getAISchedule = async () => {
    setLoadingSchedule(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks/schedule', {
        params: { maxHoursPerDay },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        const scheduleData = response.data.data;
        // Check if we got any schedule data
        if (!scheduleData || Object.keys(scheduleData.schedule).length === 0) {
          message.info('No tasks to schedule');
          setSchedule(null);
          setUnscheduledTasks([]);
        } else {
          setSchedule(scheduleData.schedule);
          setUnscheduledTasks(scheduleData.unscheduled_tasks || []);
          message.success('Schedule generated successfully!');
        }
      } else {
        throw new Error(response.data?.message || 'Failed to generate schedule');
      }
    } catch (error) {
      console.error('Schedule generation error:', error);
      message.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to generate schedule'
      );
      setSchedule(null);
      setUnscheduledTasks([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const renderTaskCard = (task) => {
    const dueDate = dayjs(task.dueDate);
    const isOverdue = dueDate.isBefore(dayjs()) && task.status !== 'completed';
    const estimatedTime = task.estimatedTime || 0;
    const daysLeft = getDaysUntilDeadline(task.dueDate);
    const showDeadlineAlert = estimatedTime > maxHoursPerDay && daysLeft <= 3;

    return (
      <Card 
        key={task._id}
        style={{ 
          marginBottom: 16,
          borderLeft: `4px solid ${priorityColors[task.priority]}`,
          backgroundColor: isOverdue ? '#fff1f0' : undefined
        }}
        size="small"
      >
        <Row align="middle" justify="space-between">
          <Col flex="auto">
            <Space direction="vertical" size={1} style={{ width: '100%' }}>
              <Space align="center" wrap>
                <Text strong>{task.title}</Text>
                <Tag color={priorityColors[task.priority]}>
                  {task.priority.toUpperCase()}
                </Tag>
                <Tag color={importanceColors[task.importance]}>
                  {task.importance.toUpperCase()}
                </Tag>
                {showDeadlineAlert && (
                  <Tag color={deadlineColors[daysLeft]} icon={<WarningOutlined />}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} left ({estimatedTime}h task)
                  </Tag>
                )}
              </Space>
              
              <Space size={16}>
                <Space>
                  <ClockCircleOutlined />
                  <Text type={isOverdue ? "danger" : "secondary"}>
                    {dueDate.format('MMM D, YYYY')}
                  </Text>
                </Space>
                
                {task.estimatedTime && (
                  <Text type="secondary">
                    ~{task.estimatedTime}h
                  </Text>
                )}
              </Space>

              {task.progress !== undefined && (
                <Progress 
                  percent={task.progress} 
                  size="small" 
                  status={isOverdue ? "exception" : undefined}
                />
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderUnscheduledTasks = () => {
    if (!unscheduledTasks || unscheduledTasks.length === 0) return null;

    const urgentTasks = unscheduledTasks.filter(task => task.days_until_deadline <= 3);
    if (urgentTasks.length === 0) return null;

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>Tasks Requiring Attention</Title>
        {urgentTasks.map((task) => (
          <Alert
            key={task._id}
            message={
              <Space>
                <WarningOutlined />
                <Text strong>{task.name}</Text>
                <Tag color={deadlineColors[task.days_until_deadline]}>
                  {task.days_until_deadline} day{task.days_until_deadline !== 1 ? 's' : ''} left
                </Tag>
                {task.remaining_time && (
                  <Text type="secondary">
                    {task.remaining_time}h remaining
                  </Text>
                )}
              </Space>
            }
            type="warning"
            style={{ 
              marginBottom: 8,
              borderLeft: `4px solid ${deadlineColors[task.days_until_deadline]}`
            }}
          />
        ))}
      </div>
    );
  };

  const renderSchedule = () => {
    if (!schedule) return null;

    return (
      <div style={{ marginTop: 24 }}>
        <Title level={5}>AI Generated Schedule</Title>
        {Object.entries(schedule).map(([date, tasks]) => {
          const dayTotal = tasks.reduce((sum, task) => sum + task.time, 0);
          
          return (
            <Card 
              key={date} 
              style={{ marginBottom: 16 }} 
              size="small"
              title={
                <Space>
                  <Text strong>{dayjs(date).format('dddd, MMM D, YYYY')}</Text>
                  <Tag color="blue">{dayTotal} hours planned</Tag>
                </Space>
              }
            >
              <div className="daily-schedule">
                {tasks.map((task, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      marginBottom: 12,
                      padding: 12,
                      borderRadius: 6,
                      backgroundColor: '#f5f5f5',
                      borderLeft: `4px solid ${priorityColors[task.priority]}`
                    }}
                  >
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space direction="vertical" size={1}>
                          <Space align="center">
                            <Text strong>{task.name}</Text>
                            <Text type="secondary">
                              {task.start_time} - {task.end_time}
                            </Text>
                            {task.days_until_deadline <= 3 && (
                              <Tag color={deadlineColors[task.days_until_deadline]}>
                                {task.days_until_deadline} day{task.days_until_deadline !== 1 ? 's' : ''} left
                              </Tag>
                            )}
                          </Space>
                          <Space size={16}>
                            <Tag color={priorityColors[task.priority]}>
                              {task.time}h
                            </Tag>
                            <Tag color={importanceColors[task.importance]}>
                              {task.importance}
                            </Tag>
                            <Tag color={priorityColors[task.priority]}>
                              {task.priority}
                            </Tag>
                          </Space>
                        </Space>
                      </Col>
                      {task.progress !== undefined && (
                        <Col>
                          <Progress 
                            type="circle" 
                            percent={task.progress} 
                            width={30}
                            size="small"
                          />
                        </Col>
                      )}
                    </Row>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="task-manager">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>Task Manager</Title>
        </Col>
        <Col>
          <Space>
            <InputNumber
              min={1}
              max={12}
              value={maxHoursPerDay}
              onChange={setMaxHoursPerDay}
              placeholder="Max hours/day"
              style={{ width: 120 }}
            />
            <Button
              type="primary"
              icon={<ScheduleOutlined />}
              onClick={getAISchedule}
              loading={loadingSchedule}
            >
              Generate Schedule
            </Button>
          </Space>
        </Col>
      </Row>

      {renderUnscheduledTasks()}

      <Row>
        <Col span={24}>
          <div style={{ marginBottom: 24 }}>
            {tasks.length === 0 ? (
              <Text type="secondary">No tasks available</Text>
            ) : (
              getSortedTasks().map(renderTaskCard)
            )}
          </div>
          {schedule && renderSchedule()}
        </Col>
      </Row>
    </div>
  );
};

export default TaskManager; 