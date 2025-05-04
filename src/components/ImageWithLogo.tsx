import React from "react";
import { commonStyles } from "./styles";

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
}) => {
  return (
    <div style={commonStyles.imageContainer}>
      <img src={imageSrc} alt={imageAlt} style={commonStyles.image} />
      <img src={logoSrc} alt={logoAlt} style={commonStyles.logoOverlay} />
    </div>
  );
};

export default ImageWithLogo;
