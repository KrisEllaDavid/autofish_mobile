// AutoFish API Service
// Based on AutoFish API.yaml specification

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types based on API schema
export interface UserType {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  country?: string;
  address?: string;
  description?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  user_type: 'producer' | 'consumer';
  terms_accepted: boolean;
  profile_completed: boolean;
  date_joined: string;
  is_active: boolean;
  email_verified: boolean;
  is_verified: boolean;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  user_type: 'producer' | 'consumer';
  terms_accepted?: boolean;
  profile_picture?: File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserType;
}

export interface RegisterResponse {
  message: string;
  user: UserType;
}

export interface ApiError {
  detail?: string;
  email?: string[];
  password?: string[];
  password2?: string[];
  first_name?: string[];
  last_name?: string[];
  user_type?: string[];
  non_field_errors?: string[];
  [key: string]: any;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  private clearTokensFromStorage() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh for 401 errors
      if (response.status === 401 && this.refreshToken && endpoint !== '/api/auth/token/refresh/') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          };
          const retryResponse = await fetch(url, config);
          return this.handleResponse<T>(retryResponse);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error('Network error occurred');
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      if (isJson) {
        errorData = await response.json();
      } else {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const apiError: ApiError = errorData;
      throw apiError;
    }

    if (isJson) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.clearTokensFromStorage();
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokensToStorage(data.access, this.refreshToken);
        return true;
      } else {
        this.clearTokensFromStorage();
        return false;
      }
    } catch {
      console.error('Token refresh failed');
      this.clearTokensFromStorage();
      return false;
    }
  }

  // Authentication Methods
  async register(userData: UserRegistrationRequest): Promise<RegisterResponse> {
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(userData).forEach(([key, value]) => {
      if (key === 'profile_picture' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null && typeof value !== 'object') {
        formData.append(key, String(value));
      }
    });

    return this.makeRequest<RegisterResponse>('/api/auth/register/', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save tokens after successful login
    this.saveTokensToStorage(response.access, response.refresh);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.makeRequest('/api/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({
            refresh: this.refreshToken,
          }),
        });
      }
    } catch (error) {
      console.warn('Logout request failed, but clearing local tokens anyway');
    } finally {
      // Always clear tokens locally
      this.clearTokensFromStorage();
    }
  }

  async getCurrentUser(): Promise<UserType> {
    return this.makeRequest<UserType>('/api/users/me/');
  }

  // Token management
  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Utility method to handle API errors
  static getErrorMessage(error: ApiError): string {
    if (error.detail) {
      return error.detail;
    }

    if (error.non_field_errors && error.non_field_errors.length > 0) {
      return error.non_field_errors[0];
    }

    // Handle field-specific errors
    const fieldErrors: string[] = [];
    Object.entries(error).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        fieldErrors.push(`${field}: ${messages[0]}`);
      }
    });

    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }

    return 'An unexpected error occurred';
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for static method access
export { ApiClient };

// Export individual service functions for convenience
export const authService = {
  register: (userData: UserRegistrationRequest) => apiClient.register(userData),
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
  isAuthenticated: () => apiClient.isAuthenticated(),
};

export default apiClient; 