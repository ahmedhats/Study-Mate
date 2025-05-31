import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Card, Empty, Button, Drawer, Spin, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "./Conversations";
import ChatContainer from "./ChatContainer";
import {
  MessageOutlined,
  MenuOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useMessaging } from "../../../context/MessagingContext";

const MessagingPage = () => {
  const { conversationId: routeConversationId } = useParams();
  const navigate = useNavigate();

  const {
    conversations: rawConversations,
    activeConversationId,
    activeConversationMessages,
    loading,
    error,
    actions,
    currentUser,
  } = useMessaging();

  // Memoize conversations array to prevent unnecessary re-renders
  const conversations = useMemo(
    () => (Array.isArray(rawConversations) ? rawConversations : []),
    [rawConversations]
  );

  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [conversationNotFoundWarning, setConversationNotFoundWarning] =
    useState(false);
  const [refreshingData, setRefreshingData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Determine if we're on a mobile screen
  const isMobile = windowWidth < 768;

  // Current conversation detail derived from context's list and active ID
  const currentConversation = useMemo(
    () => conversations.find((c) => c._id === activeConversationId),
    [conversations, activeConversationId]
  );

  // Handle manual refresh of conversations
  const handleForceRefresh = useCallback(async () => {
    setRefreshingData(true);
    try {
      await actions.fetchUserConversations();
    } finally {
      setRefreshingData(false);
    }
  }, [actions]);

  // Sync routeConversationId with context's activeConversationId and handle redirects
  useEffect(() => {
    if (routeConversationId && routeConversationId !== "undefined") {
      if (routeConversationId !== activeConversationId) {
        actions.selectConversation(routeConversationId);
      }
      if (
        currentConversation &&
        currentConversation._id === routeConversationId &&
        currentUser?.user?._id
      ) {
        actions.markConversationAsRead(routeConversationId);
      }
      if (isMobile) {
        setMobileDrawerVisible(false);
      }
    } else if (routeConversationId === "undefined") {
      if (activeConversationId !== null) {
        actions.selectConversation(null);
      }
    } else if (!routeConversationId && activeConversationId) {
      const conversationExists = conversations.some(
        (c) => c._id === activeConversationId
      );
      if (conversationExists || loading.initialConversations) {
        console.log(
          `MessagingPage: Redirecting to stored/active conversation: ${activeConversationId}`
        );
        // Ensure navigation doesn't happen if already on the correct path or during initial load if activeID is already the target
        if (
          `/messages/${activeConversationId}` !==
          window.location.pathname.replace(window.location.hash, "")
        ) {
          navigate(`/messages/${activeConversationId}`);
        }
      } else if (!loading.initialConversations) {
        console.log(
          "MessagingPage: Stored conversation not found after loading, clearing."
        );
        actions.selectConversation(null); // This will clear from context
        localStorage.removeItem("lastActiveConversation"); // Explicitly clear from storage too
        setRetryCount(0); // Reset retry count here
      }
    } else {
      if (activeConversationId !== null) {
        actions.selectConversation(null);
      }
    }
  }, [
    routeConversationId,
    actions,
    activeConversationId,
    isMobile,
    currentConversation,
    currentUser,
    navigate,
    conversations,
    loading.initialConversations,
  ]);

  // Effect to handle conversation not found and retry logic
  useEffect(() => {
    if (
      !routeConversationId ||
      routeConversationId === "undefined" ||
      loading.initialConversations
    ) {
      // If no route ID, or still loading initial conversations, reset retry count and do nothing further here.
      if (retryCount > 0) setRetryCount(0);
      return;
    }

    const conversationExists = conversations.some(
      (c) => c._id === routeConversationId
    );

    if (!conversationExists) {
      console.log(
        `MessagingPage: Conversation ${routeConversationId} not found in list. Retry: ${retryCount}`
      );
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1);
        handleForceRefresh();
      } else {
        console.log(
          `MessagingPage: Conversation ${routeConversationId} not found after ${retryCount} attempts. Clearing and redirecting.`
        );
        actions.clearMessagingStorage(); // Use the context action to clear all relevant storage
        setRetryCount(0); // Reset for future attempts on other conversations
        setConversationNotFoundWarning(true); // Show warning
        navigate("/messages"); // Navigate to base messages page
      }
    } else {
      // Conversation exists, reset retry count if it was > 0
      if (retryCount > 0) setRetryCount(0);
      setConversationNotFoundWarning(false); // Clear warning if conversation is now found
    }
    // Dependencies: only re-run if the route ID, conversations list, loading state, or retry count changes.
    // Crucially, navigate and handleForceRefresh are stable via useCallback or not included if they cause loops.
  }, [
    routeConversationId,
    conversations,
    loading.initialConversations,
    retryCount,
    actions,
    handleForceRefresh,
    navigate,
  ]);

  // Track window size for responsive behavior
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150); // Debounce resize event
    };

    window.addEventListener("resize", handleResize);
    // Initial call to set width correctly
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array is correct here

  // Handle conversation selection
  const handleConversationSelect = (id) => {
    // Reset any warning about missing conversations when a new one is selected
    setConversationNotFoundWarning(false);

    // Navigate to the new conversation URL. The useEffect above will handle updating the context.
    navigate(`/messages/${id}`);
  };

  // Helper to get the conversation title
  const getConversationTitle = () => {
    if (!currentConversation) return "Select a Chat";

    // Robustly get currentUserId first
    const currentUserId =
      currentUser?.user?._id ||
      currentUser?.user?.id ||
      currentUser?._id ||
      currentUser?.id;

    if (!currentUser || !currentUser.user || !currentUserId) {
      console.warn(
        "getConversationTitle: currentUser, currentUser.user or currentUserId is not available yet. CurrentUser:",
        currentUser
      );
      return currentConversation.type === "DM"
        ? "Direct Message"
        : currentConversation.communityName || "Group Chat";
    }

    console.log(
      "getConversationTitle: currentConversation:",
      currentConversation
    );
    console.log("getConversationTitle: currentUserId:", currentUserId);

    if (currentConversation.type === "DM") {
      if (
        !currentConversation.participants ||
        currentConversation.participants.length === 0
      ) {
        console.warn(
          "DM conversation has no participants:",
          currentConversation.participants
        );
        return "Direct Message"; // Fallback title
      }

      const otherParticipant = currentConversation.participants.find((p) => {
        const participantUserId = p?.userId?._id || p?.userId; // Handle if p.userId is just an ID string or an object
        return participantUserId !== currentUserId && p?.userId?.name;
      });
      console.log(
        "getConversationTitle: DM otherParticipant:",
        otherParticipant
      );
      return otherParticipant?.userId?.name || "Direct Message";
    } else if (currentConversation.type === "COMMUNITY") {
      return currentConversation.communityName || "Community Chat";
    } else if (currentConversation.type === "STUDY_SESSION") {
      // Assuming studySessionDetails might be on the conversation object or fetched separately
      return currentConversation.studySessionDetails?.title || "Study Session";
    } else {
      return "Chat";
    }
  };

  // Check if current user can send messages
  const canSendMessages = () => {
    console.log("Checking canSendMessages:");
    console.log("Current conversation:", currentConversation);
    console.log("Current user:", currentUser);

    if (!currentConversation || !currentUser) {
      console.log("Missing conversation or user data");
      return false;
    }

    // Make sure participants exists
    if (!currentConversation.participants) {
      console.error(
        "Conversation is missing participants array:",
        currentConversation
      );
      return false;
    }

    // For DMs, user should always be able to send if they're a participant
    if (currentConversation.type === "DM") {
      const isParticipant = currentConversation.participants.some((p) => {
        const participantId = p.userId?._id || p.userId;
        // Access the user ID correctly from the nested user object in currentUser from context
        const currentUserId =
          currentUser?.user?._id ||
          currentUser?.user?.id ||
          currentUser?._id ||
          currentUser?.id;
        console.log(
          "Comparing participant:",
          participantId,
          "with current user ID:",
          currentUserId
        );
        return participantId === currentUserId;
      });
      console.log("Is participant in DM:", isParticipant);
      return isParticipant;
    }

    // For community chat, check if user is a member
    if (currentConversation.type === "COMMUNITY") {
      return currentConversation.isUserMember || false;
    }

    // For study sessions, if user is a participant they can send
    const currentUserId = currentUser._id || currentUser.id; // Handle both _id and id fields
    return currentConversation.participants.some(
      (p) => p.userId?._id === currentUserId || p.userId === currentUserId
    );
  };

  // Handle join for community chats
  const handleJoinClick = () => {
    if (!currentConversation) return;

    if (currentConversation.type === "COMMUNITY") {
      // If this is a community, navigate to the community page where they can join
      navigate(`/community/${currentConversation.communityId}`);
    } else if (currentConversation.type === "STUDY_SESSION") {
      // For study sessions, navigate to the study session detail
      navigate(`/study-session/${currentConversation.studySessionId}`);
    }
  };

  // Render the conversation list
  const conversationListElement = (
    <Card
      title={
        <div
          className="conversation-list-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Messages</span>
          <Button
            type="text"
            icon={<ReloadOutlined spin={refreshingData} />}
            onClick={handleForceRefresh}
            disabled={refreshingData || loading.initialConversations}
            title="Refresh conversations"
          />
          {isMobile && routeConversationId && (
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => setMobileDrawerVisible(false)}
            >
              Back to Chat
            </Button>
          )}
        </div>
      }
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      styles={{
        header: { flexShrink: 0 },
        body: {
          padding: 0,
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {(loading.initialConversations || refreshingData) && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
          <div style={{ marginTop: "8px", color: "#888" }}>
            {refreshingData ? "Refreshing..." : "Loading conversations..."}
          </div>
        </div>
      )}
      {error &&
        error.type === "fetch" &&
        error.message.includes("conversations") && (
          <Alert
            message="Error"
            description={error.message}
            type="error"
            showIcon
            style={{ margin: "10px" }}
            action={
              <Button
                size="small"
                onClick={handleForceRefresh}
                disabled={refreshingData}
              >
                Retry
              </Button>
            }
          />
        )}
      {conversationNotFoundWarning && (
        <Alert
          message="Conversation Not Found"
          description="The conversation you were viewing may have been deleted or you no longer have access to it."
          type="warning"
          showIcon
          closable
          onClose={() => setConversationNotFoundWarning(false)}
          style={{ margin: "10px" }}
        />
      )}
      {!loading.initialConversations &&
        !refreshingData &&
        !conversations.length &&
        !error && (
          <Empty
            description="No conversations yet."
            style={{ padding: "20px", margin: "auto" }}
          />
        )}
      {!loading.initialConversations &&
        !refreshingData &&
        conversations.length > 0 && (
          <ConversationList
            onConversationSelect={handleConversationSelect}
            selectedConversationId={routeConversationId}
            currentUser={currentUser}
          />
        )}
    </Card>
  );

  return (
    <Row gutter={16} style={{ height: "calc(100vh - 64px)" }}>
      {/* Conversation List - Left Side (visible on desktop, hidden on mobile) */}
      {isMobile ? (
        <Drawer
          title="Conversations"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          styles={{ body: { padding: 0 } }}
          width={300}
        >
          {conversationListElement}
        </Drawer>
      ) : (
        <Col xs={24} sm={24} md={8} lg={6} xl={5} style={{ height: "100%" }}>
          {conversationListElement}
        </Col>
      )}

      {/* Chat Container - Right Side (or Full Width on Mobile) */}
      <Col xs={24} sm={24} md={16} lg={18} xl={19} style={{ height: "100%" }}>
        {routeConversationId && currentConversation ? (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                {isMobile && (
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileDrawerVisible(true)}
                    style={{ marginRight: 8 }}
                  />
                )}
                {getConversationTitle()}
              </div>
            }
            style={{ height: "100%" }}
            styles={{ body: { padding: 0, height: "calc(100% - 56px)" } }}
          >
            {error &&
              error.type === "fetch" &&
              error.message.includes("messages") && (
                <Alert
                  message="Error loading messages"
                  description={error.message}
                  type="error"
                  showIcon
                  style={{ margin: "10px" }}
                  action={
                    <Button
                      size="small"
                      onClick={() =>
                        actions.fetchMessagesForConversation(
                          routeConversationId
                        )
                      }
                    >
                      Retry
                    </Button>
                  }
                />
              )}
            <ChatContainer
              conversationId={routeConversationId}
              conversationType={currentConversation.type}
              title={getConversationTitle()}
              participants={currentConversation.participants}
              canSendMessages={canSendMessages()}
              onJoinClick={handleJoinClick}
              currentUser={currentUser}
              initialMessages={activeConversationMessages}
              loadingMessages={loading.messages}
            />
          </Card>
        ) : routeConversationId ? (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                {isMobile && (
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileDrawerVisible(true)}
                    style={{ marginRight: 8 }}
                  />
                )}
                Loading Conversation...
              </div>
            }
            style={{ height: "100%" }}
            styles={{ body: { padding: 0, height: "calc(100% - 56px)" } }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin size="large" />
              <div style={{ marginTop: "10px" }}>
                Loading conversation data...
              </div>
              {retryCount >= 2 && (
                <div
                  style={{
                    marginTop: "20px",
                    textAlign: "center",
                    maxWidth: "80%",
                  }}
                >
                  <Alert
                    message="Having trouble loading this conversation"
                    description="If this persists, the conversation may have been deleted or you no longer have access."
                    type="warning"
                    showIcon
                  />
                  <div
                    style={{
                      marginTop: "15px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      onClick={handleForceRefresh}
                      icon={<ReloadOutlined spin={refreshingData} />}
                      disabled={refreshingData}
                    >
                      Retry Loading
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        actions.clearMessagingStorage();
                        navigate("/messages");
                      }}
                    >
                      Return to Messages
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                style={{ position: "absolute", top: 16, left: 16 }}
              />
            )}
            <Empty
              description="Select a conversation or start a new one"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => navigate("/users")}
              >
                Start New Chat
              </Button>
            </Empty>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default MessagingPage;
