import React from "react";
import { Input, Popover } from "antd";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { InputContainer } from "../../../styles/InboxStyles";

const InputBox = ({ value, onChange, onSend, onEmojiClick }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <InputContainer>
      <Input
        size="large"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        style={{ flex: 1 }}
        suffix={
          <div style={{ display: "flex", gap: "8px" }}>
            <Popover
              content={<EmojiPicker onEmojiClick={onEmojiClick} />}
              trigger="click"
              placement="topRight"
            >
              <SmileOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
            </Popover>
            <SendOutlined
              onClick={onSend}
              style={{ color: "#1890ff", cursor: "pointer" }}
            />
          </div>
        }
      />
    </InputContainer>
  );
};

export default InputBox;
 