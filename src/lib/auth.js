// frontend/src/lib/auth.js
import { apiClient } from './api';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.isAuthenticated = false;
    this.loadToken();
  }

  loadToken() {
    const token = apiClient.getToken();
    if (token) {
      this.token = token;
      this.isAuthenticated = true;
      // In a real app, you might want to decode the JWT to get user info
      // or make an API call to get user details
    }
  }

  async login(email, password) {
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.data && response.data.token) {
        this.token = response.data.token;
        this.isAuthenticated = true;
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async signup(email, password) {
    try {
      const response = await apiClient.signup(email, password);
      if (response.success && response.data && response.data.token) {
        this.token = response.data.token;
        this.isAuthenticated = true;
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed' };
    }
  }

  logout() {
    apiClient.logout();
    this.token = null;
    this.isAuthenticated = false;
  }

  isAuthenticated() {
    return this.isAuthenticated;
  }

  getCurrentUser() {
    // In a real app, you might decode the JWT to get user info
    if (this.token) {
      return this.getUserFromToken(this.token);
    }
    return null;
  }

  getUserFromToken(token) {
    try {
      // Simple JWT decoding (without verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getToken() {
    return this.token;
  }
}

export const authService = new AuthService();