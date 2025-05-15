import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Format the last active timestamp in a user-friendly way
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string like "just now", "5 minutes ago", "2 days ago", etc.
 */
export const formatLastActive = (timestamp) => {
  if (!timestamp) return "Unknown";

  const now = dayjs();
  const lastActive = dayjs(timestamp);
  const diffMinutes = now.diff(lastActive, "minute");
  const diffHours = now.diff(lastActive, "hour");
  const diffDays = now.diff(lastActive, "day");

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return lastActive.format("MMM D, YYYY");
};

/**
 * Determine if a user is currently online based on their last active timestamp
 * @param {string|Date} timestamp - The last active timestamp
 * @param {number} thresholdMinutes - Minutes threshold to consider a user online (default: 5)
 * @returns {boolean} True if the user is considered online
 */
export const isUserOnline = (timestamp, thresholdMinutes = 5) => {
  if (!timestamp) return false;

  const now = dayjs();
  const lastActive = dayjs(timestamp);
  const diffMinutes = now.diff(lastActive, "minute");

  return diffMinutes < thresholdMinutes;
};

// Format a date to display in a readable format
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time to display in a readable format (12-hour with AM/PM)
export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Get a relative time string (today, yesterday, etc.)
export const getRelativeTimeString = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  // Check if same day
  if (d.toDateString() === now.toDateString()) {
    return "Today";
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Check if this week
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (d > oneWeekAgo) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }

  // Otherwise return the date
  return formatDate(d);
};
