import { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IonApp, IonContent } from "@ionic/react";
import SplashScreen from "./pages/SplashScreen";
import OnboardingPage1 from "./pages/OnboardingPage1";
import OnboardingPage2 from "./pages/OnboardingPage2";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import { animations, fontFaces } from "./components/styles";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

const GlobalStyle = createGlobalStyle`
  ${animations.fadeInOnboard}
  ${animations.fadeIn}
  ${animations.blink}
  ${fontFaces}

  /* Toast styles */
  .Toastify__toast {
    border-radius: 12px;
    font-family: inherit;
    font-size: 14px;
    padding: 16px;
    margin-bottom: 8px;
  }

  .Toastify__toast--error {
    background: #fff;
    color: #e74c3c;
    border: 1px solid #e74c3c;
  }

  .Toastify__toast--success {
    background: #fff;
    color: #2ecc71;
    border: 1px solid #2ecc71;
  }

  .Toastify__toast-body {
    font-weight: 500;
  }
`;

// Inner component that can access AuthContext
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordPage, setShowResetPasswordPage] = useState(false);
  const [showSignupPage, setShowSignupPage] = useState(false);
  const { isLoggingOut, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset app state when user logs out
  useEffect(() => {
    if (isLoggingOut) {
      setShowSplash(true);
      setCurrentStep(0);
      setShowForgotPassword(false);
      setShowResetPasswordPage(false);
      setShowSignupPage(false);
      
      // Reset splash screen after a brief moment
      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    }
  }, [isLoggingOut]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (showSplash) {
    return (
      <IonContent>
        <GlobalStyle />
        <SplashScreen />
      </IonContent>
    );
  }

  // If user is authenticated, show HomePage
  if (isAuthenticated) {
    return (
      <IonContent>
        <GlobalStyle />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <HomePage />
      </IonContent>
    );
  }

  return (
    <IonContent>
        <GlobalStyle />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {currentStep === 0 && (
          <OnboardingPage1 activeIndex={0} onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <OnboardingPage2
            activeIndex={1}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentStep === 2 && !showForgotPassword && !showSignupPage && (
          <div
            style={{
              animation: "fadeInOnboard 0.7s cubic-bezier(.4,0,.2,1) both",
            }}
          >
            <LoginPage
              onForgotPassword={() => setShowForgotPassword(true)}
              onSignup={() => setShowSignupPage(true)}
            />
          </div>
        )}
        {currentStep === 2 && showSignupPage && (
          <div
            style={{
              animation: "fadeInOnboard 0.7s cubic-bezier(.4,0,.2,1) both",
            }}
          >
            <SignupPage onBack={() => setShowSignupPage(false)} />
          </div>
        )}
        {currentStep === 2 && showForgotPassword && !showResetPasswordPage && (
          <div
            style={{
              animation: "fadeInOnboard 0.7s cubic-bezier(.4,0,.2,1) both",
            }}
          >
            <ForgotPasswordPage
              onBack={() => setShowForgotPassword(false)}
              onSubmit={() => setShowResetPasswordPage(true)}
            />
          </div>
        )}
        {currentStep === 2 && showForgotPassword && showResetPasswordPage && (
          <div
            style={{
              animation: "fadeInOnboard 0.7s cubic-bezier(.4,0,.2,1) both",
            }}
          >
            <ResetPasswordPage onBack={() => setShowResetPasswordPage(false)} />
          </div>
        )}
    </IonContent>
  );
}

// Main App wrapper
function App() {
  return (
    <IonApp>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </IonApp>
  );
}

export default App;
