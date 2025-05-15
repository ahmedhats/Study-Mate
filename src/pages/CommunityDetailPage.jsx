import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Button, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CommunityDetail from "../components/features/community/CommunityDetail";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

/**
 * Community Detail Page that displays details of a specific community
 */
const CommunityDetailPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="community-detail-page">
      <div
        className="custom-page-header"
        style={{ marginBottom: 24, padding: "16px 24px" }}
      >
        <Space align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: 8 }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Community Details
            </Title>
            <Text type="secondary">View and manage community resources</Text>
          </div>
        </Space>
      </div>
      <div className="community-detail-content">
        <CommunityDetail communityId={communityId} />
      </div>
    </div>
  );
};

export default CommunityDetailPage;
