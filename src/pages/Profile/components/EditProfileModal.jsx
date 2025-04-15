import React from "react";
import { Modal, Form, Input, Button, Upload } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

const EditProfileModal = ({ visible, onCancel, userData }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Updated values:", values);
    onCancel();
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={userData}
        onFinish={handleSubmit}
      >
        <div className="profile-image-section">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
          >
            <div className="upload-button">
              <span className="upload-text">mangcoding.png</span>
              <Button type="link" className="remove-image">
                Remove Image
              </Button>
            </div>
          </Upload>
        </div>

        <div className="form-row">
          <Form.Item name="firstName" label="First Name" className="form-col">
            <Input placeholder="Mangcoding" />
          </Form.Item>

          <Form.Item name="lastName" label="Last Name" className="form-col">
            <Input placeholder="Official" />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item name="email" label="Email" className="form-col">
            <Input placeholder="hello@mangcoding.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone" className="form-col">
            <Input placeholder="+62 81234 5123 4522" />
          </Form.Item>
        </div>

        <div className="password-section">
          <h4>Change Password</h4>
          <div className="form-row">
            <Form.Item
              name="oldPassword"
              label="Old Password"
              className="form-col"
            >
              <Input.Password
                placeholder="Enter old password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              className="form-col"
            >
              <Input.Password
                placeholder="Enter new password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
