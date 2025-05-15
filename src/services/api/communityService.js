import api from "./axiosConfig";

// Mock user data for communities
const mockUsers = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?u=john123",
    role: "admin",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://i.pravatar.cc/150?u=jane456",
    role: "moderator",
  },
  {
    id: "user3",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://i.pravatar.cc/150?u=alice789",
  },
  {
    id: "user4",
    name: "Bob Wilson",
    email: "bob@example.com",
    avatar: "https://i.pravatar.cc/150?u=bob012",
  },
  {
    id: "user5",
    name: "Emily Davis",
    email: "emily@example.com",
    avatar: "https://i.pravatar.cc/150?u=emily345",
  },
  {
    id: "currentUser",
    name: "You",
    email: "currentuser@example.com",
    avatar: "https://i.pravatar.cc/150?u=currentuser678",
  },
];

// Mock data for communities
const mockCommunities = [
  {
    id: "1",
    name: "JavaScript Developers",
    description:
      "A community for JavaScript developers to share knowledge, discuss best practices, and help each other with coding challenges.",
    members: 1423,
    tags: ["JavaScript", "Web Development", "React", "Node.js"],
    image:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    studySessions: [
      {
        id: "s1",
        title: "Modern JavaScript Fundamentals",
        topic: "ES6+ Features",
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
        maxParticipants: 10,
        participants: [mockUsers[0], mockUsers[2]],
        description:
          "Learn about modern JavaScript features including arrow functions, destructuring, and async/await.",
        difficulty: "intermediate",
        isPublic: true,
      },
    ],
  },
  {
    id: "2",
    name: "Data Science & Machine Learning",
    description:
      "Explore the world of data science, machine learning, and AI. Share projects, discuss algorithms, and collaborate on innovative solutions.",
    members: 982,
    tags: ["Data Science", "Machine Learning", "Python", "AI"],
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3",
    isMember: true,
    isFavorite: true,
    membersList: [mockUsers[0], mockUsers[1], mockUsers[4], mockUsers[5]],
    studySessions: [
      {
        id: "s2",
        title: "Introduction to Neural Networks",
        topic: "Deep Learning Basics",
        startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        maxParticipants: 8,
        participants: [mockUsers[0], mockUsers[1], mockUsers[4], mockUsers[5]],
        description:
          "An introduction to neural networks and deep learning concepts.",
        difficulty: "beginner",
        isPublic: true,
      },
      {
        id: "s3",
        title: "Advanced Python for Data Analysis",
        topic: "Pandas & NumPy",
        startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        endTime: new Date(Date.now() + 172800000 + 7200000).toISOString(), // Day after tomorrow + 2 hours
        maxParticipants: 12,
        participants: [mockUsers[1]],
        description:
          "Advanced techniques for data manipulation and analysis using Python libraries.",
        difficulty: "advanced",
        isPublic: false,
      },
    ],
  },
  {
    id: "3",
    name: "Mathematics Study Group",
    description:
      "A community for mathematics enthusiasts. Discuss concepts, solve problems, and explore the beauty of mathematics together.",
    members: 756,
    tags: ["Mathematics", "Calculus", "Algebra", "Statistics"],
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[2], mockUsers[3], mockUsers[4]],
    studySessions: [],
  },
  {
    id: "4",
    name: "Mobile App Developers",
    description:
      "Connect with other mobile app developers. Share your experiences, discuss the latest trends, and collaborate on exciting projects.",
    members: 632,
    tags: ["Mobile Development", "iOS", "Android", "Flutter"],
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[0], mockUsers[3]],
    studySessions: [],
  },
  {
    id: "5",
    name: "Physics Discussion Group",
    description:
      "Explore the fascinating world of physics. Discuss theories, experiments, and the latest discoveries in this field.",
    members: 512,
    tags: ["Physics", "Quantum Mechanics", "Astrophysics"],
    image:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[1], mockUsers[4]],
    studySessions: [],
  },
  {
    id: "6",
    name: "Language Learning Hub",
    description:
      "Learn new languages and improve your skills with fellow language enthusiasts. Practice together and share learning resources.",
    members: 876,
    tags: ["Languages", "ESL", "Linguistics"],
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[2], mockUsers[3]],
    studySessions: [],
  },
  {
    id: "7",
    name: "UI/UX Designers",
    description:
      "A community for UI/UX designers to share their work, get feedback, and discuss design principles and trends.",
    members: 743,
    tags: ["Design", "UI", "UX", "Graphic Design"],
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3",
    isMember: true,
    isFavorite: false,
    membersList: [mockUsers[0], mockUsers[4]],
    studySessions: [],
  },
  {
    id: "8",
    name: "Cybersecurity Experts",
    description:
      "Discuss the latest in cybersecurity. Share knowledge on threats, defenses, and best practices in securing digital systems.",
    members: 534,
    tags: ["Cybersecurity", "Hacking", "Network Security"],
    image:
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3",
    isMember: false,
    isFavorite: false,
    membersList: [mockUsers[1], mockUsers[3]],
    studySessions: [],
  },
];

