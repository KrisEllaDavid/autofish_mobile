import "./ErrorBoundary.css";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real app, you would log this to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <div className="error-boundary__icon" aria-hidden="true">
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
            </div>

            <h2 className="error-boundary__title">
              Une erreur est survenue
            </h2>
            <p className="error-boundary__text">
              L&apos;application a rencontré un problème inattendu. Revenez à
              l&apos;accueil pour reprendre.
            </p>

            <button
              type="button"
              className="af-btn af-btn--primary af-btn--lg"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
