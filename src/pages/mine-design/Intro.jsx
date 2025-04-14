import React from "react";
import { Typography, Card, Space, Row, Col } from "antd";

const { Title, Paragraph } = Typography;

const MineDesignIntro = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Mine Design Introduction</Title>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Overview">
              <Paragraph>
                Welcome to Mine Design, our innovative design system that helps
                create consistent and beautiful user experiences across all our
                products.
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Goals">
              <ul>
                <li>Create consistent user experiences</li>
                <li>Improve development efficiency</li>
                <li>Maintain design quality</li>
                <li>Support scalable design systems</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Key Features">
              <ul>
                <li>Component Library</li>
                <li>Design Tokens</li>
                <li>Documentation</li>
                <li>Design Guidelines</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default MineDesignIntro;
