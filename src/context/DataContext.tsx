import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { apiClient, Publication, Chat, PaginatedFeedResponse } from '../services/api';
import { appEvents, APP_EVENTS } from '../utils/eventEmitter';
import { useAuth } from './AuthContext';

// Cache entry with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface DataContextType {
  // Publications
  publications: Publication[];
  feedMeta: {
    page: number;
    total_pages: number;
    count: number;
  } | null;
  loadPublications: (params?: { page?: number; limit?: number; category?: string }) => Promise<void>;
  refreshPublications: () => Promise<void>;
  getPublicationById: (id: number) => Publication | null;
  updatePublicationCache: (publicationId: number, updates: Partial<Publication>) => void;

  // Favorites
  favoritePublications: Publication[];
  loadFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;

  // Chats
  chats: Chat[];
  loadChats: () => Promise<void>;
  refreshChats: () => Promise<void>;
  getChatById: (id: number) => Chat | null;

  // User profile
  refreshUserProfile: () => Promise<void>;

  // Loading states
  isLoadingPublications: boolean;
  isLoadingFavorites: boolean;
  isLoadingChats: boolean;

  // Clear cache
  clearCache: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CACHE_TTL = {
  PUBLICATIONS: 5 * 60 * 1000, // 5 minutes
  FAVORITES: 3 * 60 * 1000, // 3 minutes
  CHATS: 2 * 60 * 1000, // 2 minutes
  PROFILE: 10 * 60 * 1000, // 10 minutes
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, updateUserData } = useAuth();

  // State
  const [publications, setPublications] = useState<Publication[]>([]);
  const [feedMeta, setFeedMeta] = useState<{
    page: number;
    total_pages: number;
    count: number;
  } | null>(null);
  const [favoritePublications, setFavoritePublications] = useState<Publication[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  // Loading states
  const [isLoadingPublications, setIsLoadingPublications] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Cache timestamps
  const lastFetchRef = useRef<{
    publications: number;
    favorites: number;
    chats: number;
  }>({
    publications: 0,
    favorites: 0,
    chats: 0,
  });

  // Check if cache is still valid
  const isCacheValid = (key: 'publications' | 'favorites' | 'chats', ttl: number): boolean => {
    const lastFetch = lastFetchRef.current[key];
    return lastFetch > 0 && Date.now() - lastFetch < ttl;
  };

  // Load publications with caching
  const loadPublications = useCallback(async (params?: { page?: number; limit?: number; category?: string }) => {
    // Check cache validity
    if (!params && isCacheValid('publications', CACHE_TTL.PUBLICATIONS) && publications.length > 0) {
      console.log('📦 Using cached publications');
      return;
    }

    setIsLoadingPublications(true);
    try {
      const response = await apiClient.getPublicFeed({
        page: params?.page || 1,
        limit: params?.limit || 20,
      });

      setPublications(response.results);
      setFeedMeta({
        page: response.page,
        total_pages: response.total_pages,
        count: response.count,
      });
      lastFetchRef.current.publications = Date.now();
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setIsLoadingPublications(false);
    }
  }, [publications.length]);

  // Refresh publications (force reload)
  const refreshPublications = useCallback(async () => {
    lastFetchRef.current.publications = 0; // Invalidate cache
    await loadPublications();
  }, [loadPublications]);

  // Get publication by ID from cache
  const getPublicationById = useCallback((id: number): Publication | null => {
    return publications.find(pub => pub.id === id) ||
           favoritePublications.find(pub => pub.id === id) ||
           null;
  }, [publications, favoritePublications]);

  // Update publication in cache (for optimistic updates)
  const updatePublicationCache = useCallback((publicationId: number, updates: Partial<Publication>) => {
    setPublications(prev =>
      prev.map(pub => pub.id === publicationId ? { ...pub, ...updates } : pub)
    );
    setFavoritePublications(prev =>
      prev.map(pub => pub.id === publicationId ? { ...pub, ...updates } : pub)
    );
  }, []);

  // Load favorites with caching
  const loadFavorites = useCallback(async () => {
    if (isCacheValid('favorites', CACHE_TTL.FAVORITES) && favoritePublications.length > 0) {
      console.log('📦 Using cached favorites');
      return;
    }

    setIsLoadingFavorites(true);
    try {
      const response = await apiClient.getPublicFeed({ page: 1, limit: 100 });
      const liked = response.results.filter(pub => pub.is_liked === true);
      setFavoritePublications(liked);
      lastFetchRef.current.favorites = Date.now();
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [favoritePublications.length]);

  // Refresh favorites (force reload)
  const refreshFavorites = useCallback(async () => {
    lastFetchRef.current.favorites = 0; // Invalidate cache
    await loadFavorites();
  }, [loadFavorites]);

  // Load chats with caching
  const loadChats = useCallback(async () => {
    if (isCacheValid('chats', CACHE_TTL.CHATS) && chats.length > 0) {
      console.log('📦 Using cached chats');
      return;
    }

    setIsLoadingChats(true);
    try {
      const chatList = await apiClient.getChats();
      setChats(chatList);
      lastFetchRef.current.chats = Date.now();
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, [chats.length]);

  // Refresh chats (force reload)
  const refreshChats = useCallback(async () => {
    lastFetchRef.current.chats = 0; // Invalidate cache
    await loadChats();
  }, [loadChats]);

  // Get chat by ID from cache
  const getChatById = useCallback((id: number): Chat | null => {
    return chats.find(chat => chat.id === id) || null;
  }, [chats]);

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      updateUserData({
        id: currentUser.id,
        name: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
        email: currentUser.email,
        avatar: currentUser.profile_picture_url || currentUser.profile_picture,
        phone: currentUser.phone,
        address: currentUser.address,
      });
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [updateUserData]);

  // Clear all cache
  const clearCache = useCallback(() => {
    setPublications([]);
    setFavoritePublications([]);
    setChats([]);
    lastFetchRef.current = {
      publications: 0,
      favorites: 0,
      chats: 0,
    };
  }, []);

  // Event listeners
  useEffect(() => {
    // Listen for publication like/unlike events
    const handlePublicationLiked = ({ publicationId, isLiked }: { publicationId: number; isLiked: boolean }) => {
      updatePublicationCache(publicationId, {
        is_liked: isLiked,
        likes_count: isLiked
          ? (getPublicationById(publicationId)?.likes_count || 0) + 1
          : Math.max(0, (getPublicationById(publicationId)?.likes_count || 0) - 1)
      });

      // If unliked, remove from favorites
      if (!isLiked) {
        setFavoritePublications(prev => prev.filter(pub => pub.id !== publicationId));
      }
    };

    // Listen for feed refresh events
    const handleFeedRefresh = () => {
      refreshPublications();
    };

    const handleFavoritesRefresh = () => {
      refreshFavorites();
    };

    // Listen for profile update events
    const handleProfileUpdated = () => {
      refreshUserProfile();
    };

    // Listen for chat events
    const handleNewMessage = () => {
      refreshChats();
    };

    // Subscribe to events
    const unsubLiked = appEvents.on(APP_EVENTS.PUBLICATION_LIKED, handlePublicationLiked);
    const unsubUnliked = appEvents.on(APP_EVENTS.PUBLICATION_UNLIKED, handlePublicationLiked);
    const unsubFeedRefresh = appEvents.on(APP_EVENTS.FEED_REFRESH, handleFeedRefresh);
    const unsubFavoritesRefresh = appEvents.on(APP_EVENTS.FAVORITES_REFRESH, handleFavoritesRefresh);
    const unsubProfileUpdated = appEvents.on(APP_EVENTS.PROFILE_UPDATED, handleProfileUpdated);
    const unsubNewMessage = appEvents.on(APP_EVENTS.CHAT_NEW_MESSAGE, handleNewMessage);

    // Cleanup
    return () => {
      unsubLiked();
      unsubUnliked();
      unsubFeedRefresh();
      unsubFavoritesRefresh();
      unsubProfileUpdated();
      unsubNewMessage();
    };
  }, [updatePublicationCache, getPublicationById, refreshPublications, refreshFavorites, refreshUserProfile, refreshChats]);

  // Auto-refresh on app focus (mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App is visible again, refresh stale data
        const now = Date.now();

        if (now - lastFetchRef.current.publications > CACHE_TTL.PUBLICATIONS) {
          refreshPublications();
        }
        if (now - lastFetchRef.current.favorites > CACHE_TTL.FAVORITES) {
          refreshFavorites();
        }
        if (now - lastFetchRef.current.chats > CACHE_TTL.CHATS) {
          refreshChats();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshPublications, refreshFavorites, refreshChats]);

  const value: DataContextType = {
    publications,
    feedMeta,
    loadPublications,
    refreshPublications,
    getPublicationById,
    updatePublicationCache,

    favoritePublications,
    loadFavorites,
    refreshFavorites,

    chats,
    loadChats,
    refreshChats,
    getChatById,

    refreshUserProfile,

    isLoadingPublications,
    isLoadingFavorites,
    isLoadingChats,

    clearCache,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
