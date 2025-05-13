import React from "react";
import { Modal, Form, Input, Select, DatePicker, Space } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const TaskModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async (e) => {
    console.log("Login form submitted");
    e.preventDefault();
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Add New Task"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      destroyOnClose
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
      </Form>
    </Modal>
  );
};

export default TaskModal;
