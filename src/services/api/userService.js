import axiosInstance from './axiosConfig';

export const getUserProfile = async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
};

export const searchUsers = async (query) => {
    const response = await axiosInstance.get(`/users/search?q=${query}`);
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
};

export const updateUserStatistics = async (userId, statistics) => {
    const response = await axiosInstance.put(`/users/${userId}/statistics`, statistics);
    return response.data;
};

export const addRecentActivity = async (userId, activity) => {
    const response = await axiosInstance.post(`/users/${userId}/activities`, activity);
    return response.data;
}; 