/**
 * Fetches a list of communities based on search criteria
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {string} params.topic - Topic filter
 * @returns {Promise} Promise object that resolves to the communities data
 */
export const getCommunities = async (params = {}) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.get("/communities", { params });
    // return response.data;

    // For development, we'll filter the mock data
    const { query = "", topic = "all" } = params;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filteredCommunities = [...mockCommunities];

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredCommunities = filteredCommunities.filter(
        (community) =>
          community.name.toLowerCase().includes(lowerQuery) ||
          community.description.toLowerCase().includes(lowerQuery) ||
          community.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by topic
    if (topic && topic !== "all") {
      filteredCommunities = filteredCommunities.filter((community) =>
        community.tags.some((tag) =>
          tag.toLowerCase().includes(topic.toLowerCase())
        )
      );
    }

    return {
      success: true,
      data: filteredCommunities,
      message: "Communities fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching communities:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to fetch communities",
    };
  }
};

/**
 * Get details of a specific community
 * @param {string} communityId - The ID of the community
 * @returns {Promise} Promise object that resolves to the community details
 */
export const getCommunityDetails = async (communityId) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.get(`/communities/${communityId}`);
    // return response.data;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the community in mock data
    const community = mockCommunities.find((c) => c.id === communityId);

    if (!community) {
      return {
        success: false,
        data: null,
        message: "Community not found",
      };
    }

    return {
      success: true,
      data: community,
      message: "Community details fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching community details:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to fetch community details",
    };
  }
};

/**
 * Join a community
 * @param {string} communityId - The ID of the community to join
 * @returns {Promise} Promise object that resolves to the updated community
 */
export const joinCommunity = async (communityId) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.post(`/communities/${communityId}/join`);
    // return response.data;

    // For development, we'll update the mock data
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: { communityId, joined: true },
      message: "Successfully joined the community",
    };
  } catch (error) {
    console.error("Error joining community:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to join community",
    };
  }
};

/**
 * Toggle favorite status of a community
 * @param {string} communityId - The ID of the community
 * @returns {Promise} Promise object that resolves to the updated favorite status
 */
export const toggleFavoriteCommunity = async (communityId) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.post(`/communities/${communityId}/favorite`);
    // return response.data;

    // For development, we'll simulate the response
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: { communityId, favorited: true },
      message: "Favorite status updated successfully",
    };
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to update favorite status",
    };
  }
};

// Mock chat data for communities
const mockCommunityChats = {
  1: {
    messages: [
      {
        id: "msg1",
        content: "Hey everyone! Welcome to our JavaScript community!",
        sender: mockUsers[0],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: "message",
      },
      {
        id: "msg2",
        content:
          "Thanks John! I'm excited to be here and learn more about JavaScript.",
        sender: mockUsers[3],
        timestamp: new Date(Date.now() - 75600000).toISOString(),
        type: "message",
      },
      {
        id: "msg3",
        content:
          "I'm working on a React project and having some issues with hooks. Has anyone used useCallback extensively?",
        sender: mockUsers[2],
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        type: "message",
      },
      {
        id: "msg4",
        content:
          "Alice, I can help with that. useCallback is used for memoizing functions. Let me share some examples later today.",
        sender: mockUsers[1],
        timestamp: new Date(Date.now() - 39600000).toISOString(),
        type: "message",
      },
    ],
    studySessions: [
      {
        id: "s1",
        title: "Modern JavaScript Fundamentals",
        topic: "ES6+ Features",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
        type: "study_session",
        participants: 2,
      },
    ],
  },
  2: {
    messages: [
      {
        id: "msg1",
        content: "Welcome to the Data Science community!",
        sender: mockUsers[0],
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        type: "message",
      },
      {
        id: "msg2",
        content:
          "I've been exploring TensorFlow recently. It's quite powerful for building ML models.",
        sender: mockUsers[4],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: "message",
      },
      {
        id: "msg3",
        content:
          "Has anyone tried PyTorch? I'm trying to decide between that and TensorFlow for a new project.",
        sender: mockUsers[1],
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        type: "message",
      },
    ],
    studySessions: [
      {
        id: "s2",
        title: "Introduction to Neural Networks",
        topic: "Deep Learning Basics",
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        type: "study_session",
        participants: 4,
      },
      {
        id: "s3",
        title: "Advanced Python for Data Analysis",
        topic: "Pandas & NumPy",
        startTime: new Date(Date.now() + 172800000).toISOString(),
        endTime: new Date(Date.now() + 172800000 + 7200000).toISOString(),
        type: "study_session",
        participants: 1,
      },
    ],
  },
};

// Initialize empty chats for other communities
for (let i = 3; i <= 8; i++) {
  mockCommunityChats[i] = {
    messages: [],
    studySessions: [],
  };
}

/**
 * Get community chat messages and study sessions
 * @param {string} communityId - The ID of the community
 * @returns {Promise} Promise object that resolves to the chat data
 */
