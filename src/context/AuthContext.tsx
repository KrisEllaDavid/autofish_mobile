import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { apiClient, UserRegistrationRequest, LoginRequest, ApiError, ApiClient } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUtils';

// Define the user data structure based on usage patterns in the app
export interface UserData {
  name?: string;
  email?: string;
  password?: string; // Store password for API registration
  avatar?: string;
  profile_picture?: File | string;
  userRole?: 'client' | 'producteur';
  description?: string;
  country?: string;
  code?: string;
  address?: string;
  city?: string; // Add city field for registration
  phone?: string;
  idRecto?: string | null;
  idVerso?: string | null;
  selectedCategories?: string[];
  registrationComplete?: boolean; // Track if registration is complete
  // Verification fields from API
  is_verified?: boolean;
  email_verified?: boolean;
  is_active?: boolean;
  // New fields for producer verification status
  access_level?: 'full' | 'limited' | 'admin';
  status_message?: string;
  page?: {
    pageName?: string;
    banner?: string;
    address?: string;
    phone?: string;
    country?: string;
    code?: string;
  };
  myPosts?: Array<{
    id: string;
    producerName: string;
    producerAvatar: string;
    postImage: string;
    description: string;
    date: string;
    likes: number;
    comments: number;
    category: string;
    location: string;
    price: number;
    lastModified?: string;
    isLiked?: boolean;
  }>;
}

