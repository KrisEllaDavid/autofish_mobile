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
            <ErrorIcon aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--danger-600)"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3.8 21 19.2H3z" />
                <path d="M12 10v4M12 16.8v.2" />
              </svg>
            </ErrorIcon>
            <ErrorTitle>Une erreur est survenue</ErrorTitle>
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

// Styled components, reading from the token layer so this overlay matches
// the rest of the app rather than carrying its own palette.
const ErrorOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--space-8) + var(--safe-top)) var(--gutter)
    calc(var(--space-8) + var(--safe-bottom));
  background: var(--surface-scrim);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: af-fade-in var(--dur-base) var(--ease-out) both;
`;

const ErrorModal = styled.div`
  width: 100%;
  max-width: 380px;
  padding: var(--space-9) var(--space-8) var(--space-8);
  background: var(--surface-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: center;
  animation: af-dialog-in var(--dur-base) var(--ease-out) both;
`;

const ErrorIcon = styled.div`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: 0 auto var(--space-7);
  border-radius: var(--radius-circle);
  background: var(--danger-soft);

  svg {
    width: 32px;
    height: 32px;
  }
`;

const ErrorTitle = styled.h2`
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
`;

const ErrorMessage = styled.p`
  margin-top: var(--space-5);
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  text-wrap: pretty;
`;

const GoHomeButton = styled.button`
  width: 100%;
  min-height: 52px;
  margin-top: var(--space-8);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--surface-brand-strong);
  color: var(--text-on-brand);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-brand);
  transition: background-color var(--dur-press) var(--ease-out),
    transform var(--dur-press) var(--ease-out);

  &:active {
    transform: scale(0.98);
    background: var(--brand-800);
  }
`;
