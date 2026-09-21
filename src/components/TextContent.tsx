import React from "react";

interface TextContentProps {
  title: string;
  description: string;
}

const TextContent: React.FC<TextContentProps> = ({ title, description }) => (
  <div className="ob-copy">
    <h2 className="ob-copy__title">{title}</h2>
    <p className="ob-copy__text">{description}</p>
  </div>
);

export default TextContent;