interface AuthContextType {
  userData: UserData | null;
  updateUserData: (data: Partial<UserData>) => void;
  logout: () => void;
  login: (credentials: LoginRequest) => Promise<UserData | void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  completeRegistration: () => void; // Mark registration as complete
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  getAccessToken: () => string | null; // Add method to get current access token
  needsEmailVerification: boolean; // Track if email verification is needed
  setNeedsEmailVerification: (needs: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserDataState] = useLocalStorage<UserData | null>('userData', null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState<boolean>(false);


  useEffect(() => {
    // Check if user is authenticated based on both userData and stored tokens
    const hasValidTokens = apiClient.isAuthenticated();
    const hasUserData = userData !== null && userData.email !== undefined && userData.registrationComplete === true;
    setIsAuthenticated(hasValidTokens && hasUserData);
  }, [userData]);

  // Load tokens from localStorage on initialization
  useEffect(() => {
    // Check if we have tokens but no user data - this can happen after app refresh
    if (apiClient.isAuthenticated() && !userData) {
      // Try to fetch current user data if we have valid tokens
      const fetchCurrentUser = async () => {
        try {
          const currentUser = await apiClient.getCurrentUser();
          
          // Debug logging for mobile
          if (import.meta.env.DEV) {
            console.log('📱 Fetched current user:', currentUser);
          }
          
          // Safely access user properties with comprehensive fallbacks
          const mappedUserData: UserData = {
            name: currentUser ?
              `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
              currentUser.email || 'User' : 'User',
            email: currentUser?.email || '',
            avatar: normalizeImageUrl(currentUser?.profile_picture_url || currentUser?.profile_picture || ''),
            userRole: currentUser?.user_type === 'producer' ? 'producteur' : 'client',
            description: currentUser?.description || '',
            country: currentUser?.country || '',
            code: '',
            address: currentUser?.address || currentUser?.city || '',
            phone: currentUser?.phone || '',
            registrationComplete: true,
            is_verified: currentUser?.is_verified || false,
            email_verified: currentUser?.email_verified || false,
            is_active: currentUser?.is_active || false,
            access_level: currentUser?.access_level || 'limited',
            status_message: currentUser?.status_message || '',
            selectedCategories: [],
            myPosts: [],
            // For producers, initialize basic page data (will be fetched from API)
            page: currentUser?.user_type === 'producer' ? {
              pageName: `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Ma Page',
              banner: '',
              address: currentUser?.address || currentUser?.city || '',
              phone: currentUser?.phone || '',
              country: currentUser?.country || '',
              code: ''
            } : undefined
          };
          setUserDataState(mappedUserData);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('📱 Error fetching current user:', error);
          }
          // If we can't fetch user data, clear the invalid tokens
          apiClient.logout();
        }
      };
      
      fetchCurrentUser();
    }
  }, [setUserDataState, userData]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserDataState(prevData => {
      if (!prevData) {
        const newUserData = data as UserData;
        // Don't authenticate during registration - only when registrationComplete is true
        if (newUserData.registrationComplete) {
          setIsAuthenticated(newUserData.email !== undefined && apiClient.isAuthenticated());
        }
        return newUserData;
      }
      
      // Deep merge for nested objects like page
      const updatedData = { ...prevData };
      
      Object.keys(data).forEach(key => {
        const typedKey = key as keyof UserData;
        if (typedKey === 'page' && data.page && prevData.page) {
          updatedData.page = { ...prevData.page, ...data.page };
        } else if (typedKey === 'myPosts' && data.myPosts) {
          updatedData.myPosts = data.myPosts;
        } else if (typedKey === 'selectedCategories' && data.selectedCategories) {
          updatedData.selectedCategories = data.selectedCategories;
        } else {
          // Type-safe assignment for known properties
          (updatedData as Record<string, unknown>)[typedKey] = (data as Record<string, unknown>)[typedKey];
        }
      });

      // Only authenticate if registration is complete and we have valid tokens
      if (updatedData.registrationComplete) {
        setIsAuthenticated(updatedData.email !== undefined && apiClient.isAuthenticated());
      }
      return updatedData;
    });
  };

  const login = async (credentials: LoginRequest): Promise<UserData | void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login(credentials);
      
      // Debug logging for mobile
      if (import.meta.env.DEV) {
        console.log('📱 Login response:', response);
        console.log('📱 Login user data:', response?.user);
      }
      
      // The apiClient.login() already saves tokens internally, 
      // so we don't need to manually handle token storage here
      
      // Convert API UserType to our UserData format with comprehensive null safety
      const user = response?.user;
      if (!user) {
        throw new Error('Invalid login response: missing user data');
      }
      
      const mappedUserData: UserData = {
        name: user ?
          `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
          user.email || 'User' : 'User',
        email: user?.email || '',
        avatar: normalizeImageUrl(user?.profile_picture_url || user?.profile_picture || ''),
        userRole: user?.user_type === 'producer' ? 'producteur' : 'client',
        description: user?.description || '',
        country: user?.country || '',
        code: '', // Country code is not stored in API user object
        address: user?.address || user?.city || '',
        phone: user?.phone || '',
        registrationComplete: true, // User is authenticated via login
        // Map verification fields from API
        is_verified: user?.is_verified || false,
        email_verified: user?.email_verified || false,
        is_active: user?.is_active || true,
        access_level: user?.access_level || 'limited',
        status_message: user?.status_message || '',
        // Initialize other fields as needed
        selectedCategories: [],
        myPosts: [],
        // For producers, initialize basic page data (will be fetched from API)
        page: user?.user_type === 'producer' ? {
          pageName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Ma Page',
          banner: '',
          address: user?.address || user?.city || '',
          phone: user?.phone || '',
          country: user?.country || '',
          code: ''
        } : undefined
      };
      
      if (import.meta.env.DEV) {
        console.log('📱 Mapped user data:', mappedUserData);
      }
      
      setUserDataState(mappedUserData);

      // Check if email verification is needed
      if (!user.email_verified) {
        setNeedsEmailVerification(true);
        setIsAuthenticated(false);
        // Store partial user data for verification page
        return mappedUserData;
      }

      setIsAuthenticated(true);
      setNeedsEmailVerification(false);

      return mappedUserData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'object' && err !== null ? 
        ApiClient.getErrorMessage(err as ApiError) : 
        'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registrationData: UserRegistrationRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.register(registrationData);
      
      // Debug logging for mobile
      if (import.meta.env.DEV) {
        console.log('📱 Register response:', response);
        console.log('📱 Register user data:', response?.user);
      }
      
      // Convert API UserType to our UserData format with comprehensive null safety
      const user = response?.user;
      if (!user) {
        throw new Error('Invalid registration response: missing user data');
      }
      
      const mappedUserData: UserData = {
        name: user ?
          `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
          user.email || 'User' : 'User',
        email: user?.email || '',
        avatar: normalizeImageUrl(user?.profile_picture_url || user?.profile_picture || ''),
        userRole: user?.user_type === 'producer' ? 'producteur' : 'client',
        description: user?.description || '',
        country: user?.country || '',
        code: '', // Country code is not returned by API, will be empty after registration
        address: user?.address || user?.city || '',
        phone: user?.phone || '',
        // Map verification fields from API
        is_verified: user?.is_verified || false,
        email_verified: user?.email_verified || false,
        is_active: user?.is_active || false,
        access_level: user?.access_level || 'limited',
        status_message: user?.status_message || '',
        // Initialize other fields as needed
        selectedCategories: [],
        myPosts: [],
        // For producers, initialize basic page data (will be fetched from API)
        page: user?.user_type === 'producer' ? {
          pageName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Ma Page',
          banner: '',
          address: user?.address || user?.city || '',
          phone: user?.phone || '',
          country: user?.country || '',
          code: ''
        } : undefined
      };
      
      // Don't include password in the stored user data after registration
      delete (mappedUserData as any).password;
      
      // Auto-login handling
      const hasTokens = (response as any)?.tokens?.access && (response as any)?.tokens?.refresh;
      if (hasTokens) {
        // Check if user needs email verification
        if (user?.email_verified === false) {
          // User is registered but needs email verification
          mappedUserData.registrationComplete = false;
          setUserDataState(mappedUserData);
          setIsAuthenticated(false);
          setNeedsEmailVerification(true);
        } else {
          // Tokens present and email verified
          mappedUserData.registrationComplete = true;
          setUserDataState(mappedUserData);
          setIsAuthenticated(true);
          setNeedsEmailVerification(false);
        }
      } else {
        // Fallback: attempt login explicitly using submitted credentials
        try {
          if (registrationData.email && registrationData.password) {
            const loginResponse = await apiClient.login({
              email: registrationData.email,
              password: registrationData.password,
            });

            const loggedInUser = loginResponse?.user;
            const postLoginUserData: UserData = {
              name: loggedInUser ?
                `${loggedInUser.first_name || ''} ${loggedInUser.last_name || ''}`.trim() ||
                loggedInUser.email || 'User' : 'User',
              email: loggedInUser?.email || mappedUserData.email,
              avatar: normalizeImageUrl(loggedInUser?.profile_picture_url || loggedInUser?.profile_picture || mappedUserData.avatar),
              userRole: loggedInUser?.user_type === 'producer' ? 'producteur' : 'client',
              description: loggedInUser?.description || mappedUserData.description,
              country: loggedInUser?.country || mappedUserData.country,
              code: '',
              address: loggedInUser?.address || loggedInUser?.city || mappedUserData.address,
              phone: loggedInUser?.phone || mappedUserData.phone,
              registrationComplete: true,
              selectedCategories: [],
              myPosts: [],
              // For producers, initialize basic page data (will be fetched from API)
              page: loggedInUser?.user_type === 'producer' ? {
                pageName: `${loggedInUser?.first_name || ''} ${loggedInUser?.last_name || ''}`.trim() || 'Ma Page',
                banner: '',
                address: loggedInUser?.address || loggedInUser?.city || '',
                phone: loggedInUser?.phone || '',
                country: loggedInUser?.country || '',
                code: ''
              } : undefined
            };

            // Check if logged-in user needs email verification
            if (loggedInUser?.email_verified === false) {
              postLoginUserData.registrationComplete = false;
              setUserDataState(postLoginUserData);
              setIsAuthenticated(false);
              setNeedsEmailVerification(true);
            } else {
              postLoginUserData.registrationComplete = true;
              setUserDataState(postLoginUserData);
              setIsAuthenticated(true);
              setNeedsEmailVerification(false);
            }
          } else {
            // As a last resort, check email verification status
            if (user?.email_verified === false) {
              mappedUserData.registrationComplete = false;
              setUserDataState(mappedUserData);
              setIsAuthenticated(false);
              setNeedsEmailVerification(true);
            } else if (registrationData.user_type === 'consumer') {
              mappedUserData.registrationComplete = true;
              setUserDataState(mappedUserData);
              setIsAuthenticated(true);
              setNeedsEmailVerification(false);
            } else {
              mappedUserData.registrationComplete = false;
              setUserDataState(mappedUserData);
              setIsAuthenticated(false);
              setNeedsEmailVerification(false);
            }
          }
        } catch {
          // If explicit login fails, fall back to role-based behavior with email verification check
          if (user?.email_verified === false) {
            mappedUserData.registrationComplete = false;
            setUserDataState(mappedUserData);
            setIsAuthenticated(false);
            setNeedsEmailVerification(true);
          } else if (registrationData.user_type === 'consumer') {
            mappedUserData.registrationComplete = true;
            setUserDataState(mappedUserData);
            setIsAuthenticated(true);
            setNeedsEmailVerification(false);
          } else {
            mappedUserData.registrationComplete = false;
            setUserDataState(mappedUserData);
            setIsAuthenticated(false);
            setNeedsEmailVerification(false);
          }
        }
      }
      
       // Note: Producers may still require email verification; auto-login occurs if tokens are provided
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'object' && err !== null ? 
        ApiClient.getErrorMessage(err as ApiError) : 
        'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setIsLoading(true);
    
    try {
      // Call API logout to invalidate tokens (this also clears tokens from apiClient)
      await apiClient.logout();
    } catch {
      console.warn('API logout failed, but continuing with local cleanup');
    }
    
    // Clear all user data
    setUserDataState(null);
    setIsAuthenticated(false);
    setNeedsEmailVerification(false);
    
    // Clear other app data from localStorage
    localStorage.removeItem('myPosts');
    localStorage.removeItem('likedPosts');
    localStorage.removeItem('selectedCategories');
    
    // Clear any other cached data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('autofish_') || key.startsWith('app_')) {
        localStorage.removeItem(key);
      }
    });
    
    setIsLoading(false);
    
    // isLoggingOut flag will trigger app reset in App.tsx
    // Reset isLoggingOut after logout process completes
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 3000);
  };

  const clearError = () => {
    setError(null);
  };

  const completeRegistration = () => {
    setUserDataState(prevData => {
      if (prevData) {
        const updatedData = { ...prevData, registrationComplete: true };
        setIsAuthenticated(apiClient.isAuthenticated());
        return updatedData;
      }
      return prevData;
    });
  };

  const getAccessToken = () => {
    return apiClient.getAccessToken();
  };

  const value: AuthContextType = {
    userData,
    updateUserData,
    logout,
    login,
    register,
    completeRegistration,
    isAuthenticated,
    isLoggingOut,
    isLoading,
    error,
    clearError,
    getAccessToken,
    needsEmailVerification,
    setNeedsEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
