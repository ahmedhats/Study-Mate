import React from "react";
import { Row, Col, Empty, Spin } from "antd";
import CommunityCard from "./CommunityCard";

const CommunityList = ({ communities, loading, onJoin, onFavorite }) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading communities...</p>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No communities found"
        style={{ margin: "50px 0" }}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {communities.map((community) => (
        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={community.id}>
          <CommunityCard
            community={community}
            onJoin={onJoin}
            onFavorite={onFavorite}
          />
        </Col>
      ))}
    </Row>
  );
};

export default CommunityList;
