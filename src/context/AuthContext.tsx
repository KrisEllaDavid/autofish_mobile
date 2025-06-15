import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { authService, UserRegistrationRequest, LoginRequest, ApiError, ApiClient } from '../services/api';

// Define the user data structure based on usage patterns in the app
export interface UserData {
  name?: string;
  email?: string;
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
    // Check if user is authenticated based on userData presence
    setIsAuthenticated(userData !== null && userData.email !== undefined);
  }, [userData]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserDataState(prevData => {
      if (!prevData) {
        return data as UserData;
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
        } else if (data[typedKey] !== undefined) {
          // Safe assignment for remaining properties
          if (data[typedKey] !== undefined) {
            (updatedData as Record<string, unknown>)[typedKey] = data[typedKey];
          }
        }
      });
      
      return updatedData;
    });
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Convert API UserType to our UserData format
      const mappedUserData: UserData = {
        name: `${response.user.first_name} ${response.user.last_name}`.trim(),
        email: response.user.email,
        avatar: response.user.profile_picture_url,
        userRole: response.user.user_type === 'producer' ? 'producteur' : 'client',
        description: response.user.description,
        country: response.user.country,
        address: response.user.address,
        phone: response.user.phone,
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
      const response = await authService.register(registrationData);
      
      // For producers, they need email verification, so don't auto-login
      // For consumers, they can login immediately after registration
      if (registrationData.user_type === 'consumer' && response.user.is_active) {
        // Auto-login after successful consumer registration
        await login({
          email: registrationData.email,
          password: registrationData.password
        });
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
      await authService.logout();
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

  const value: AuthContextType = {
    userData,
    updateUserData,
    login,
    register,
    logout,
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