export const getCommunityChat = async (communityId) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.get(`/communities/${communityId}/chat`);
    // return response.data;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Get chat data from mock
    const chatData = mockCommunityChats[communityId] || {
      messages: [],
      studySessions: [],
    };

    return {
      success: true,
      data: chatData,
      message: "Community chat fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching community chat:", error);
    return {
      success: false,
      data: { messages: [], studySessions: [] },
      message: error.message || "Failed to fetch community chat",
    };
  }
};

/**
 * Send a message to a community chat
 * @param {string} communityId - The ID of the community
 * @param {string} content - The message content
 * @returns {Promise} Promise object that resolves to the sent message
 */
export const sendCommunityMessage = async (communityId, content) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.post(`/communities/${communityId}/chat`, { content });
    // return response.data;

    // Get current user data from localStorage
    let currentUserData = null;
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        // Support both data structures (with or without user object)
        currentUserData = parsed.user || parsed;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Find the current user in mockUsers or use a default if not found
    const currentUser = mockUsers.find((u) => u.id === "currentUser");

    // Update currentUser name if available from localStorage
    if (currentUserData && currentUserData.name) {
      currentUser.name = currentUserData.name;
    }

    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      type: "message",
    };

    // Add to mock data
    if (!mockCommunityChats[communityId]) {
      mockCommunityChats[communityId] = { messages: [], studySessions: [] };
    }

    mockCommunityChats[communityId].messages.push(newMessage);

    return {
      success: true,
      data: newMessage,
      message: "Message sent successfully",
    };
  } catch (error) {
    console.error("Error sending community message:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to send message",
    };
  }
};

/**
 * Join a study session in a community
 * @param {string} communityId - The ID of the community
 * @param {string} sessionId - The ID of the study session to join
 * @returns {Promise} Promise object that resolves to the updated study session
 */
export const joinCommunitySession = async (communityId, sessionId) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.post(`/communities/${communityId}/sessions/${sessionId}/join`);
    // return response.data;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Find the community and session in mock data
    const community = mockCommunities.find((c) => c.id === communityId);
    if (!community) {
      return {
        success: false,
        data: null,
        message: "Community not found",
      };
    }

    const sessionIndex = community.studySessions.findIndex(
      (s) => s.id === sessionId
    );
    if (sessionIndex === -1) {
      return {
        success: false,
        data: null,
        message: "Study session not found",
      };
    }

    // Check if session is full
    const session = community.studySessions[sessionIndex];
    if (session.participants.length >= session.maxParticipants) {
      return {
        success: false,
        data: null,
        message: "Study session is full",
      };
    }

    // Add current user to participants
    const currentUser = mockUsers.find((u) => u.id === "currentUser");
    if (!session.participants.some((p) => p.id === currentUser.id)) {
      session.participants.push(currentUser);
    }

    // Update the session in mock data
    community.studySessions[sessionIndex] = session;

    return {
      success: true,
      data: session,
      message: "Successfully joined the study session",
    };
  } catch (error) {
    console.error("Error joining study session:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to join study session",
    };
  }
};

/**
 * Create a new study session in a community
 * @param {Object} sessionData - The study session data
 * @param {string} sessionData.communityId - The ID of the community
 * @param {string} sessionData.title - The title of the study session
 * @param {string} sessionData.topic - The topic of the study session
 * @param {string} sessionData.startTime - The start time of the study session
 * @param {string} sessionData.endTime - The end time of the study session
 * @param {number} sessionData.maxParticipants - The maximum number of participants
 * @param {string} sessionData.difficulty - The difficulty level
 * @param {string} sessionData.description - The description of the study session
 * @param {string} [sessionData.prerequisites] - Optional prerequisites for the session
 * @param {boolean} sessionData.isPublic - Whether the session is public
 * @returns {Promise} Promise object that resolves to the created study session
 */
export const createCommunityStudySession = async (sessionData) => {
  try {
    // In a real app, you would make an API call
    // const response = await api.post(`/communities/${sessionData.communityId}/study-sessions`, sessionData);
    // return response.data;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { communityId } = sessionData;

    // Find the community in mock data
    const community = mockCommunities.find((c) => c.id === communityId);
    if (!community) {
      return {
        success: false,
        data: null,
        message: "Community not found",
      };
    }

    // Create new study session
    const newSession = {
      id: `session-${Date.now()}`,
      ...sessionData,
      participants: [mockUsers.find((u) => u.id === "currentUser")], // Creator is first participant
    };

    // Add to mock data
    if (!community.studySessions) {
      community.studySessions = [];
    }
    community.studySessions.push(newSession);

    // Also add to chat data as an announcement
    if (!mockCommunityChats[communityId]) {
      mockCommunityChats[communityId] = { messages: [], studySessions: [] };
    }

    const sessionAnnouncement = {
      id: newSession.id,
      title: newSession.title,
      topic: newSession.topic,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      participants: 1,
      type: "study_session",
    };

    mockCommunityChats[communityId].studySessions.push(sessionAnnouncement);

    return {
      success: true,
      data: newSession,
      message: "Study session created successfully",
    };
  } catch (error) {
    console.error("Error creating study session:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to create study session",
    };
  }
};
