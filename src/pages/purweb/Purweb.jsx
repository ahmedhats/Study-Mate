import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

const Intro = React.lazy(() => import("./Intro"));

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

const Purweb = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/intro" element={<Intro />} />
        <Route path="*" element={<Navigate to="/purweb/intro" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Purweb;
