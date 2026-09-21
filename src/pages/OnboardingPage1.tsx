import React from "react";
import ImageWithLogo from "../components/ImageWithLogo";
import TextContent from "../components/TextContent";
import ProgressDots from "../components/ProgressDots";
import NextButton from "../components/NextButton";
import SwipeableContainer from "../components/SwipeableContainer";
import "./Onboarding.css";

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
    <ImageWithLogo
      imageSrc="/icons/onboarding_image_1.png"
      imageAlt="Poissons frais sélectionnés par les pêcheurs Autofish"
      logoSrc="/icons/autofish_white_logo.svg"
      logoAlt="Autofish"
    />

    <TextContent
      title="Bienvenue sur Autofish Store !"
      description="Découvrez la fraîcheur de la mer à votre table avec Autofish Store. Trouvez une large sélection de poissons de qualité supérieure, directement des meilleurs pêcheurs."
    />

    <div className="ob-footer">
      <ProgressDots activeIndex={activeIndex} totalSteps={2} />
      <div className="af-spacer" />
      <NextButton onClick={onNext} />
    </div>
  </SwipeableContainer>
);

export default OnboardingPage1;
