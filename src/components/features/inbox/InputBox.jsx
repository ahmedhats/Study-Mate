import React, { useState, useEffect, useRef } from "react";
import { Input } from "antd";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { InputContainer } from "../../../styles/InboxStyles";

const InputBox = ({ value, onChange, onSend, onEmojiClick }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    onEmojiClick(emojiObject);
  };

  const handleSendClick = () => {
    onSend();
    setShowEmojiPicker(false);
  };

  return (
    <InputContainer>
      <div style={{ position: "relative", width: "100%" }}>
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            style={{
              position: "absolute",
              bottom: "100%",
              right: 0,
              zIndex: 1000,
              marginBottom: "8px",
            }}
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <Input
          size="large"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{ width: "100%" }}
          suffix={
            <div style={{ display: "flex", gap: "8px" }}>
              <SmileOutlined
                ref={emojiButtonRef}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ color: "#1890ff", cursor: "pointer" }}
              />
              <SendOutlined
                onClick={handleSendClick}
                style={{ color: "#1890ff", cursor: "pointer" }}
              />
            </div>
          }
        />
      </div>
    </InputContainer>
  );
};

export default InputBox;
