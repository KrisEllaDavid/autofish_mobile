import React, { createContext, useContext, useState, ReactNode } from 'react';
import styled from 'styled-components';

interface ErrorHandlerContextType {
  showError: (message: string, isAuthError?: boolean) => void;
  clearError: () => void;
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined);

interface ErrorHandlerProviderProps {
  children: ReactNode;
  onGoHome?: () => void;
}

export const ErrorHandlerProvider: React.FC<ErrorHandlerProviderProps> = ({ children, onGoHome }) => {
  const [error, setError] = useState<{ message: string; isAuthError: boolean } | null>(null);

  const showError = (message: string, isAuthError: boolean = false) => {
    setError({ message, isAuthError });
  };

  const clearError = () => {
    setError(null);
  };

  const handleGoHome = () => {
    clearError();
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <ErrorHandlerContext.Provider value={{ showError, clearError }}>
      {children}
      {error && !error.isAuthError && (
        <ErrorOverlay>
          <ErrorModal>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Oops!</ErrorTitle>
            <ErrorMessage>{error.message || "Quelque chose s'est mal passé"}</ErrorMessage>
            <GoHomeButton onClick={handleGoHome}>
              Retour à l'accueil
            </GoHomeButton>
          </ErrorModal>
        </ErrorOverlay>
      )}
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = (): ErrorHandlerContextType => {
  const context = useContext(ErrorHandlerContext);
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
  }
  return context;
};

// Helper function to handle API errors globally
export const handleApiError = (error: any, showErrorFn: (message: string, isAuthError?: boolean) => void) => {
  // Check if it's an authentication error
  const isAuthError =
    error?.status === 401 ||
    error?.detail?.toLowerCase().includes('authentication') ||
    error?.detail?.toLowerCase().includes('token') ||
    error?.detail?.toLowerCase().includes('unauthorized');

  if (isAuthError) {
    // Auth errors are handled automatically by the API client
    // Don't show error popup for these
    return;
  }

  // For all other errors, show the error popup
  let errorMessage = 'Une erreur est survenue';

  if (error?.detail) {
    errorMessage = error.detail;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  showErrorFn(errorMessage, false);
};

// Styled Components
const ErrorOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ErrorModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 90%;
  width: 320px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const GoHomeButton = styled.button`
  background: #00B2D6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #0098b8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
