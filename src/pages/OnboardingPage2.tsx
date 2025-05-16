import React from "react";
import { animations } from "../components/styles";
import ImageWithLogo from "../components/ImageWithLogo";
import TextContent from "../components/TextContent";
import ProgressDots from "../components/ProgressDots";
import NextButton from "../components/NextButton";
import SwipeableContainer from "../components/SwipeableContainer";

interface OnboardingPage2Props {
  activeIndex: number;
  onNext: () => void;
  onPrevious?: () => void;
}

const OnboardingPage2: React.FC<OnboardingPage2Props> = ({
  activeIndex,
  onNext,
  onPrevious,
}) => (
  <SwipeableContainer onSwipeLeft={onNext} onSwipeRight={onPrevious}>
    <style>{animations.fadeInOnboard}</style>
    <div style={{ height: 20, flexShrink: 0 }} />

    <ImageWithLogo
      imageSrc="/icons/onboarding_image_2.png"
      imageAlt="Onboarding"
      logoSrc="/icons/autofish_white_logo.svg"
      logoAlt="Logo"
    />

    <TextContent
      title="Facile à utiliser !"
      description="Explorez notre catalogue varié grâce à une interface intuitive et facile à utiliser. Commandez vos poissons préférés en quelques clics seulement."
    />

    <div style={{ flex: 1, minHeight: 16 }} />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "90vw",
        padding: "0 3vw",
        maxWidth: 340,
        margin: "0 auto 20vw auto",
        animation: "fadeInOnboard 0.7s 0.2s cubic-bezier(.4,0,.2,1) both",
        boxSizing: "border-box",
      }}
    >
      <ProgressDots activeIndex={activeIndex} totalSteps={2} />
      <div style={{ flex: 1 }} />
      <NextButton onClick={onNext} isLastStep />
    </div>
  </SwipeableContainer>
);

export default OnboardingPage2;
