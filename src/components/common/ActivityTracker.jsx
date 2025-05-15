import { useEffect, useCallback } from "react";
import { updateLastActive } from "../../services/api/userService";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"];
const UPDATE_INTERVAL = 5 * 60 * 1000; // Update every 5 minutes

/**
 * Component that tracks user activity and updates last active status
 * This is a hidden component that should be added to the app's main layout
 */
const ActivityTracker = () => {
  // Function to update the last active timestamp
  const updateActivity = useCallback(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("userData");
    if (!userData) return;

    updateLastActive().catch((err) =>
      console.error("Failed to update last active status:", err)
    );
  }, []);

  useEffect(() => {
    // Update on mount
    updateActivity();

    // Set up interval to update periodically
    const intervalId = setInterval(updateActivity, UPDATE_INTERVAL);

    // Set up event listeners for user activity
    const handleActivity = () => {
      updateActivity();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  // This component doesn't render anything
  return null;
};

export default ActivityTracker;
