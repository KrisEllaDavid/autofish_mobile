// AutoFish API Service
// Based on AutoFish API.yaml specification

// Import Capacitor HTTP plugin for mobile
import { CapacitorHttp } from '@capacitor/core';

// Detect mobile runtime (kept for potential platform-specific handling)
const isMobile = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';

// API Configuration - Always use production API directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autofish.store';

// Base URL resolved above depending on environment
const baseURL = API_BASE_URL;

if (import.meta.env.DEV) {
  console.log('[API] Base URL set to:', baseURL);
}

// ================================
// AUTHENTICATION TYPES
// ================================

export interface UserType {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
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
  // New fields for producer verification status
  access_level?: 'full' | 'limited' | 'admin';
  status_message?: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  password2: string;
  first_name: string;  // Required
  last_name: string;   // Required
  phone: string;       // Required
  city: string;        // Required
  user_type: 'producer' | 'consumer';  // Required
  terms_accepted: boolean;  // Required
  profile_picture?: string | File;  // Will be converted to base64 string
  country?: string;    // Required for producers
  address?: string;    // Required for producers
  description?: string;
  categories?: number[]; // Required for producers
  recto_id?: string | File; // Required for producers, will be converted to base64 string
  verso_id?: string | File; // Required for producers, will be converted to base64 string
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
  tokens?: {
    access: string;
    refresh: string;
  };
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

// ================================
// PRODUCER PAGE TYPES
// ================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProducerPage {
  id: number;
  producer: number;
  name: string;
  slug: string;
  logo?: string;
  background_image?: string;
  country: string;
  address: string;
  telephone: string;
  categories: Category[];
  city: string;
  description: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: number;
  producer?: number;
  page: number;
  page_name?: string;
  producer_name?: string;
  producer_phone?: string;  // For WhatsApp contact
  title: string;
  description: string;
  price: number;
  category: Category;
  category_name?: string;
  likes: number;
  likes_count?: number;
  is_liked?: boolean;
  picture?: string;
  picture_url?: string;
  location: string;
  date_posted: string;
  is_valid: boolean;
  discussion_link?: string;
  is_reported: boolean;
  report_count: number;
  is_blocked: boolean;
  blocked_at?: string;
  blocked_by?: number;
}

export interface PaginatedFeedResponse {
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  next: number | null;
  previous: number | null;
  results: Publication[];
}

export interface CreatePublicationRequest {
  page: number;
  title?: string;
  description: string;
  price: number;
  category: number;
  picture?: File;
  location: string;
  discussion_link?: string;
}

export interface UpdatePublicationRequest {
  title?: string;
  description?: string;
  price?: number;
  category?: number;
  picture?: File;
  location?: string;
  discussion_link?: string;
}

// ================================
// PRODUCT TYPES
// ================================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  producer_page: number;
  category: Category;
  is_available: boolean;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  producer_page: number;
  category: number;
  is_available?: boolean;
}

// ================================
// SEARCH TYPES
// ================================

export interface SearchRequest {
  query: string;
  category?: number;
  city?: string;
  min_price?: number;
  max_price?: number;
  user_type?: 'producer' | 'consumer';
}

export interface SearchResult {
  publications: Publication[];
  producers: ProducerPage[];
  products: Product[];
  total_count: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'category' | 'city' | 'producer';
}

// ================================
// NOTIFICATION TYPES
// ================================

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  related_object_id?: number;
  related_object_type?: string;
}

// ================================
// CHAT TYPES
// ================================

