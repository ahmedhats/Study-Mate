import React from "react";
import { Modal, Form, Input, Select, DatePicker, Space } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const TaskModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Add New Task"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "medium",
          dueDate: dayjs(),
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please enter a task title",
            },
          ]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={4}
            placeholder="Enter task description"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Space>
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
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
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
