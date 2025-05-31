import styled from "styled-components";

export const MessageContainer = styled.div`
  padding: 16px 20px;
  margin: 12px 0;
  max-width: 65%;
  border-radius: 18px;
  background: ${(props) =>
    props.isSender
      ? "rgba(255, 255, 255, 0.35)"
      : "#f4f6fb"};
  color: ${(props) => (props.isSender ? "#222" : "#222")};
  align-self: ${(props) => (props.isSender ? "flex-end" : "flex-start")};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  word-break: break-word;
  transition: background 0.2s;
  backdrop-filter: ${(props) => (props.isSender ? "blur(8px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.isSender ? "blur(8px)" : "none")};
  border: ${(props) => (props.isSender ? "1px solid rgba(255,255,255,0.4)" : "none")};
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.03);
  padding: 0;
  overflow: hidden;
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px 32px 16px 32px;
  display: flex;
  flex-direction: column;
  background: transparent;
`;

export const InputContainer = styled.div`
  padding: 24px 32px 24px 32px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.03);
  position: relative;
  z-index: 2;
`;

export const ConversationItem = styled.div`
  padding: 14px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#e3f0ff" : "transparent")};
  border-radius: 10px;
  margin-bottom: 4px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const ChatHeader = styled.div`
  padding: 20px 32px 16px 32px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 16px 16px 0 0;
`;

export const NoChat = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  flex-direction: column;
  gap: 12px;
`;