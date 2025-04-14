import React from "react";
import { Typography, Card, Space, Row, Col, Statistic } from "antd";

const { Title, Paragraph } = Typography;

const PurwebIntro = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Purweb Design System</Title>

        <Card>
          <Paragraph>
            Purweb Design System is our next-generation framework for building
            modern, responsive, and accessible web applications. It provides a
            comprehensive set of tools and guidelines for creating consistent
            user experiences.
          </Paragraph>
        </Card>

        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card>
              <Statistic title="Components" value={50} suffix="+" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Design Tokens" value={200} suffix="+" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Active Projects" value={15} />
            </Card>
          </Col>
        </Row>

        <Card title="Key Principles">
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card type="inner" title="Consistency">
                Maintain visual and functional consistency across all platforms
              </Card>
            </Col>
            <Col span={8}>
              <Card type="inner" title="Efficiency">
                Optimize development workflow and resource utilization
              </Card>
            </Col>
            <Col span={8}>
              <Card type="inner" title="Accessibility">
                Ensure inclusive design for all users
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default PurwebIntro;
