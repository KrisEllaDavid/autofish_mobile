import { apiClient } from './api';
import { useLoading } from '../context/LoadingContext';

// Use the singleton instance from api.ts instead of creating a new one
// This ensures we're using the same token-managed instance

// Hook to use API with loading state
export const useApiWithLoading = () => {
  const { withLoading } = useLoading();

  return {
    // Authentication methods
    register: (userData: any) => withLoading(apiClient.register(userData)),
    login: (credentials: any) => withLoading(apiClient.login(credentials)),
    logout: () => withLoading(apiClient.logout()),
    getCurrentUser: () => withLoading(apiClient.getCurrentUser()),
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => 
      withLoading(apiClient.changePassword(currentPassword, newPassword, confirmPassword)),
    forgotPassword: (email: string) => withLoading(apiClient.forgotPassword(email)),
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => 
      withLoading(apiClient.resetPassword(token, newPassword, confirmPassword)),
    verifyEmail: (token: string) => withLoading(apiClient.verifyEmail(token)),
    resendVerificationEmail: (email: string) => withLoading(apiClient.resendVerificationEmail(email)),

    // Producer page methods
    getCategories: () => withLoading(apiClient.getCategories()),
    getProducerPages: () => withLoading(apiClient.getProducerPages()),
    getProducerPage: (slug: string) => withLoading(apiClient.getProducerPage(slug)),
    createProducerPage: (pageData: any) => withLoading(apiClient.createProducerPage(pageData)),
    updateProducerPage: (slug: string, pageData: any) => withLoading(apiClient.updateProducerPage(slug, pageData)),
    getMyProducerPage: () => withLoading(apiClient.getMyProducerPage()),

    // Publication methods
    getPublications: () => withLoading(apiClient.getPublications()),
    getPublication: (id: number) => withLoading(apiClient.getPublication(id)),
    createPublication: (publicationData: any) => withLoading(apiClient.createPublication(publicationData)),
    updatePublication: (id: number, publicationData: any) => withLoading(apiClient.updatePublication(id, publicationData)),
    deletePublication: (id: number) => withLoading(apiClient.deletePublication(id)),
    getMyPublications: () => withLoading(apiClient.getMyPublications()),
    getPublicFeed: (params?: { page?: number; limit?: number; user_categories?: number[] }) =>
      withLoading(apiClient.getPublicFeed(params)),
    toggleLikePublication: (id: number) => withLoading(apiClient.toggleLikePublication(id)),
    validatePublication: (id: number) => withLoading(apiClient.validatePublication(id)),

    // Product methods
    getProducts: () => withLoading(apiClient.getProducts()),
    getProduct: (id: number) => withLoading(apiClient.getProduct(id)),
    createProduct: (productData: any) => withLoading(apiClient.createProduct(productData)),
    updateProduct: (id: number, productData: any) => withLoading(apiClient.updateProduct(id, productData)),
    deleteProduct: (id: number) => withLoading(apiClient.deleteProduct(id)),
    getMyProducts: () => withLoading(apiClient.getMyProducts()),
    getProductsByCategory: (categoryId: number) => withLoading(apiClient.getProductsByCategory(categoryId)),
    validateProduct: (id: number) => withLoading(apiClient.validateProduct(id)),
    toggleProductAvailability: (id: number) => withLoading(apiClient.toggleProductAvailability(id)),

    // Search methods
    search: (request: any) => withLoading(apiClient.search(request)),
    getSearchSuggestions: (query: string) => withLoading(apiClient.getSearchSuggestions(query)),
    getAvailableCities: () => withLoading(apiClient.getAvailableCities()),

    // Notification methods
    getNotifications: () => withLoading(apiClient.getNotifications()),
    markNotificationAsRead: (id: number) => withLoading(apiClient.markNotificationAsRead(id)),
    markAllNotificationsAsRead: () => withLoading(apiClient.markAllNotificationsAsRead()),
    deleteNotification: (id: number) => withLoading(apiClient.deleteNotification(id)),

    // Chat methods
    getChats: () => withLoading(apiClient.getChats()),
    getChat: (id: number) => withLoading(apiClient.getChat(id)),
    getChatMessages: (chatId: number) => withLoading(apiClient.getChatMessages(chatId)),
    sendMessage: (request: any) => withLoading(apiClient.sendMessage(request)),
    markMessageAsRead: (messageId: number) => withLoading(apiClient.markMessageAsRead(messageId)),

    // Evaluation methods
    getEvaluations: () => withLoading(apiClient.getEvaluations()),
    createEvaluation: (request: any) => withLoading(apiClient.createEvaluation(request)),
    updateEvaluation: (id: number, request: any) => withLoading(apiClient.updateEvaluation(id, request)),
    deleteEvaluation: (id: number) => withLoading(apiClient.deleteEvaluation(id)),

    // Favorite methods
    getFavorites: () => withLoading(apiClient.getFavorites()),
    toggleFavorite: (producerId: number) => withLoading(apiClient.toggleFavorite(producerId)),

    // Cart and Order methods
    getCart: () => withLoading(apiClient.getCart()),
    addToCart: (productId: number, quantity: number) => withLoading(apiClient.addToCart(productId, quantity)),
    updateCartItem: (itemId: number, quantity: number) => withLoading(apiClient.updateCartItem(itemId, quantity)),
    removeFromCart: (itemId: number) => withLoading(apiClient.removeFromCart(itemId)),
    checkout: (request: any) => withLoading(apiClient.checkout(request)),
    getOrders: () => withLoading(apiClient.getOrders()),
    getOrder: (id: number) => withLoading(apiClient.getOrder(id)),

    // Utility methods
    getAccessToken: () => apiClient.getAccessToken(),
    isAuthenticated: () => apiClient.isAuthenticated(),
  };
};

// Export the raw API client for cases where loading is not needed
export { apiClient }; 