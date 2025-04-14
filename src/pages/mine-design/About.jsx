import React from "react";
import { Typography, Card, Space, Timeline } from "antd";

const { Title, Paragraph } = Typography;

const MineDesignAbout = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>About Mine Design</Title>
        <Card>
          <Paragraph>
            Mine Design is a comprehensive design system created to streamline
            our product development process while maintaining consistency across
            all our platforms and applications.
          </Paragraph>
        </Card>

        <Card title="Our Journey">
          <Timeline
            items={[
              {
                color: "green",
                children: (
                  <>
                    <Title level={5}>2024</Title>
                    <Paragraph>Launch of Mine Design System</Paragraph>
                  </>
                ),
              },
              {
                color: "blue",
                children: (
                  <>
                    <Title level={5}>2023</Title>
                    <Paragraph>Development and Testing Phase</Paragraph>
                  </>
                ),
              },
              {
                color: "blue",
                children: (
                  <>
                    <Title level={5}>2022</Title>
                    <Paragraph>Initial Concept and Planning</Paragraph>
                  </>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Core Values">
          <ul>
            <li>User-Centered Design</li>
            <li>Consistency and Quality</li>
            <li>Accessibility</li>
            <li>Scalability</li>
            <li>Innovation</li>
          </ul>
        </Card>
      </Space>
    </div>
  );
};

export default MineDesignAbout;
