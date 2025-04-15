import React from "react";
import { Form, Select, Switch, Button, Divider } from "antd";

const Setting = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Settings updated:", values);
  };

  return (
    <div className="settings-container">
      <section className="setting-section">
        <h2>Setting Menu</h2>
        <div className="setting-description">
          Let's try to manage your finance for the future
        </div>

        <div className="time-zone-section">
          <h3>Time Zone and Language</h3>
          <p>Let's try to manage your finance for the future</p>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="form-row">
              <Form.Item name="language" label="Language" className="form-col">
                <Select defaultValue="english">
                  <Select.Option value="english">English</Select.Option>
                  <Select.Option value="spanish">Spanish</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="timezone" label="Language" className="form-col">
                <Select defaultValue="europe/warsaw">
                  <Select.Option value="europe/warsaw">
                    Europe/Warsaw
                  </Select.Option>
                  <Select.Option value="america/new_york">
                    America/New York
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                name="timeFormat"
                label="Time Format"
                className="form-col"
              >
                <Select defaultValue="13:00">
                  <Select.Option value="13:00">13:00</Select.Option>
                  <Select.Option value="1:00 PM">1:00 PM</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateFormat"
                label="Date format"
                className="form-col"
              >
                <Select defaultValue="06-08-2025">
                  <Select.Option value="06-08-2025">06-08-2025</Select.Option>
                  <Select.Option value="08/06/2025">08/06/2025</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
        </div>

        <Divider />

        <div className="notification-section">
          <h3>Notification</h3>
          <p>Let's try to manage your finance for the future</p>

          <div className="notification-item">
            <div className="notification-info">
              <h4>Activity Update</h4>
              <p>
                New tasks assigned to you, @mentions, and completion notifiation
                for tasks you're a
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>Mention</h4>
              <p>New tasks assigned to you, direct messages, and @mentions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Divider />

        <div className="email-section">
          <h3>Email</h3>
          <p>Let's try to manage your finance for the future</p>

          <div className="notification-item">
            <div className="notification-info">
              <h4>Daily digest</h4>
              <p>Personalized productivity stats plus your tasks due today</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>Tips and tricks</h4>
              <p>
                Powerful productivity advice in your inbox. Sent once a month
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <Divider />

        <div className="account-section">
          <h3>Remove Account</h3>
          <p>You can do "Disable account" to take a break from Xask</p>

          <div className="account-actions">
            <Button danger>Disable Account</Button>
            <Button type="primary" danger>
              Delete Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Setting;
