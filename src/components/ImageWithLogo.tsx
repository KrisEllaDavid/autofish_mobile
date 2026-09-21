import React from "react";

interface ImageWithLogoProps {
  imageSrc: string;
  imageAlt: string;
  logoSrc: string;
  logoAlt: string;
}

const ImageWithLogo: React.FC<ImageWithLogoProps> = ({
  imageSrc,
  imageAlt,
  logoSrc,
  logoAlt,
}) => (
  <div className="ob-hero">
    <img src={imageSrc} alt={imageAlt} className="ob-hero__image" />
    <img src={logoSrc} alt={logoAlt} className="ob-hero__logo" />
  </div>
);

export default ImageWithLogo;
