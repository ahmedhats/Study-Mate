// Mock API calls - replace with actual API calls when backend is ready
export const getUserData = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock user data
    return {
        name: "John Doe",
        email: "john.doe@example.com",
        education: "bachelors",
        major: "Computer Science",
        interests: "Web Development, Machine Learning, Data Science",
        hobbies: "Reading, Hiking, Photography",
        studyPreference: "evening",
        studyStats: {
            totalHours: 45,
            completedTasks: 12,
            studyStreak: 5,
            weeklyGoal: 20,
        },
        recentActivities: [
            {
                type: "study",
                description: "Completed React tutorial",
                timestamp: "2024-04-14T10:00:00Z",
            },
            {
                type: "task",
                description: "Finished project assignment",
                timestamp: "2024-04-13T15:30:00Z",
            },
            {
                type: "team",
                description: "Joined study group",
                timestamp: "2024-04-12T09:15:00Z",
            },
            {
                type: "message",
                description: "Received feedback on assignment",
                timestamp: "2024-04-11T14:20:00Z",
            },
        ],
    };
};

export const updateUserData = async (data) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock successful update
    console.log("Updating user data:", data);
    return { success: true };
}; 