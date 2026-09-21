import React, { useState } from "react";
import NavBar from "../components/NavBar";
import PageCreationPage from "./PageCreationPage";
import { useAuth } from "../context/AuthContext";
import { Button, TextArea } from "../components/ui";
import "./Flow.css";

const MAX_WORDS = 50;

interface DescriptionPageProps {
  onBack: () => void;
  onContinue: (description: string) => void;
}

const DescriptionPage: React.FC<DescriptionPageProps> = ({ onBack }) => {
  const { updateUserData } = useAuth();
  const [description, setDescription] = useState("");
  const [goToPageCreation, setGoToPageCreation] = useState(false);

  if (goToPageCreation) return <PageCreationPage onBack={onBack} />;

  const wordCount = description.trim()
    ? description.trim().split(/\s+/).length
    : 0;
  const wordsLeft = MAX_WORDS - wordCount;
  const isValid = wordCount > 0 && wordCount <= MAX_WORDS;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);

    const next =
      words[0] === ""
        ? ""
        : words.length <= MAX_WORDS
        ? value
        : words.slice(0, MAX_WORDS).join(" ");

    setDescription(next);
    if (next) updateUserData({ description: next });
  };

  return (
    <div className="flow-screen fade-in-page">
      <NavBar title="Ma description" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Présentez-vous</h1>
          <p className="flow-intro__text">
            Décrivez-vous et vos intérêts en quelques mots. Les producteurs
            verront ce texte sur votre profil.
          </p>
        </div>

        <TextArea
          label="Description"
          value={description}
          onChange={handleChange}
          placeholder="Par exemple : passionné de cuisine, je cherche du poisson frais chaque semaine pour mon restaurant à Douala."
          rows={7}
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
            onClick={() => setGoToPageCreation(true)}
          >
            Poursuivre
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPage;
