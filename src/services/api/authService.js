import axiosInstance from './axiosConfig';

export const login = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('userData', JSON.stringify({
                token: response.data.token,
                user: response.data.user
            }));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Login failed' };
    }
};

export const signup = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
    }
};

export const logout = async () => {
    try {
        await axiosInstance.post('/auth/logout');
    } finally {
        localStorage.removeItem('userData');
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Email verification failed' };
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Password reset request failed' };
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axiosInstance.post('/auth/reset-password', {
            token,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Password reset failed' };
    }
}; 