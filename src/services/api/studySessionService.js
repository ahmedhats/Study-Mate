import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all study sessions
export const getAllStudySessions = async () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/study-sessions`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Create a new study session
export const createStudySession = async (sessionData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/study-sessions`, sessionData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Join a study session
export const joinStudySession = async (sessionId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/study-sessions/${sessionId}/join`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Leave a study session
export const leaveStudySession = async (sessionId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/study-sessions/${sessionId}/leave`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get study session details
export const getStudySessionDetails = async (sessionId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/study-sessions/${sessionId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Update study session
export const updateStudySession = async (sessionId, sessionData) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/study-sessions/${sessionId}`, sessionData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Delete study session
export const deleteStudySession = async (sessionId) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/study-sessions/${sessionId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}; 