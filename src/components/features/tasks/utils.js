export const getPriorityColor = (priority) => {
    const colors = {
        high: "red",
        medium: "orange",
        low: "green",
    };
    return colors[priority] || "blue";
}; 