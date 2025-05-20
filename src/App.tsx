import React, { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SplashScreen from "./pages/SplashScreen";
import OnboardingPage1 from "./pages/OnboardingPage1";
import OnboardingPage2 from "./pages/OnboardingPage2";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import { animations, fontFaces } from "./components/styles";
import { AuthProvider } from "./context/AuthContext";

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

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordPage, setShowResetPasswordPage] = useState(false);
  const [showSignupPage, setShowSignupPage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (showSplash) {
    return (
      <>
        <GlobalStyle />
        <SplashScreen />
      </>
    );
  }

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
