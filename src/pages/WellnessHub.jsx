import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tooltip,
  Input,
  message as antMessage,
} from "antd";
import {
  StarFilled,
  StarOutlined,
  CloseOutlined,
  PlusOutlined,
  SmileOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  CloudOutlined,
  UserSwitchOutlined,
  AppleOutlined,
  AimOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import useTipsStore from "../store/tipsStore";

const { Title, Text } = Typography;

// SVG Icon Components
const HydrateIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Hydrate"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#E0F7FA" />
    <path
      d="M20 8C22 14 28 16 28 22C28 26.4183 24.4183 30 20 30C15.5817 30 12 26.4183 12 22C12 16 18 14 20 8Z"
      fill="#00BCD4"
    />
  </svg>
);
const MoveIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Get Moving"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#E8F5E9" />
    <rect x="16" y="10" width="8" height="20" rx="4" fill="#43A047" />
  </svg>
);
const EyeBreakIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Eye Breaks"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#FFF3E0" />
    <ellipse cx="20" cy="20" rx="10" ry="6" fill="#FF9800" />
    <circle cx="20" cy="20" r="3" fill="#FFF" />
  </svg>
);
const BreatheIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Mindful Breathing"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#E3F2FD" />
    <path
      d="M12 28C16 20 24 20 28 28"
      stroke="#1976D2"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const PostureIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Posture Check"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#F3E5F5" />
    <rect x="18" y="12" width="4" height="16" rx="2" fill="#8E24AA" />
  </svg>
);
const SnackIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Snack Smart"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#FFFDE7" />
    <rect x="14" y="18" width="12" height="8" rx="4" fill="#FBC02D" />
  </svg>
);
const WalkIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    aria-label="Short Walks"
    role="img"
  >
    <circle cx="20" cy="20" r="20" fill="#E1F5FE" />
    <rect x="16" y="24" width="8" height="4" rx="2" fill="#0288D1" />
    <rect x="18" y="12" width="4" height="12" rx="2" fill="#0288D1" />
  </svg>
);
const DefaultIcon = () => (
  <BulbOutlined style={{ fontSize: 40, color: "#607D8B" }} />
);

// Timeline SVG
const TimelineSVG = () => (
  <svg
    width="100%"
    height="48"
    viewBox="0 0 400 48"
    fill="none"
    aria-label="Study Flow"
    role="img"
  >
    <rect x="0" y="20" width="400" height="8" rx="4" fill="#B2DFDB" />
    <circle cx="40" cy="24" r="16" fill="#00BCD4" />
    <circle cx="120" cy="24" r="16" fill="#43A047" />
    <circle cx="200" cy="24" r="16" fill="#FF9800" />
    <circle cx="280" cy="24" r="16" fill="#1976D2" />
    <circle cx="360" cy="24" r="16" fill="#FBC02D" />
  </svg>
);

// Tip data type
/**
 * @typedef {Object} Tip
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {React.ReactNode} icon
 * @property {boolean} isFavorite
 * @property {boolean} isCustom
 */

const initialTips = [
  {
    id: "hydrate",
    title: "Hydrate Often",
    description: "Don't forget to drink water every study session.",
    icon: <CloudOutlined style={{ fontSize: 40, color: "#00BCD4" }} />,
  },
  {
    id: "move",
    title: "Get Moving",
    description: "Do 10 push-ups or stretches every 45 minutes.",
    icon: <ThunderboltOutlined style={{ fontSize: 40, color: "#43A047" }} />,
  },
  {
    id: "eye-breaks",
    title: "Eye Breaks",
    description:
      "Follow the 20-20-20 rule: every 20 min, look at something 20 ft away for 20 sec.",
    icon: <EyeOutlined style={{ fontSize: 40, color: "#FF9800" }} />,
  },
  {
    id: "breathe",
    title: "Mindful Breathing",
    description: "Take 5 deep breaths when you feel overwhelmed.",
    icon: <SmileOutlined style={{ fontSize: 40, color: "#1976D2" }} />,
  },
  {
    id: "posture",
    title: "Posture Check",
    description: "Straighten your back and relax your shoulders every hour.",
    icon: <UserSwitchOutlined style={{ fontSize: 40, color: "#8E24AA" }} />,
  },
  {
    id: "snack",
    title: "Snack Smart",
    description: "Choose protein or fruit over sugar for sustained energy.",
    icon: <AppleOutlined style={{ fontSize: 40, color: "#FBC02D" }} />,
  },
  {
    id: "walk",
    title: "Short Walks",
    description: "Take a 5-minute walk after completing each task.",
    icon: <AimOutlined style={{ fontSize: 40, color: "#0288D1" }} />,
  },
];

