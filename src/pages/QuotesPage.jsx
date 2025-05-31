import React, { useEffect, useState } from "react";
import { Typography, Spin } from "antd";
import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { fetchRandomQuote } from "../services/quoteService";
import QuoteCard from "../components/QuoteCard";
import useQuoteStore from "../store/useQuoteStore";
import { motion } from "framer-motion";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0f7fa 0%, #f3e5f5 100%);
  padding: 2rem 1rem;
`;

const Title = styled(Typography.Title)`
  color: #1976d2 !important;
  text-align: center;
  margin-bottom: 2.5rem !important;
  font-size: 2.5rem !important;
`;

const ButtonWrapper = styled.div`
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
`;

const AnimatedButton = styled(motion.button)`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 1.5rem;
  padding: 0.9rem 2.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.08);
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: #125ea7;
  }
`;

const LoaderBox = styled.div`
  min-height: 260px;
  min-width: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuotesPage = () => {
  const {
    currentQuote,
    setCurrentQuote,
    favorites,
    toggleFavorite,
    isFavorite,
  } = useQuoteStore();
  const [loading, setLoading] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    if (!currentQuote) fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const quote = await fetchRandomQuote();
      setCurrentQuote(quote);
      setCardKey(Date.now());
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentQuote) return;
    navigator.clipboard.writeText(
      `"${currentQuote.content}" — ${currentQuote.author}`
    );
  };

  const handleGetInspired = async () => {
    setCardKey(0);
    setTimeout(async () => {
      await fetchQuote();
    }, 350);
  };

  return (
    <PageWrapper>
      <Title level={1}>Daily Wisdom</Title>
      <AnimatePresence mode="wait">
        {loading || !currentQuote ? (
          <LoaderBox key="loader">
            <Spin size="large" />
          </LoaderBox>
        ) : (
          <QuoteCard
            key={cardKey}
            content={currentQuote.content}
            author={currentQuote.author}
            isFavorite={isFavorite(currentQuote)}
            onFavorite={() => toggleFavorite(currentQuote)}
            onCopy={handleCopy}
          />
        )}
      </AnimatePresence>
      <ButtonWrapper>
        <AnimatedButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          onClick={handleGetInspired}
        >
          Get Inspired
        </AnimatedButton>
      </ButtonWrapper>
    </PageWrapper>
  );
};

export default QuotesPage;
