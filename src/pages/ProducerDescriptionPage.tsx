import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { Button, TextArea } from "../components/ui";
import "./Flow.css";

const MAX_WORDS = 50;

interface ProducerDescriptionPageProps {
  onBack: () => void;
  onContinue: (description: string) => void;
}

const ProducerDescriptionPage: React.FC<ProducerDescriptionPageProps> = ({
  onBack,
  onContinue,
}) => {
  const [description, setDescription] = useState("");

  const wordCount = description.trim()
    ? description.trim().split(/\s+/).length
    : 0;
  const wordsLeft = MAX_WORDS - wordCount;
  const isValid = wordCount > 0 && wordCount <= MAX_WORDS;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);

    setDescription(
      words[0] === ""
        ? ""
        : words.length <= MAX_WORDS
        ? value
        : words.slice(0, MAX_WORDS).join(" ")
    );
  };

  return (
    <div className="flow-screen fade-in-page">
      <NavBar title="Ma description" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Présentez votre activité</h1>
          <p className="flow-intro__text">
            Quelques mots sur ce que vous pêchez ou élevez, et sur ce qui vous
            distingue. Les clients liront ce texte sur votre page.
          </p>
        </div>

        <TextArea
          label="Description"
          value={description}
          onChange={handleChange}
          placeholder="Par exemple : pêcheur à Kribi depuis quinze ans, je livre du bar et du capitaine pêchés le matin même."
          rows={6}
          hint={
            wordsLeft > 0
              ? `${wordsLeft} mot${wordsLeft > 1 ? "s" : ""} restant${
                  wordsLeft > 1 ? "s" : ""
                }`
              : "Limite atteinte."
          }
        />

        <div className="flow-actions">
          <Button
            size="lg"
            block
            disabled={!isValid}
            onClick={() => onContinue(description)}
          >
            Poursuivre
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProducerDescriptionPage;
