// frontend/src/lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        this.removeToken();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async signup(email, password) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    this.removeToken();
  }

  // Profile methods
  async getProfile(userId) {
    return this.request(`/users/${userId}/profile`);
  }

  async updateProfile(userId, profileData) {
    return this.request(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export const apiClient = new ApiClient();