import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [_loadingCount, setLoadingCount] = useState(0); // Used for tracking multiple concurrent requests

  const showLoading = () => {
    setLoadingCount(prev => prev + 1);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setLoadingCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsLoading(false);
        return 0;
      }
      return newCount;
    });
  };

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    showLoading();
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 