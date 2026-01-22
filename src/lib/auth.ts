// frontend/src/lib/auth.ts
import { apiClient } from './api';
import { User } from './types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    // Validate inputs before sending request
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    try {
      console.log('AuthService: Sending login request...');
      const response = await apiClient.login(credentials.email, credentials.password);
      console.log('AuthService: Login response received', response);

      // Check if the response status indicates success (200-299 range)
      if (response.status >= 200 && response.status < 300) {
        // Assuming the response contains user and token data directly
        const responseData: any = response.data;
        console.log('AuthService: Response data', responseData);
        const user = responseData.user || { id: responseData.id, email: credentials.email };
        const token = responseData.access_token; // Changed from 'token' to 'access_token' as per backend response
        console.log('AuthService: Token received from backend', token);

        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log('AuthService: Token stored in localStorage');

        // Also store token in cookie for middleware to access
        // Use secure attributes based on environment
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict${isSecure ? '; Secure' : ''}`;
        console.log('AuthService: Token stored in cookie');

        // Create user object with ID from either the response or by decoding the token
        let userId = user.id;
        if (!userId) {
          // If the response doesn't contain a user ID, try to extract it from the token
          const tokenUser = this.getCurrentUser();
          userId = tokenUser?.id || '';
        }

        return {
          success: true,
          user: {
            id: userId,
            email: user.email || credentials.email,
            createdAt: user.createdAt, // Include createdAt if available
            authStatus: 'authenticated',
            isLoading: false
          },
          token
        };
      } else {
        console.log('AuthService: Login failed with status', response.status);
        return {
          success: false,
          error: (response.data as any).message || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('AuthService: Login error:', error);

      // Import the error parsing utility
      const { parseAxiosError } = await import('./axiosErrorHandler');
      const errorMessage = parseAxiosError(error);

      // Return error instead of throwing to prevent Next.js overlay
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async signup(signupData: SignupData): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    // Validate inputs before sending request
    if (!signupData.username || !signupData.email || !signupData.password) {
      return {
        success: false,
        error: 'Username, email and password are required'
      };
    }

    try {
      const response = await apiClient.signup(signupData.username, signupData.email, signupData.password);

      // Check if the response status indicates success (200-299 range)
      if (response.status >= 200 && response.status < 300) {
        // Assuming the response contains user and token data directly
        const responseData: any = response.data;
        const user = responseData.user || { id: responseData.id, username: signupData.username, email: signupData.email };
        const token = responseData.access_token; // Changed from 'token' to 'access_token' as per backend response

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Also store token in cookie for middleware to access
        // Use secure attributes based on environment
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict${isSecure ? '; Secure' : ''}`;

        // Create user object with ID from either the response or by decoding the token
        let userId = user.id;
        if (!userId) {
          // If the response doesn't contain a user ID, try to extract it from the token
          const tokenUser = this.getCurrentUser();
          userId = tokenUser?.id || '';
        }

        return {
          success: true,
          user: {
            id: userId,
            username: user.username || signupData.username,
            email: user.email || signupData.email,
            createdAt: user.createdAt, // Include createdAt if available
            authStatus: 'authenticated',
            isLoading: false
          },
          token
        };
      } else {
        return {
          success: false,
          error: (response.data as any).message || 'Signup failed'
        };
      }
    } catch (error: any) {
      // Handle 409 Conflict specifically
      if (error.response && error.response.status === 409) {
        // Return the backend message without logging the error
        return {
          success: false,
          error: 'Email already exists. Please sign in.'
        };
      }

      // For other errors, avoid logging in production
      if (process.env.NODE_ENV !== 'production') {
        console.error('Signup error:', error);
      }

      // Import the error parsing utility
      const { parseAxiosError } = await import('./axiosErrorHandler');
      const errorMessage = parseAxiosError(error);

      // Return error instead of throwing to prevent Next.js overlay
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  logout(): void {
    // Remove token from localStorage
    localStorage.removeItem('token');
    console.log('AuthService: Token removed from localStorage');

    // Remove token from cookies as well
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    console.log('AuthService: Token removed from cookie');

    // Additional cleanup can be done here if needed
    // For example, calling the backend logout endpoint
    try {
      apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }

  isAuthenticated(): boolean {
    // Check if we're in a browser environment (not SSR)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.log('AuthService: Not in browser environment, returning false');
      return false;
    }

    const token = localStorage.getItem('token');
    console.log('AuthService: Token in localStorage:', token);
    // In a real implementation, you might want to decode the JWT to check expiration
    const isAuthenticated = !!token;
    console.log('AuthService: isAuthenticated result:', isAuthenticated);
    return isAuthenticated;
  }

  getCurrentUser(): User | null {
    // Check if we're in a browser environment (not SSR)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    // Check if the token looks like a JWT (has 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      // This looks like a JWT token, try to decode it
      try {
        // Get the payload part (second part)
        let base64Url = tokenParts[1];
        if (!base64Url) {
          // Don't log warning for invalid JWT, just return minimal user object
          return {
            id: '',
            email: '',
            authStatus: 'authenticated',
            isLoading: false
          };
        }

        // Replace URL-safe characters with standard Base64 characters
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // Extract user information from the JWT payload
        // Try multiple possible field names for user ID
        let userId = payload.user_id || payload.userId || payload.sub || payload.id || payload.uid || '';
        const userEmail = payload.email || payload.user_email || payload.sub || '';

        // If we still don't have a valid user ID, try to get it from other possible fields
        if (!userId) {
          // Look for any field that might contain the user ID
          const possibleIdFields = ['user_id', 'userId', 'id', 'uid', 'user_id_str', 'user_id_string'];
          for (const field of possibleIdFields) {
            if (payload[field]) {
              userId = String(payload[field]);
              break; // Found a valid ID, exit the loop
            }
          }
        }

        return {
          id: userId,
          email: userEmail,
          createdAt: payload.created_at || payload.createdAt || payload.iat ? new Date((payload.created_at || payload.createdAt || payload.iat) * 1000).toISOString() : undefined,
          authStatus: 'authenticated',
          isLoading: false
        };
      } catch (error) {
        // Don't log error for invalid JWT, just return minimal user object
        // This prevents console spam when token is not in JWT format
        return {
          id: '',
          email: '',
          createdAt: undefined,
          authStatus: 'authenticated',
          isLoading: false
        };
      }
    } else {
      // This doesn't look like a JWT, maybe it's just a simple token
      // In this case, we can't extract user info from it
      // So we return a minimal user object indicating the user is authenticated
      // but without specific user details
      // Don't log warning for non-JWT tokens to prevent console spam
      return {
        id: '',
        email: '',
        createdAt: undefined,
        authStatus: 'authenticated',
        isLoading: false
      };
    }
  }

  getToken(): string | null {
    // Check if we're in a browser environment (not SSR)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem('token');
  }

  // Method to refresh user data by re-decoding the token
  refreshUserData(): User | null {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id) {
      // If we have a valid user with an ID, return it
      return currentUser;
    } else {
      // If we don't have a valid ID, try to force a re-check of the token
      const token = this.getToken();
      if (token) {
        // The token exists but we couldn't decode a proper user from it
        // This might mean the JWT format is different than expected
        console.warn('Token exists but could not decode user data properly');
        // Return a minimal user object indicating authentication status
        // but without specific user details
        return {
          id: '',
          email: '',
          createdAt: undefined,
          authStatus: 'authenticated',
          isLoading: false
        };
      }
      return null;
    }
  }
}

export const authService = new AuthService();