const CardGrid = styled(Row)`
  margin-top: 32px;
  row-gap: 24px;
  column-gap: 0;
`;

const StyledCard = styled(Card)`
  border-radius: 1.5rem !important;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 6px 32px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px) scale(1.02);
  }
  .ant-card-body {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 12px;
  svg {
    width: 48px;
    height: 48px;
    transition: filter 0.2s;
  }
  ${StyledCard}:hover & svg {
    filter: brightness(1.2) saturate(1.2);
  }
`;

const AddTipInput = styled(Input)`
  border-radius: 1rem;
  margin-top: 24px;
  max-width: 400px;
`;

const WellnessHub = () => {
  const { tips, favoriteTip, dismissTip, addCustomTip } = useTipsStore();
  const [customTipTitle, setCustomTipTitle] = useState("");
  const [customTipDescription, setCustomTipDescription] = useState("");

  const handleFavorite = (id) => favoriteTip(id);
  const handleDismiss = (id) => dismissTip(id);

  const handleAddTip = () => {
    if (!customTipTitle.trim() || !customTipDescription.trim()) return;
    addCustomTip(customTipTitle.trim(), customTipDescription.trim());
    setCustomTipTitle("");
    setCustomTipDescription("");
    antMessage.success("Custom tip added!");
  };

  return (
    <div className="p-4 md:p-8" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2} style={{ color: "#1976d2", marginBottom: 0 }}>
        Wellness Hub
      </Title>
      <Text type="secondary" style={{ fontSize: 18 }}>
        Small habits. Big results.
      </Text>
      <div className="my-6" style={{ margin: "32px 0 0 0" }}>
        <TimelineSVG />
      </div>
      <CardGrid gutter={[24, 24]}>
        {tips.length === 0 && (
          <Col span={24}>
            <Text type="secondary">No tips to show. Add your own below!</Text>
          </Col>
        )}
        {tips.map((tip) => (
          <Col xs={24} sm={12} md={12} lg={8} key={tip.id}>
            <StyledCard
              tabIndex={0}
              aria-label={tip.title}
              role="region"
              hoverable
              style={{ minHeight: 220, background: "#fff" }}
              bodyStyle={{ padding: 0 }}
            >
              <IconWrapper>{tip.icon || <DefaultIcon />}</IconWrapper>
              <Title level={4} style={{ marginBottom: 8, textAlign: "center" }}>
                {tip.title}
              </Title>
              <Text
                style={{
                  textAlign: "center",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                {tip.description}
              </Text>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 12 }}
              >
                <Tooltip title={tip.isFavorite ? "Unfavorite" : "Favorite"}>
                  <Button
                    shape="circle"
                    icon={
                      tip.isFavorite ? (
                        <StarFilled style={{ color: "#FFD600" }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    aria-label={tip.isFavorite ? "Unfavorite" : "Favorite"}
                    onClick={() => handleFavorite(tip.id)}
                  />
                </Tooltip>
                <Tooltip title="Dismiss">
                  <Button
                    shape="circle"
                    icon={<CloseOutlined />}
                    aria-label="Dismiss"
                    onClick={() => handleDismiss(tip.id)}
                  />
                </Tooltip>
              </div>
            </StyledCard>
          </Col>
        ))}
      </CardGrid>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <AddTipInput
          placeholder="Tip Title (e.g. 'Stand up and stretch!')"
          value={customTipTitle}
          onChange={(e) => setCustomTipTitle(e.target.value)}
          maxLength={80}
          aria-label="Add custom tip title"
        />
        <AddTipInput
          placeholder="Tip Description (e.g. 'Take a short break to stretch your legs.')"
          value={customTipDescription}
          onChange={(e) => setCustomTipDescription(e.target.value)}
          maxLength={200}
          aria-label="Add custom tip description"
          style={{ marginTop: 8 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTip}
          aria-label="Add tip"
          style={{ marginTop: 8 }}
        >
          Add Tip
        </Button>
      </div>
    </div>
  );
};

export default WellnessHub;
