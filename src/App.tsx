import React, { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import SplashScreen from "./pages/SplashScreen";
import OnboardingPage1 from "./pages/OnboardingPage1";
import OnboardingPage2 from "./pages/OnboardingPage2";
import { animations, fontFaces } from "./components/styles";

const GlobalStyle = createGlobalStyle`
  ${animations.fadeInOnboard}
  ${animations.fadeIn}
  ${animations.blink}
  ${fontFaces}
`;

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

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
    <>
      <GlobalStyle />
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
    </>
  );
}

export default App;
