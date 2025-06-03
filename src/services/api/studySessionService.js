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

// Get stored mock sessions from localStorage
const getStoredMockSessions = () => {
  try {
    const stored = localStorage.getItem("mockSessions");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading stored mock sessions:", error);
    return [];
  }
};

// Store mock sessions to localStorage
const storeMockSessions = (sessions) => {
  try {
    localStorage.setItem("mockSessions", JSON.stringify(sessions));
  } catch (error) {
    console.error("Error storing mock sessions:", error);
  }
};

// Store individual session data by ID
const storeSessionData = (sessionId, sessionData) => {
  try {
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
    console.log(`Stored session data for ID: ${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error storing session data:", error);
    return false;
  }
};

// Get individual session data by ID
const getSessionData = (sessionId) => {
  try {
    const stored = localStorage.getItem(`session_${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading session data:", error);
    return null;
  }
};

// Get all study sessions
export const getAllStudySessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/study-sessions`, {
      headers: getAuthHeader(),
    });

    // Combine API sessions with stored mock sessions
    const storedMockSessions = getStoredMockSessions();
    const allSessions = [...(response.data || []), ...storedMockSessions];

    return {
      data: allSessions,
      status: 200,
    };
  } catch (error) {
    console.log(
      "Using mock data for study sessions due to API error:",
      error.message
    );

    // Get stored mock sessions and combine with default mock data
    const storedMockSessions = getStoredMockSessions();
    const allMockSessions = [...mockSessions, ...storedMockSessions];

    // Return mock data structure that matches expected API response
    return {
      data: allMockSessions,
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

    // Create a valid session ID for Jitsi compatibility
    const timestamp = Date.now();
    const sessionType = sessionData.type || sessionData.sessionMode || "group";
    const mockSessionId = `mock-${sessionType}-${timestamp}`;

    // Get user information for proper attribution
    let currentUserName = "You";
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      currentUserName =
        userData.name || userData.username || userData.user?.name || "You";
    } catch (e) {
      console.log("Could not get user name from localStorage");
    }

    // Create the complete mock session with all user data preserved
    const mockSession = {
      ...sessionData,
      _id: mockSessionId,
      createdAt: new Date().toISOString(),
      participants: [{ _id: "current-user", name: currentUserName }],
      status: sessionData.startImmediately
        ? "active"
        : sessionData.status || "active",
      // Ensure all user-provided data is preserved
      title: sessionData.title,
      description: sessionData.description,
      subject: sessionData.subject,
      type: sessionType,
      maxParticipants: sessionData.maxParticipants || 10,
    };

    // Store the session data in multiple ways for reliability
    try {
      // Primary storage - individual session data
      storeSessionData(mockSessionId, mockSession);

      // Secondary storage - add to the list of mock sessions for visibility
      const storedMockSessions = getStoredMockSessions();
      storedMockSessions.push(mockSession);
      storeMockSessions(storedMockSessions);
      console.log("Added session to mock sessions list");
    } catch (storageError) {
      console.warn("Could not store mock session data:", storageError);
    }

    console.log(`Created mock session with ID: ${mockSessionId}`, mockSession);

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
    // If this is a mock session ID, prioritize stored session data
    if (sessionId && sessionId.startsWith("mock-")) {
      console.log("Retrieving mock session for session ID:", sessionId);

      // Method 1: Try to get the complete session data from individual storage
      let sessionData = getSessionData(sessionId);
      if (sessionData) {
        console.log(
          "Retrieved complete session data from individual storage:",
          sessionData
        );
        return {
          data: sessionData,
          status: 200,
        };
      }

      // Method 2: Check in the stored mock sessions list
      try {
        const storedMockSessions = getStoredMockSessions();
        const foundSession = storedMockSessions.find(
          (s) => s._id === sessionId
        );
        if (foundSession) {
          console.log("Found session in mock sessions list:", foundSession);
          // Store it individually for faster future access
          storeSessionData(sessionId, foundSession);
          return {
            data: foundSession,
            status: 200,
          };
        }
      } catch (listError) {
        console.warn("Could not check mock sessions list:", listError);
      }

      // Method 3: Check if this was a legacy stored session
      try {
        const legacySessionData = localStorage.getItem(`session_${sessionId}`);
        if (legacySessionData) {
          sessionData = JSON.parse(legacySessionData);
          console.log("Retrieved legacy session data:", sessionData);
          return {
            data: sessionData,
            status: 200,
          };
        }
      } catch (legacyError) {
        console.warn("Could not retrieve legacy session data:", legacyError);
      }

      // Method 4: Last resort - create a minimal session with available info
      console.warn(
        `No stored data found for session ${sessionId}, creating minimal session`
      );

      // Extract session type and timestamp from ID if possible
      const sessionTypesMatch = sessionId.match(/mock-([^-]+)-(\d+)/);
      let sessionType = "group";
      let creationTime = new Date();

      if (sessionTypesMatch) {
        sessionType = sessionTypesMatch[1];
        const timestamp = parseInt(sessionTypesMatch[2]);
        if (!isNaN(timestamp)) {
          creationTime = new Date(timestamp);
        }
      }

      const isIndividual = sessionType === "individual";

      // Get user information
      let currentUserName = "You";
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        currentUserName =
          userData.name || userData.username || userData.user?.name || "You";
      } catch (e) {
        console.log("Could not get user name from localStorage");
      }

      // Create minimal session data but with better defaults
      const minimalSession = {
        _id: sessionId,
        title: isIndividual ? "Personal Study Session" : "Group Study Session",
        description: isIndividual
          ? "A personal study space for focused learning."
          : "A collaborative study session.",
        subject: "General Study",
        createdAt: creationTime.toISOString(),
        type: sessionType,
        status: "active",
        participants: [{ _id: "current-user", name: currentUserName }],
        maxParticipants: isIndividual ? 1 : 10,
      };

      // Store this minimal session for future use
      storeSessionData(sessionId, minimalSession);

      return {
        data: minimalSession,
        status: 200,
      };
    }

    // Otherwise, try the API
    const response = await axios.get(`${API_URL}/study-sessions/${sessionId}`, {
      headers: getAuthHeader(),
    });

    // Ensure we have valid session data
    if (response && response.data) {
      console.log(
        "Successfully retrieved session data from API:",
        response.data
      );
      return response;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error(
      "Error fetching session details:",
      error.message,
      error.response?.status
    );

    // Throw the error to let the component handle it
    // This will trigger the offline/fallback mode in StudyRoom
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

    // Remove from stored mock sessions if it's a mock session
    if (sessionId && sessionId.startsWith("mock-")) {
      try {
        // Remove from individual session storage
        localStorage.removeItem(`session_${sessionId}`);
        console.log("Removed individual session data");

        // Remove from stored mock sessions list
        const storedMockSessions = getStoredMockSessions();
        const filteredSessions = storedMockSessions.filter(
          (s) => s._id !== sessionId
        );
        storeMockSessions(filteredSessions);
        console.log("Removed session from mock sessions list");
      } catch (storageError) {
        console.warn(
          "Could not remove mock session from storage:",
          storageError
        );
      }
    }

    return {
      data: { message: "Session deleted successfully in demo mode" },
      status: 200,
    };
  }
};

// Get study sessions for a specific community
export const getCommunityStudySessions = async (communityId) => {
  try {
    const response = await axios.get(
      `${API_URL}/study-sessions?communityId=${communityId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    console.log(
      "Using mock data for community study sessions due to API error:",
      error.message
    );
    // Return mock data structure that matches expected API response
    return {
      data: mockSessions.filter((s) => s.communityId === communityId),
      status: 200,
    };
  }
};
