import styled from "styled-components";

export const MessageContainer = styled.div`
  padding: 12px;
  margin: 8px;
  max-width: 70%;
  border-radius: 8px;
  background-color: ${(props) => (props.isSender ? "#1890ff" : "#f0f2f5")};
  color: ${(props) => (props.isSender ? "white" : "rgba(0, 0, 0, 0.85)")};
  align-self: ${(props) => (props.isSender ? "flex-end" : "flex-start")};
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const InputContainer = styled.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ConversationItem = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#e6f7ff" : "transparent")};
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
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