export interface Chat {
  id: number;
  participants: UserType[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat: number;
  sender: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SendMessageRequest {
  chat: number;
  content: string;
}

// ================================
// EVALUATION TYPES
// ================================

export interface Evaluation {
  id: number;
  evaluator: number;
  evaluated: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateEvaluationRequest {
  evaluated: number;
  rating: number;
  comment?: string;
}

// ================================
// FAVORITE TYPES
// ================================

export interface Favorite {
  id: number;
  consumer: number;
  producer: number;
  created_at: string;
}

// ================================
// ORDER TYPES
// ================================

export interface CartItem {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user: number;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CheckoutRequest {
  shipping_address: string;
  contact_phone: string;
}

// ================================
// API CLIENT CLASS
// ================================

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = baseURL;
    
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
    const defaultHeaders: Record<string, string> = {};
    
    // Only set JSON content type if we're not sending FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add authentication header if available and not for registration endpoint
    if (this.accessToken && !endpoint.includes('/api/auth/register/')) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
      
      // Log authentication status in development
      if (import.meta.env.DEV) {
        console.log(`🔑 Making authenticated request to ${endpoint} with token: ${this.accessToken.substring(0, 20)}...`);
      }
    } else if (!endpoint.includes('/api/auth/register/') && !endpoint.includes('/api/auth/login/')) {
      // Log when making potentially protected requests without tokens
      if (import.meta.env.DEV) {
        console.log(`⚠️  Making request to ${endpoint} without authentication token`);
      }
    }

    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    try {
      let response: Response;
      
      // Use fetch for FormData uploads, CapacitorHttp for regular requests
      // CapacitorHttp doesn't handle FormData properly, so we use fetch for file uploads
      if (isMobile && typeof CapacitorHttp !== 'undefined' && !(options.body instanceof FormData)) {
        const capacitorOptions = {
          url,
          method: (options.method || 'GET') as any,
          headers,
          data: (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)),
        };
        
        if (import.meta.env.DEV) {
          console.log('📱 Using CapacitorHttp for unified request:', capacitorOptions);
        }
        
        const capacitorResponse = await CapacitorHttp.request(capacitorOptions);
        
        if (import.meta.env.DEV) {
          console.log('📱 CapacitorHttp response:', {
            status: capacitorResponse.status,
            headers: capacitorResponse.headers,
            data: capacitorResponse.data
          });
        }
        
        // Convert Capacitor response to fetch-like Response
        response = {
          ok: capacitorResponse.status >= 200 && capacitorResponse.status < 300,
          status: capacitorResponse.status,
          statusText: '',
          headers: new Headers(capacitorResponse.headers || {}),
          json: async () => {
            // CapacitorHttp already parses JSON responses
            return capacitorResponse.data;
          },
          text: async () => {
            // Handle different data types from CapacitorHttp
            if (typeof capacitorResponse.data === 'string') {
              return capacitorResponse.data;
            } else if (capacitorResponse.data && typeof capacitorResponse.data === 'object') {
              return JSON.stringify(capacitorResponse.data);
            } else {
              return String(capacitorResponse.data || '');
            }
          },
        } as Response;
      } else {
        // Use regular fetch for web - same configuration as mobile would use
        const config: RequestInit = {
          ...options,
          headers,
        };
        response = await fetch(url, config);
      }
      
      // Handle 401 Unauthorized by attempting token refresh
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/api/auth/')) {
        if (import.meta.env.DEV) {
          console.log('🔄 Got 401, attempting token refresh...');
        }
        
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          if (import.meta.env.DEV) {
            console.log('✅ Token refreshed successfully, retrying request...');
          }
          
          // Retry the request with the new token
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${this.accessToken}`,
          };
          
          // Use the same unified approach for retry requests
          if (isMobile && typeof CapacitorHttp !== 'undefined') {
            const retryCapacitorOptions = {
              url,
              method: (options.method || 'GET') as any,
              headers: retryHeaders,
              data: options.body instanceof FormData ? undefined : (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)),
            };
            const retryCapacitorResponse = await CapacitorHttp.request(retryCapacitorOptions);
            response = {
              ok: retryCapacitorResponse.status >= 200 && retryCapacitorResponse.status < 300,
              status: retryCapacitorResponse.status,
              statusText: '',
              headers: new Headers(retryCapacitorResponse.headers || {}),
              json: async () => retryCapacitorResponse.data,
              text: async () => {
                if (typeof retryCapacitorResponse.data === 'string') {
                  return retryCapacitorResponse.data;
                } else if (retryCapacitorResponse.data && typeof retryCapacitorResponse.data === 'object') {
                  return JSON.stringify(retryCapacitorResponse.data);
                } else {
                  return String(retryCapacitorResponse.data || '');
                }
              },
            } as Response;
          } else {
            const retryConfig: RequestInit = {
              ...options,
              headers: retryHeaders,
            };
            response = await fetch(url, retryConfig);
          }
        } else {
          if (import.meta.env.DEV) {
            console.log('❌ Token refresh failed');
          }
        }
      }
      
      return this.handleResponse<T>(response);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('🔥 Network error on request to:', url, error);
        
        // Check if it's a CORS error
        if (error instanceof TypeError && error.message.includes('CORS')) {
          console.error('🚫 CORS Error detected. This usually means:');
          console.error('1. The API server needs to allow your origin');
          console.error('2. You need to use a proxy for development');
          console.error('3. The request needs proper headers');
        }
      }
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and API server status.');
      }
      
      throw new Error('Network error occurred');
    }
  }

  private async makePublicRequest<T>(
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

    // No authentication headers for public requests

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
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        if (isJson) {
          // Try to parse the error response as JSON
          errorData = await response.json();
        } else {
          // Get text response (likely HTML error page)
          const errorText = await response.text();
          
          // Check if it's an HTML error page
          if (errorText.includes('<html') || errorText.includes('<!DOCTYPE')) {
            errorData = { 
              detail: `Server returned HTML error page (${response.status}). Backend may not be properly configured for JSON API responses.`,
              html_response: errorText.substring(0, 500) + '...' // Truncate for logging
            };
          } else {
            errorData = { detail: errorText };
          }
        }
        
        // Only log detailed error info in development or for non-auth errors
        if (import.meta.env.DEV || response.status !== 401) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            contentType,
            isJson,
            data: errorData
          });
        }
      } catch (parseError) {
        if (import.meta.env.DEV) {
          console.error('Could not parse error response:', parseError);
        }
        errorData = { 
          detail: `Failed to parse error response (${response.status})`,
          parse_error: parseError instanceof Error ? parseError.message : String(parseError)
        };
      }
      
      throw errorData;
    }
    
    // Parse successful response
    try {
      if (isJson) {
        const responseData = await response.json();
        
        // Log successful responses for debugging (only in development)
        if (import.meta.env.DEV) {
          console.log('API Success Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            data: responseData
          });
        }
        
        return responseData;
      } else {
        // Handle non-JSON successful responses
        const textData = await response.text();
        if (import.meta.env.DEV) {
          console.warn('API returned non-JSON successful response:', {
            status: response.status,
            contentType,
            text: textData.substring(0, 200) + '...'
          });
        }
        
        // Try to parse as JSON anyway, fallback to text
        try {
          return JSON.parse(textData);
        } catch {
          return textData as any;
        }
      }
    } catch (parseError) {
      if (import.meta.env.DEV) {
        console.error('Could not parse successful response:', parseError);
      }
      throw new Error(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
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
      this.clearTokensFromStorage();
      return false;
    }
  }



  // ================================
  // AUTHENTICATION METHODS
  // ================================

  async register(userData: UserRegistrationRequest): Promise<RegisterResponse> {
    // Helper function to convert base64 to File
    const base64ToFile = (base64String: string, filename: string): File => {
      const arr = base64String.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    };

    // Use FormData for file uploads instead of JSON
    const formData = new FormData();

    // Add all non-file fields to FormData
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('password2', userData.password2);
    formData.append('first_name', userData.first_name);
    formData.append('last_name', userData.last_name);
    formData.append('phone', userData.phone || '');
    formData.append('city', userData.city || '');
    formData.append('user_type', userData.user_type);
    formData.append('terms_accepted', userData.terms_accepted.toString());

    // Add optional fields if they exist
    if (userData.country) formData.append('country', userData.country);
    if (userData.address) formData.append('address', userData.address);
    if (userData.description) formData.append('description', userData.description);

    // Add categories array
    if (userData.categories && userData.categories.length > 0) {
      userData.categories.forEach(categoryId => {
        formData.append('categories', categoryId.toString());
      });
    }

    // Handle file fields - convert base64 to File if needed
    if (userData.profile_picture instanceof File) {
      formData.append('profile_picture', userData.profile_picture);
    } else if (typeof userData.profile_picture === 'string' && userData.profile_picture.startsWith('data:image/')) {
      const profileFile = base64ToFile(userData.profile_picture, 'profile_picture.jpg');
      formData.append('profile_picture', profileFile);
    }

    if (userData.recto_id instanceof File) {
      formData.append('recto_id', userData.recto_id);
    } else if (typeof userData.recto_id === 'string' && userData.recto_id.startsWith('data:image/')) {
      const rectoFile = base64ToFile(userData.recto_id, 'recto_id.jpg');
      formData.append('recto_id', rectoFile);
    }

    if (userData.verso_id instanceof File) {
      formData.append('verso_id', userData.verso_id);
    } else if (typeof userData.verso_id === 'string' && userData.verso_id.startsWith('data:image/')) {
      const versoFile = base64ToFile(userData.verso_id, 'verso_id.jpg');
      formData.append('verso_id', versoFile);
    }

    // Debug logging for development
    if (import.meta.env.DEV) {
      console.log('📋 Registration request - FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`📋 ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`📋 ${key}:`, value);
        }
      }
    }

    const result = await this.makeRequest<RegisterResponse>('/api/auth/register/', {
      method: 'POST',
      body: formData, // Send FormData instead of JSON
    });

    // Auto-login: save tokens if backend returned them
    if ((result as any)?.tokens?.access && (result as any)?.tokens?.refresh) {
      this.saveTokensToStorage((result as any).tokens.access, (result as any).tokens.refresh);
    }

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

  async deleteAccount(): Promise<{ message: string }> {
    const result = await this.makeRequest<{ message: string }>('/api/auth/delete-account/', {
      method: 'DELETE',
    });

    // Clear tokens after successful account deletion
    this.clearTokensFromStorage();

    return result;
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ detail: string }> {
    return this.makeRequest<{ detail: string }>('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: newPassword,
        new_password2: confirmPassword,
      }),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/verify-email/${token}/`);
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/resend-verification-email/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // ================================
  // PRODUCER PAGE METHODS
  // ================================

  async getCategories(): Promise<Category[]> {
    return this.makePublicRequest<Category[]>('/api/producers/categories/');
  }

  async getProducerPages(): Promise<ProducerPage[]> {
    return this.makeRequest<ProducerPage[]>('/api/producers/pages/');
  }

  async getProducerPage(slug: string): Promise<ProducerPage> {
    return this.makePublicRequest<ProducerPage>(`/api/producers/pages/${slug}/`);
  }

  async createProducerPage(pageData: Partial<ProducerPage>): Promise<ProducerPage> {
    const formData = new FormData();
    
    Object.entries(pageData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, item.toString());
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.makeRequest<ProducerPage>('/api/producers/pages/', {
      method: 'POST',
      body: formData,
    });
  }

  async updateProducerPage(slug: string, pageData: Partial<ProducerPage>): Promise<ProducerPage> {
    const formData = new FormData();
    
    Object.entries(pageData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, item.toString());
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.makeRequest<ProducerPage>(`/api/producers/pages/${slug}/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  async getMyProducerPage(): Promise<ProducerPage> {
    return this.makeRequest<ProducerPage>('/api/producers/pages/my_page/');
  }

  // ================================
  // PUBLICATION METHODS
  // ================================

  async getPublications(): Promise<Publication[]> {
    return this.makeRequest<Publication[]>('/api/producers/publications/');
  }

  async getPublication(id: number): Promise<Publication> {
    return this.makePublicRequest<Publication>(`/api/producers/publications/${id}/`);
  }

  async createPublication(publicationData: CreatePublicationRequest): Promise<Publication> {
    const formData = new FormData();
    
    Object.entries(publicationData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.makeRequest<Publication>('/api/producers/publications/', {
      method: 'POST',
      body: formData,
    });
  }

  async updatePublication(id: number, publicationData: UpdatePublicationRequest): Promise<Publication> {
    const formData = new FormData();
    
    Object.entries(publicationData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.makeRequest<Publication>(`/api/producers/publications/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  async deletePublication(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/producers/publications/${id}/`, {
      method: 'DELETE',
    });
  }

  async getMyPublications(): Promise<Publication[]> {
    return this.makeRequest<Publication[]>('/api/producers/publications/my_publications/');
  }

  async getPublicFeed(params?: {
    page?: number;
    limit?: number;
    user_categories?: number[];
  }): Promise<PaginatedFeedResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.user_categories && params.user_categories.length > 0) {
      queryParams.append('user_categories', params.user_categories.join(','));
    }

    const url = `/api/producers/publications/public_feed/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<PaginatedFeedResponse>(url);
  }

  async toggleLikePublication(id: number): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>(`/api/producers/publications/${id}/toggle_like/`, {
      method: 'POST',
    });
  }

  async validatePublication(id: number): Promise<Publication> {
    return this.makeRequest<Publication>(`/api/producers/publications/${id}/validate_publication/`, {
      method: 'POST',
    });
  }

  // ================================
  // PRODUCT METHODS
  // ================================

  async getProducts(): Promise<Product[]> {
    return this.makePublicRequest<Product[]>('/api/products/');
  }

  async getProduct(id: number): Promise<Product> {
    return this.makePublicRequest<Product>(`/api/products/${id}/`);
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return this.makeRequest<Product>('/api/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<Product> {
    return this.makeRequest<Product>(`/api/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/products/${id}/`, {
      method: 'DELETE',
    });
  }

  async getMyProducts(): Promise<Product[]> {
    return this.makeRequest<Product[]>('/api/products/mes_produits/');
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.makePublicRequest<Product[]>(`/api/products/par_categorie/?category=${categoryId}`);
  }

  async validateProduct(id: number): Promise<Product> {
    return this.makeRequest<Product>(`/api/products/${id}/valider_produit/`, {
      method: 'POST',
    });
  }

  async toggleProductAvailability(id: number): Promise<Product> {
    return this.makeRequest<Product>(`/api/products/${id}/basculer_disponibilite/`, {
      method: 'POST',
    });
  }

  // ================================
  // SEARCH METHODS
  // ================================

  async search(request: SearchRequest): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return this.makePublicRequest<SearchResult>(`/api/search/?${params.toString()}`);
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    return this.makePublicRequest<SearchSuggestion[]>(`/api/search/suggestions/?query=${encodeURIComponent(query)}`);
  }

  async getAvailableCities(): Promise<string[]> {
    return this.makePublicRequest<string[]>('/api/search/villes/');
  }

  // ================================
  // NOTIFICATION METHODS
  // ================================

  async getNotifications(): Promise<Notification[]> {
    return this.makeRequest<Notification[]>('/api/notificationsnotifications/');
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    return this.makeRequest<Notification>(`/api/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/notifications/mark_all_read/', {
      method: 'POST',
    });
  }

  async deleteNotification(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/notifications/${id}/`, {
      method: 'DELETE',
    });
  }

  // ================================
  // CHAT METHODS
  // ================================

  async getChats(): Promise<Chat[]> {
    return this.makeRequest<Chat[]>('/api/chats/');
  }

  async getChat(id: number): Promise<Chat> {
    return this.makeRequest<Chat>(`/api/chats/${id}/`);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return this.makeRequest<Message[]>(`/api/chats/${chatId}/messages/`);
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    return this.makeRequest<Message>('/api/chats/messages/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async markMessageAsRead(messageId: number): Promise<Message> {
    return this.makeRequest<Message>(`/api/chats/messages/${messageId}/mark_read/`, {
      method: 'POST',
    });
  }

  // ================================
  // EVALUATION METHODS
  // ================================

  async getEvaluations(): Promise<Evaluation[]> {
    return this.makeRequest<Evaluation[]>('/api/evaluations/');
  }

  async createEvaluation(request: CreateEvaluationRequest): Promise<Evaluation> {
    return this.makeRequest<Evaluation>('/api/evaluations/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateEvaluation(id: number, request: CreateEvaluationRequest): Promise<Evaluation> {
    return this.makeRequest<Evaluation>(`/api/evaluations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async deleteEvaluation(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/evaluations/${id}/`, {
      method: 'DELETE',
    });
  }

  // ================================
  // FAVORITE METHODS
  // ================================

  async getFavorites(): Promise<Favorite[]> {
    return this.makeRequest<Favorite[]>('/api/favorites/');
  }

  async toggleFavorite(producerId: number): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>(`/api/users/${producerId}/toggle_favorite/`, {
      method: 'POST',
    });
  }

  // ================================
  // ORDER METHODS
  // ================================

  async getCart(): Promise<Cart> {
    return this.makeRequest<Cart>('/api/orders/cart/');
  }

  async addToCart(productId: number, quantity: number): Promise<CartItem> {
    return this.makeRequest<CartItem>('/api/orders/cart/items/', {
      method: 'POST',
      body: JSON.stringify({
        product: productId,
        quantity: quantity,
      }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    return this.makeRequest<CartItem>(`/api/orders/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    return this.makeRequest<void>(`/api/orders/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async checkout(request: CheckoutRequest): Promise<Order> {
    return this.makeRequest<Order>('/api/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.makeRequest<Order[]>('/api/orders/');
  }

  async getOrder(id: number): Promise<Order> {
    return this.makeRequest<Order>(`/api/orders/${id}/`);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  // Token management
  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('🔍 Token validation failed:', error);
      }
      this.clearTokensFromStorage();
      return false;
    }
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

// ================================
// SERVICE EXPORTS
// ================================

// Authentication service
export const authService = {
  register: (userData: UserRegistrationRequest) => apiClient.register(userData),
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
  isAuthenticated: () => apiClient.isAuthenticated(),
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => 
    apiClient.changePassword(currentPassword, newPassword, confirmPassword),
  forgotPassword: (email: string) => apiClient.forgotPassword(email),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => 
    apiClient.resetPassword(token, newPassword, confirmPassword),
  verifyEmail: (token: string) => apiClient.verifyEmail(token),
  resendVerificationEmail: (email: string) => apiClient.resendVerificationEmail(email),
};

// Producer page service
export const producerService = {
  getCategories: () => apiClient.getCategories(),
  getProducerPages: () => apiClient.getProducerPages(),
  getProducerPage: (slug: string) => apiClient.getProducerPage(slug),
  createProducerPage: (pageData: Partial<ProducerPage>) => apiClient.createProducerPage(pageData),
  updateProducerPage: (slug: string, pageData: Partial<ProducerPage>) => apiClient.updateProducerPage(slug, pageData),
  getMyProducerPage: () => apiClient.getMyProducerPage(),
};

// Publication service
export const publicationService = {
  getPublications: () => apiClient.getPublications(),
  getPublication: (id: number) => apiClient.getPublication(id),
  createPublication: (publicationData: CreatePublicationRequest) => apiClient.createPublication(publicationData),
  updatePublication: (id: number, publicationData: UpdatePublicationRequest) => apiClient.updatePublication(id, publicationData),
  deletePublication: (id: number) => apiClient.deletePublication(id),
  getMyPublications: () => apiClient.getMyPublications(),
  getPublicFeed: () => apiClient.getPublicFeed(),
  toggleLike: (id: number) => apiClient.toggleLikePublication(id),
  validatePublication: (id: number) => apiClient.validatePublication(id),
};

// Product service
export const productService = {
  getProducts: () => apiClient.getProducts(),
  getProduct: (id: number) => apiClient.getProduct(id),
  createProduct: (productData: CreateProductRequest) => apiClient.createProduct(productData),
  updateProduct: (id: number, productData: Partial<CreateProductRequest>) => apiClient.updateProduct(id, productData),
  deleteProduct: (id: number) => apiClient.deleteProduct(id),
  getMyProducts: () => apiClient.getMyProducts(),
  getProductsByCategory: (categoryId: number) => apiClient.getProductsByCategory(categoryId),
  validateProduct: (id: number) => apiClient.validateProduct(id),
  toggleAvailability: (id: number) => apiClient.toggleProductAvailability(id),
};

// Search service
export const searchService = {
  search: (request: SearchRequest) => apiClient.search(request),
  getSuggestions: (query: string) => apiClient.getSearchSuggestions(query),
  getAvailableCities: () => apiClient.getAvailableCities(),
};

// Notification service
export const notificationService = {
  getNotifications: () => apiClient.getNotifications(),
  markAsRead: (id: number) => apiClient.markNotificationAsRead(id),
  markAllAsRead: () => apiClient.markAllNotificationsAsRead(),
  deleteNotification: (id: number) => apiClient.deleteNotification(id),
};

// Chat service
export const chatService = {
  getChats: () => apiClient.getChats(),
  getChat: (id: number) => apiClient.getChat(id),
  getMessages: (chatId: number) => apiClient.getChatMessages(chatId),
  sendMessage: (request: SendMessageRequest) => apiClient.sendMessage(request),
  markMessageAsRead: (messageId: number) => apiClient.markMessageAsRead(messageId),
};

// Evaluation service
export const evaluationService = {
  getEvaluations: () => apiClient.getEvaluations(),
  createEvaluation: (request: CreateEvaluationRequest) => apiClient.createEvaluation(request),
  updateEvaluation: (id: number, request: CreateEvaluationRequest) => apiClient.updateEvaluation(id, request),
  deleteEvaluation: (id: number) => apiClient.deleteEvaluation(id),
};

// Favorite service
export const favoriteService = {
  getFavorites: () => apiClient.getFavorites(),
  toggleFavorite: (producerId: number) => apiClient.toggleFavorite(producerId),
};

// Order service
export const orderService = {
  getCart: () => apiClient.getCart(),
  addToCart: (productId: number, quantity: number) => apiClient.addToCart(productId, quantity),
  updateCartItem: (itemId: number, quantity: number) => apiClient.updateCartItem(itemId, quantity),
  removeFromCart: (itemId: number) => apiClient.removeFromCart(itemId),
  checkout: (request: CheckoutRequest) => apiClient.checkout(request),
  getOrders: () => apiClient.getOrders(),
  getOrder: (id: number) => apiClient.getOrder(id),
};

export default apiClient; 