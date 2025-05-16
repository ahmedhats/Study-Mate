import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Alert } from "antd";

const DirectVideoTest = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log("Camera started successfully");
      } else {
        console.error("No video element reference available");
        setError("Video element not found in DOM");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Camera access error: ${err.message || "Unknown error"}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      console.log("Camera stopped");
    }
  };

  useEffect(() => {
    // Add logging to show if the video element exists
    console.log("Video ref element:", videoRef.current);

    return () => {
      // Clean up on unmount
      stopCamera();
    };
  }, []);

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>Direct WebCam Test</h2>

      {error && (
        <Alert
          type="error"
          message="Camera Error"
          description={error}
          style={{ marginBottom: "20px" }}
        />
      )}

      <Card style={{ marginBottom: "20px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "100%" /* Creates a square aspect ratio */,
            background: "#f0f0f0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraActive ? "block" : "none",
            }}
          />

          {!cameraActive && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <p>Camera is not active</p>
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <Button type="primary" onClick={startCamera} disabled={cameraActive}>
          Start Camera
        </Button>

        <Button
          type="primary"
          danger
          onClick={stopCamera}
          disabled={!cameraActive}
        >
          Stop Camera
        </Button>
      </div>
    </div>
  );
};

export default DirectVideoTest;
