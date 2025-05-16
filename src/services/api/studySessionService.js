import axios from "axios";

// Ensure consistent port 5000 usage for API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Mock data for when API calls fail
const mockSessions = [
  {
    _id: "1",
    title: "Calculus Study Group",
    description:
      "Preparing for the midterm exam. We'll cover derivatives, integrals and applications.",
    subject: "Mathematics",
    status: "active",
    participants: [
      { _id: "u1", name: "John Doe" },
      { _id: "u2", name: "Jane Smith" },
      { _id: "u3", name: "Alex Johnson" },
    ],
    createdAt: "2023-05-15T10:30:00Z",
    scheduledFor: "2023-05-16T15:00:00Z",
    maxParticipants: 8,
    type: "exam-prep",
  },
  {
    _id: "2",
    title: "Physics Problem Solving",
    description:
      "Working through the problem set for Chapter 7: Electromagnetism",
    subject: "Physics",
    status: "active",
    participants: [
      { _id: "u2", name: "Jane Smith" },
      { _id: "u4", name: "Mike Wilson" },
    ],
    createdAt: "2023-05-14T14:20:00Z",
    maxParticipants: 5,
    type: "homework",
  },
  {
    _id: "3",
    title: "Literature Discussion: Shakespeare",
    description:
      "Analyzing themes in Hamlet and Macbeth for the upcoming essay",
    subject: "English Literature",
    status: "scheduled",
    participants: [
      { _id: "u1", name: "John Doe" },
      { _id: "u5", name: "Emily Clark" },
      { _id: "u6", name: "David Brown" },
      { _id: "u7", name: "Sarah Lee" },
    ],
    createdAt: "2023-05-15T09:15:00Z",
    scheduledFor: "2023-05-18T17:30:00Z",
    maxParticipants: 10,
    type: "discussion",
  },
  {
    _id: "4",
    title: "Programming: Data Structures",
    description:
      "Implementation of trees, graphs and their algorithms in Python",
    subject: "Computer Science",
    status: "completed",
    participants: [
      { _id: "u3", name: "Alex Johnson" },
      { _id: "u4", name: "Mike Wilson" },
      { _id: "u8", name: "Chris Taylor" },
    ],
    createdAt: "2023-05-10T16:45:00Z",
    scheduledFor: "2023-05-12T19:00:00Z",
    maxParticipants: 6,
    type: "coding-practice",
  },
];

// Helper to get auth token
const getAuthHeader = () => {
  let token = null;

  // Try to get token directly
  const directToken = localStorage.getItem("token");
  if (directToken) {
    token = directToken;
  } else {
    // Try to get token from userData object
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        token = userData.token || (userData.user && userData.user.token);
      } catch (e) {
        console.error("Error parsing userData from localStorage:", e);
      }
    }
  }

  console.log("Auth token found:", !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all study sessions
export const getAllStudySessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/study-sessions`, {
      headers: getAuthHeader(),
    });
    return response;
  } catch (error) {
    console.log(
      "Using mock data for study sessions due to API error:",
      error.message
    );
    // Return mock data structure that matches expected API response
    return {
      data: mockSessions,
      status: 200,
    };
  }
};

// Create a new study session
export const createStudySession = async (sessionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/study-sessions`,
      sessionData,
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log("Mock creating study session due to API error:", error.message);

    // Create a valid session ID that will work with Agora
    const timestamp = Date.now();
    const sessionType = sessionData.type || "group";
    const mockSessionId = `mock-${sessionType}-${timestamp}`;

    // Return mock created session
    const mockSession = {
      ...sessionData,
      _id: mockSessionId,
      createdAt: new Date().toISOString(),
      participants: [{ _id: "current-user", name: "You" }],
      status: "active",
    };

    console.log(`Created mock session with ID: ${mockSessionId}`);

    return {
      data: mockSession,
      status: 201,
    };
  }
};

// Join a study session
export const joinStudySession = async (sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/study-sessions/${sessionId}/join`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log("Mock joining study session due to API error:", error.message);
    return {
      data: { message: "Joined session in demo mode" },
      status: 200,
    };
  }
};

// Leave a study session
export const leaveStudySession = async (sessionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/study-sessions/${sessionId}/leave`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log("Mock leaving study session due to API error:", error.message);
    return {
      data: { message: "Left session in demo mode" },
      status: 200,
    };
  }
};

// Get study session details
export const getStudySessionDetails = async (sessionId) => {
  try {
    // If this is a mock session ID, immediately return mock data
    if (sessionId && sessionId.startsWith("mock-")) {
      console.log("Using mock session for session ID:", sessionId);

      // Determine session type from ID format
      const isIndividual = sessionId.includes("individual");
      const isGroup = sessionId.includes("group");
      const sessionType = isIndividual
        ? "individual"
        : isGroup
        ? "group"
        : "general";

      // Extract any timestamp information for session creation time
      let creationTime = new Date();
      const timestampMatch = sessionId.match(/\d+/);
      if (timestampMatch && timestampMatch[0]) {
        const timestamp = parseInt(timestampMatch[0]);
        if (!isNaN(timestamp)) {
          creationTime = new Date(timestamp);
        }
      }

      return {
        data: {
          _id: sessionId,
          title: isIndividual
            ? "Personal Study Session"
            : isGroup
            ? "Group Study Session"
            : "Study Session",
          description: isIndividual
            ? "A personal study space for focused learning."
            : isGroup
            ? "A collaborative space for group study."
            : "A flexible space for study and collaboration.",
          subject: "Study Session",
          createdAt: creationTime.toISOString(),
          sessionType,
          status: "active",
          participants: [{ _id: "current-user", name: "You" }],
        },
        status: 200,
      };
    }

    // Otherwise, try the API
    const response = await axios.get(`${API_URL}/study-sessions/${sessionId}`, {
      headers: getAuthHeader(),
    });

    // Ensure we have valid session data
    if (response && response.data) {
      console.log("Successfully retrieved session data:", response.data);
      return response;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error(
      "Error fetching session details from API:",
      error.message,
      error.response?.status
    );

    // Throw the error to let the component handle it
    // This will trigger the offline/fallback mode in StudySessionRoom
    throw error;
  }
};

// Update study session
export const updateStudySession = async (sessionId, sessionData) => {
  try {
    const response = await axios.put(
      `${API_URL}/study-sessions/${sessionId}`,
      sessionData,
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log("Mock updating study session due to API error:", error.message);
    return {
      data: {
        ...sessionData,
        _id: sessionId,
        updatedAt: new Date().toISOString(),
      },
      status: 200,
    };
  }
};

// Delete study session
export const deleteStudySession = async (sessionId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/study-sessions/${sessionId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log("Mock deleting study session due to API error:", error.message);
    return {
      data: { message: "Session deleted successfully in demo mode" },
      status: 200,
    };
  }
};
