import React from "react";
import { Card, Typography, Tooltip, Button } from "antd";
import {
  BulbOutlined,
  StarFilled,
  StarOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import styled from "styled-components";

const StyledCard = styled(Card)`
  border-radius: 1.5rem !important;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  .ant-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem 2rem 2rem 2rem;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 18px;
  svg {
    font-size: 48px;
    color: #1976d2;
  }
`;

const Author = styled(Typography.Text)`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #1976d2;
  font-weight: 500;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 1.5rem;
`;

const QuoteText = styled(Typography.Text)`
  font-size: 1.4rem;
  text-align: center;
  font-weight: 500;
  color: #222;
  line-height: 1.7;
`;

const QuoteCard = ({
  content,
  author,
  isFavorite,
  onFavorite,
  onCopy,
  ...motionProps
}) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -40 }}
    transition={{ type: "spring", duration: 0.6 }}
    {...motionProps}
  >
    <StyledCard>
      <IconWrapper>
        <BulbOutlined />
      </IconWrapper>
      <QuoteText>“{content}”</QuoteText>
      <Author>— {author}</Author>
      <ActionsRow>
        <Tooltip title={isFavorite ? "Unfavorite" : "Favorite"}>
          <Button
            shape="circle"
            icon={
              isFavorite ? (
                <StarFilled style={{ color: "#FFD600" }} />
              ) : (
                <StarOutlined />
              )
            }
            aria-label={isFavorite ? "Unfavorite" : "Favorite"}
            onClick={onFavorite}
          />
        </Tooltip>
        <Tooltip title="Copy Quote">
          <Button
            shape="circle"
            icon={<CopyOutlined />}
            aria-label="Copy Quote"
            onClick={onCopy}
          />
        </Tooltip>
      </ActionsRow>
    </StyledCard>
  </motion.div>
);

export default QuoteCard;
