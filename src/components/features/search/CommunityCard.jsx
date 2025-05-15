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
      style={{ marginBottom: 16 }}
      cover={
        image ? (
          <img
            alt={name}
            src={image}
            style={{ height: 160, objectFit: "cover" }}
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
      <Title level={4}>{name}</Title>
      <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
      <div style={{ marginTop: 12 }}>
        {tags.map((tag) => (
          <Tag key={tag} color="blue" style={{ marginBottom: 8 }}>
            {tag}
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default CommunityCard;
