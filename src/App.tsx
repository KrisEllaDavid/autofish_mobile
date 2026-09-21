import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IonApp, IonContent } from "@ionic/react";
import { App as CapacitorApp } from "@capacitor/app";

import SplashScreen from "./pages/SplashScreen";
import OnboardingPage1 from "./pages/OnboardingPage1";
import OnboardingPage2 from "./pages/OnboardingPage2";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import HomePage from "./pages/HomePage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ErrorHandlerProvider } from "./context/ErrorHandlerContext";
import { DataProvider } from "./context/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTokenValidation } from "./hooks/useTokenValidation";
import { apiClient } from "./services/api";

/**
 * One toast host for the whole app. It used to be re-declared inside each
 * branch below, which meant four mount/unmount cycles as the user moved
 * between onboarding, verification and the feed — and toasts fired during a
 * transition landed in a container that was on its way out.
 */
const Toasts = () => (
  <ToastContainer
    position="top-center"
    autoClose={3200}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    icon={false}
  />
);

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordPage, setShowResetPasswordPage] = useState(false);
  const [showSignupPage, setShowSignupPage] = useState(false);

  const {
    isLoggingOut,
    isAuthenticated,
    needsEmailVerification,
    userData,
    setNeedsEmailVerification,
    updateUserData,
    login,
  } = useAuth();
  useTokenValidation();

  const handleGoHome = useCallback(() => {
    if (!isAuthenticated) {
      setCurrentStep(2);
      setShowForgotPassword(false);
      setShowResetPasswordPage(false);
      setShowSignupPage(false);
    }
  }, [isAuthenticated]);

  // Deep link back from the verification email.
  useEffect(() => {
    const handleAppUrlOpen = async (event: { url: string }) => {
      const url = event.url;

      if (url.includes("verify-email") && url.includes("success=true")) {
        toast.success("Email vérifié avec succès !");
        setNeedsEmailVerification(false);

        if (userData?.email && userData?.password) {
          try {
            await login({ email: userData.email, password: userData.password });
            updateUserData({ password: undefined });
            return;
          } catch {
            // Fall through to refreshing the profile instead.
          }
        }

        try {
          const currentUser = await apiClient.getCurrentUser();
          if (currentUser) {
            updateUserData({
              email_verified: true,
              is_verified: currentUser.is_verified,
            });
          }
        } catch {
          // Nothing actionable: the user is already past verification.
        }
      }
    };

    CapacitorApp.addListener("appUrlOpen", handleAppUrlOpen);
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [setNeedsEmailVerification, updateUserData, login, userData]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Logging out returns the user to the start of the flow.
  useEffect(() => {
    if (!isLoggingOut) return;

    setShowSplash(true);
    setCurrentStep(0);
    setShowForgotPassword(false);
    setShowResetPasswordPage(false);
    setShowSignupPage(false);

    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [isLoggingOut]);

  const handleNext = () => setCurrentStep((step) => step + 1);
  const handlePrevious = () => setCurrentStep((step) => Math.max(0, step - 1));

  const renderScreen = () => {
    if (showSplash) return <SplashScreen />;

    // Verification is checked before authentication on purpose: a user with
    // valid tokens but an unverified address must not reach the feed.
    if (needsEmailVerification && userData?.email) {
      return (
        <EmailVerificationPage
          email={userData.email}
          onVerified={() => setNeedsEmailVerification(false)}
        />
      );
    }

    if (isAuthenticated) return <HomePage />;

    if (currentStep === 0) {
      return <OnboardingPage1 activeIndex={0} onNext={handleNext} />;
    }

    if (currentStep === 1) {
      return (
        <OnboardingPage2
          activeIndex={1}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }

    if (showSignupPage) {
      return <SignupPage onBack={() => setShowSignupPage(false)} />;
    }

    if (showForgotPassword) {
      return showResetPasswordPage ? (
        <ResetPasswordPage onBack={() => setShowResetPasswordPage(false)} />
      ) : (
        <ForgotPasswordPage
          onBack={() => setShowForgotPassword(false)}
          onSubmit={() => setShowResetPasswordPage(true)}
        />
      );
    }

    return (
      <LoginPage
        onForgotPassword={() => setShowForgotPassword(true)}
        onSignup={() => setShowSignupPage(true)}
      />
    );
  };

  return (
    <ErrorHandlerProvider onGoHome={handleGoHome}>
      <IonContent>
        {!showSplash && <Toasts />}
        {renderScreen()}
      </IonContent>
    </ErrorHandlerProvider>
  );
}

function App() {
  return (
    <IonApp>
      <ErrorBoundary>
        <AuthProvider>
          <LoadingProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </LoadingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </IonApp>
  );
}

export default App;
