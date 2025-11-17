import api from './api';

export const authService = {
  // Login function
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      if (response.data.success) {
        // Simpan token dan user data di localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Terjadi kesalahan saat login'
      };
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  }
};