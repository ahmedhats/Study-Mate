import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "./styles/index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{ 
      token: {
        // You can customize your theme here
      },
      // Enable compatibility mode for React 19
      compatible: true
    }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
