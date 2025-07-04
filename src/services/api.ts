// AutoFish API Service
// Based on AutoFish API.yaml specification

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  user_categories: any[];
  id_card_info: any;
  favorites: any[];
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  user_type?: 'producer' | 'consumer';
  terms_accepted?: boolean;
  profile_picture?: File;
  country?: string;
  address?: string;
  description?: string;
  categories?: number[];
  recto_id?: File;
  verso_id?: File;
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
    
    // Don't set Content-Type for FormData - let browser set it automatically with boundary
    const defaultHeaders: HeadersInit = {};
    
    // Only set JSON content type if we're not sending FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add authentication header if available
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
      return this.handleResponse<T>(response);
    } catch (error) {
      throw new Error('Network error occurred');
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw data;
    }

    return data;
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
      this.clearTokensFromStorage();
      return false;
    }
  }

  // Authentication Methods
  async register(userData: UserRegistrationRequest): Promise<RegisterResponse> {
    const formData = new FormData();
    
    // Add each field to FormData
    Object.entries(userData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // For categories array, append each category as a separate field
        value.forEach((item, index) => {
          formData.append(`${key}`, item.toString());
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    const result = await this.makeRequest<RegisterResponse>('/api/auth/register/', {
      method: 'POST',
      body: formData,
    });
    
    return result;
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