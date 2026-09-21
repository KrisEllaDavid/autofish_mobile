import React from "react";
import ImageWithLogo from "../components/ImageWithLogo";
import TextContent from "../components/TextContent";
import ProgressDots from "../components/ProgressDots";
import NextButton from "../components/NextButton";
import SwipeableContainer from "../components/SwipeableContainer";
import "./Onboarding.css";

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
    <ImageWithLogo
      imageSrc="/icons/onboarding_image_2.png"
      imageAlt="Commande de poisson depuis l'application Autofish"
      logoSrc="/icons/autofish_white_logo.svg"
      logoAlt="Autofish"
    />

    <TextContent
      title="Facile à utiliser !"
      description="Explorez notre catalogue varié grâce à une interface intuitive. Commandez vos poissons préférés en quelques clics seulement."
    />

    <div className="ob-footer">
      <ProgressDots activeIndex={activeIndex} totalSteps={2} />
      <div className="af-spacer" />
      <NextButton onClick={onNext} isLastStep />
    </div>
  </SwipeableContainer>
);

export default OnboardingPage2;
