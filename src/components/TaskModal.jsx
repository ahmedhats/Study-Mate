import React from "react";
import { Modal, Form, Input, Select, DatePicker, Space } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;

const TaskModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit({
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      });
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Add New Task"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      okText="Add Task"
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
          label="Task Title"
          rules={[{ required: true, message: "Please enter a task title" }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            placeholder="Enter task description"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <Space size="large">
          <Form.Item name="priority" label="Priority">
            <Select style={{ width: 120 }}>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default TaskModal;
