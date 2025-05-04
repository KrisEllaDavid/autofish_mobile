import React from "react";
import { animations } from "../components/styles";
import ImageWithLogo from "../components/ImageWithLogo";
import TextContent from "../components/TextContent";
import ProgressDots from "../components/ProgressDots";
import NextButton from "../components/NextButton";
import SwipeableContainer from "../components/SwipeableContainer";

interface OnboardingPage1Props {
  activeIndex: number;
  onNext: () => void;
  onPrevious?: () => void;
}

const OnboardingPage1: React.FC<OnboardingPage1Props> = ({
  activeIndex,
  onNext,
  onPrevious,
}) => (
  <SwipeableContainer onSwipeLeft={onNext} onSwipeRight={onPrevious}>
    <style>{animations.fadeInOnboard}</style>
    <div style={{ height: 100, flexShrink: 0 }} />

    <ImageWithLogo
      imageSrc="/icons/onboarding_image_1.png"
      imageAlt="Onboarding"
      logoSrc="/icons/autofish_white_logo.svg"
      logoAlt="Logo"
    />

    <TextContent
      title="Bienvenue sur Auto-Fish Store !"
      description="Découvrez la fraîcheur de la mer à votre table avec Autofish Store. Trouvez une large sélection de poissons de qualité supérieure, directement des meilleurs pêcheurs"
    />

    <div style={{ flex: 1, minHeight: 16 }} />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "90vw",
        padding: "0 3vw",
        maxWidth: 340,
        margin: "0 auto calc(18px + 15vw) auto",
        animation: "fadeInOnboard 0.7s 0.2s cubic-bezier(.4,0,.2,1) both",
        boxSizing: "border-box",
      }}
    >
      <ProgressDots activeIndex={activeIndex} totalSteps={2} />
      <div style={{ flex: 1 }} />
      <NextButton onClick={onNext} />
    </div>
  </SwipeableContainer>
);

export default OnboardingPage1;
