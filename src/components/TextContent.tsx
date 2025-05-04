import React from "react";
import { commonStyles } from "./styles";

interface TextContentProps {
  title: string;
  description: string;
}

const TextContent: React.FC<TextContentProps> = ({ title, description }) => {
  return (
    <div style={commonStyles.textContainer}>
      <h2 style={commonStyles.title}>{title}</h2>
      <p style={commonStyles.description}>{description}</p>
    </div>
  );
};

export default TextContent;
