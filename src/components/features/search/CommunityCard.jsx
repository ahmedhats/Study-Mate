import React from "react";
import { Card, Avatar, Typography, Button, Space, Tag, Tooltip } from "antd";
import {
  UsergroupAddOutlined,
  UserOutlined,
  MessageOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./CommunityCard.css";

const { Title, Text, Paragraph } = Typography;

const CommunityCard = ({ community, onJoin, onFavorite }) => {
  const { id, name, description, members, tags, image, isMember, isFavorite } =
    community;

  const navigate = useNavigate();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/community/${id}`);
  };

  return (
    <Card
      hoverable
      className="community-card"
      style={{
        marginBottom: 16,
        minHeight: 370,
        boxSizing: "border-box",
        padding: 0,
        width: 300,
        maxWidth: "100%",
      }}
      cover={
        image ? (
          <img
            alt={name}
            src={image}
            style={{ height: 160, objectFit: "cover", width: "100%" }}
          />
        ) : null
      }
      actions={[
        <Tooltip title={`${members} members`}>
          <Space>
            <UserOutlined />
            <span>{members}</span>
          </Space>
        </Tooltip>,
        <Button
          type={isMember ? "default" : "primary"}
          icon={<UsergroupAddOutlined />}
          onClick={() => onJoin(id)}
        >
          {isMember ? "Joined" : "Join"}
        </Button>,
        <Tooltip
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <StarFilled
              style={{ color: "#faad14", fontSize: 16 }}
              onClick={() => onFavorite(id)}
            />
          ) : (
            <StarOutlined onClick={() => onFavorite(id)} />
          )}
        </Tooltip>,
        <Button type="link" size="small" onClick={handleViewDetails}>
          View Details
        </Button>,
      ]}
      onClick={handleViewDetails}
    >
      <div className="community-card-content">
        <Title
          level={4}
          ellipsis={{ rows: 1 }}
          style={{
            marginBottom: 8,
            maxWidth: 260,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Title>
        <Paragraph
          className="community-card-description"
          style={{ marginBottom: 8, minHeight: 48, maxWidth: 260 }}
        >
          {description}
        </Paragraph>
        <div
          style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {tags.map((tag) => (
            <Tag
              key={tag}
              color="blue"
              style={{
                marginBottom: 8,
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CommunityCard;
