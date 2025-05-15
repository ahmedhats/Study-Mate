import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Divider,
  List,
  Checkbox,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const TaskModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");

  const handleCancel = () => {
    form.resetFields();
    setSubtasks([]);
    setNewSubtask("");
    onCancel();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = await form.validateFields();
      // Add subtasks to the form values
      values.subtasks = subtasks;
      onSubmit(values);
      setSubtasks([]);
      setNewSubtask("");
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { title: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskCompletion = (index, checked) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].completed = checked;
    setSubtasks(updatedSubtasks);
  };

  return (
    <Modal
      title="Add New Task"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "medium",
          status: "todo",
          dueDate: dayjs(),
        }}
        onSubmit={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please enter a task title",
            },
            {
              min: 3,
              max: 100,
              message: "Title must be between 3 and 100 characters",
            },
          ]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              max: 1000,
              message: "Description cannot exceed 1000 characters",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter task description"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Space size="large" style={{ width: "100%" }}>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[
              {
                required: true,
                message: "Please select a priority",
              },
            ]}
          >
            <Select style={{ width: 120 }}>
              <Option value="urgent">Urgent</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                required: true,
                message: "Please select a status",
              },
            ]}
          >
            <Select style={{ width: 120 }}>
              <Option value="todo">To Do</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[
              {
                required: true,
                message: "Please select a due date",
              },
            ]}
          >
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
        </Space>

        <Divider orientation="left">Subtasks</Divider>

        <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
          <Input
            placeholder="Add a subtask"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onPressEnter={addSubtask}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={addSubtask}>
            Add
          </Button>
        </Space.Compact>

        <List
          size="small"
          bordered
          dataSource={subtasks}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeSubtask(index)}
                />,
              ]}
            >
              <Checkbox
                checked={item.completed}
                onChange={(e) =>
                  handleSubtaskCompletion(index, e.target.checked)
                }
              >
                {item.title}
              </Checkbox>
            </List.Item>
          )}
          locale={{ emptyText: "No subtasks added" }}
        />
      </Form>
    </Modal>
  );
};

export default TaskModal;
