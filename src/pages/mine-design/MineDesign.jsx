import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

const Intro = React.lazy(() => import("./Intro"));
const About = React.lazy(() => import("./About"));

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
    }}
  >
    <Spin size="large" />
  </div>
);

const MineDesign = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/intro" element={<Intro />} />
        <Route path="/about" element={<About />} />
        <Route
          path="*"
          element={<Navigate to="/mine-design/intro" replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default MineDesign;
