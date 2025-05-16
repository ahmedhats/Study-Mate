import React, { useState } from 'react';
import { Input, Button, Typography, Space, message } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import { process_tasks } from '../../../utils/task_parser';

const { TextArea } = Input;
const { Text } = Typography;

const AIAssistant = ({ onCreateTask }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      message.warning('Please enter a task description');
      return;
    }

    setLoading(true);
    try {
      // Use the task parser to extract task information
      const parsedTasks = process_tasks([userInput], new Date());
      if (parsedTasks && parsedTasks.length > 0) {
        const task = parsedTasks[0];
        
        // Convert the parsed task to the format expected by the task system
        const taskData = {
          title: task.title,
          description: userInput,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          importance: task.importance,
          estimatedTime: task.time,
          progress: task.progress,
          subtasks: []
        };

        await onCreateTask(taskData);
        setUserInput('');
        message.success('Task created successfully!');
      } else {
        throw new Error('Failed to parse task');
      }
    } catch (error) {
      message.error('Failed to create task: ' + error.message);
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header" style={{ marginBottom: 24 }}>
        <Space align="center">
          <RobotOutlined style={{ fontSize: 24 }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            AI Task Assistant
          </Typography.Title>
        </Space>
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          Describe your task in natural language and I'll help you organize it.
        </Text>
      </div>

      <div className="ai-input-section" style={{ marginBottom: 24 }}>
        <TextArea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your task description (e.g., 'Complete math homework due next Tuesday, it's medium difficulty and should take about 2 hours')"
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={loading}
          block
        >
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant; 