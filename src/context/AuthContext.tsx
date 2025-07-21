import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { apiClient, UserRegistrationRequest, LoginRequest, ApiError, ApiClient } from '../services/api';

// Define the user data structure based on usage patterns in the app
export interface UserData {
  name?: string;
  email?: string;
  password?: string; // Store password for API registration
  avatar?: string;
  userRole?: 'client' | 'producteur';
  description?: string;
  country?: string;
  code?: string;
  address?: string;
  phone?: string;
  idRecto?: string | null;
  idVerso?: string | null;
  selectedCategories?: string[];
  registrationComplete?: boolean; // Track if registration is complete
  // Verification fields from API
  is_verified?: boolean;
  email_verified?: boolean;
  is_active?: boolean;
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
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  completeRegistration: () => void; // Mark registration as complete
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
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

  useEffect(() => {
    // Check if user is authenticated based on userData presence and registration completion
    setIsAuthenticated(userData !== null && userData.email !== undefined && userData.registrationComplete === true);
  }, [userData]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserDataState(prevData => {
      if (!prevData) {
        const newUserData = data as UserData;
        // Don't authenticate during registration - only when registrationComplete is true
        if (newUserData.registrationComplete) {
          setIsAuthenticated(newUserData.email !== undefined);
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
          (updatedData as any)[typedKey] = (data as any)[typedKey];
        }
      });

      // Only authenticate if registration is complete
      if (updatedData.registrationComplete) {
        setIsAuthenticated(updatedData.email !== undefined);
      }
      return updatedData;
    });
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login(credentials);
      
      // Convert API UserType to our UserData format
      const mappedUserData: UserData = {
        name: `${response.user.first_name} ${response.user.last_name}`.trim(),
        email: response.user.email,
        avatar: response.user.profile_picture_url || response.user.profile_picture || '',
        userRole: response.user.user_type === 'producer' ? 'producteur' : 'client',
        description: response.user.description || '',
        country: response.user.country || '',
        code: '', // Country code is not stored in API user object
        address: response.user.address || response.user.city || '',
        phone: response.user.phone || '',
        registrationComplete: true, // User is authenticated via login
        // Map verification fields from API
        is_verified: response.user.is_verified,
        email_verified: response.user.email_verified,
        is_active: response.user.is_active,
        // Initialize other fields as needed
        selectedCategories: [],
        myPosts: []
      };
      
      setUserDataState(mappedUserData);
      setIsAuthenticated(true);
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
      
      // Convert API UserType to our UserData format
      const mappedUserData: UserData = {
        name: `${response.user.first_name} ${response.user.last_name}`.trim(),
        email: response.user.email,
        avatar: response.user.profile_picture_url || response.user.profile_picture || '',
        userRole: response.user.user_type === 'producer' ? 'producteur' : 'client',
        description: response.user.description || '',
        country: response.user.country || '',
        code: '', // Country code is not returned by API, will be empty after registration
        address: response.user.address || response.user.city || '',
        phone: response.user.phone || '',
        // Initialize other fields as needed
        selectedCategories: [],
        myPosts: []
      };
      
      // Don't include password in the stored user data after registration
      delete (mappedUserData as any).password;
      
      // For consumers, they can use the app immediately after registration
      if (registrationData.user_type === 'consumer') {
        mappedUserData.registrationComplete = true; // Mark registration as complete
        setUserDataState(mappedUserData);
        setIsAuthenticated(true);
      }
      
      // Note: Producers will need to verify email before they can login
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
      // Call API logout to invalidate tokens
      await apiClient.logout();
    } catch {
      console.warn('API logout failed, but continuing with local cleanup');
    }
    
    // Clear all user data
    setUserDataState(null);
    setIsAuthenticated(false);
    
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
        setIsAuthenticated(true);
        return updatedData;
      }
      return prevData;
    });
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
    clearError
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
