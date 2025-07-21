// AutoFish API Service
// Based on AutoFish API.yaml specification

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ================================
// AUTHENTICATION TYPES
// ================================

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
  profile_picture?: string | File;
  country?: string;
  address?: string;
  description?: string;
  categories?: number[];
  recto_id?: string | File;
  verso_id?: string | File;
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
  title: string;
  description: string;
  price: number;
  category: Category;
  likes: number;
  picture?: string;
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

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
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
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...defaultHeaders,
              ...options.headers,
              'Authorization': `Bearer ${this.accessToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          return this.handleResponse<T>(retryResponse);
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
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        // Try to parse the error response as JSON
        errorData = await response.json();
        
        // Only log detailed error info in development or for non-auth errors
        if (import.meta.env.DEV || response.status !== 401) {
          console.error('API Error Response Data:', errorData);
        }
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (import.meta.env.DEV || response.status !== 401) {
            console.error('API Error Response Text:', errorText);
          }
          errorData = { detail: errorText };
        } catch (textError) {
          if (import.meta.env.DEV) {
            console.error('Could not read error response:', textError);
          }
          errorData = { detail: 'Unknown error occurred' };
        }
      }
      
      // Only log detailed response info in development or for non-auth errors
      if (import.meta.env.DEV || response.status !== 401) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          data: errorData
        });
        
        console.error('Request details:', {
          method: response.url.includes('register') ? 'POST' : 'GET',
          url: response.url,
          status: response.status
        });
      }
      
      throw errorData;
    }
    
    // Parse successful response
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
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.entries(userData).forEach(([key, value]) => {
      if (value instanceof File) {
        // Add files directly
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // For categories array, append each category
        value.forEach((item) => {
          formData.append(key, item.toString());
        });
      } else if (value !== undefined && value !== null) {
        // For all other values, convert to string
        formData.append(key, String(value));
      }
    });
    
    // Debug: Log the FormData being sent
    console.log('Sending registration data as FormData');
    console.log('API URL:', `${this.baseURL}/api/auth/register/`);
    
    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value);
    }
    
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
    return this.makePublicRequest<ProducerPage[]>('/api/producers/pages/');
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

  async getPublicFeed(): Promise<Publication[]> {
    return this.makeRequest<Publication[]>('/api/producers/publications/public_feed/');
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
    return this.makeRequest<Notification[]>('/api/notifications/');
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