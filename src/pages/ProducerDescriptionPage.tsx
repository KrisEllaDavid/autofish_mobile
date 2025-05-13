import React, { useState } from "react";
import NavBar from "../components/NavBar";

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
    if (words[0] === "") {
      setDescription("");
    } else if (words.length <= MAX_WORDS) {
      setDescription(value);
    } else {
      setDescription(words.slice(0, MAX_WORDS).join(" "));
    }
  };

  return (
    <>
      <style>{`
        .fade-in-page {
          opacity: 0;
          animation: fadeInPage 0.5s ease-in forwards;
        }
        @keyframes fadeInPage {
          to { opacity: 1; }
        }
        .desc-textarea {
          width: 100%;
          min-height: 110px;
          max-height: 180px;
          border-radius: 24px;
          border: 1.2px solid #e0e0e0;
          background: #fafbfc;
          font-size: 16px;
          color: #222;
          padding: 18px 18px 18px 18px;
          box-sizing: border-box;
          font-family: inherit;
          resize: none;
          outline: none;
        }
        .desc-textarea::placeholder {
          color: #b0b0b0;
          opacity: 1;
        }
      `}</style>
      <div
        className="fade-in-page"
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 32,
        }}
      >
        <NavBar title="Ma description" onBack={onBack} />
        <div
          style={{
            width: "100%",
            maxWidth: 370,
            margin: "0 auto",
            padding: "0 16px",
            boxSizing: "border-box",
            marginTop: 60,
          }}
        >
          <div style={{ fontSize: 15, color: "#222", marginBottom: 16 }}>
            Décrivez vous et vos intérêts en quelques mots
          </div>
          <textarea
            className="desc-textarea"
            placeholder="Entrez votre description ici..."
            value={description}
            onChange={handleChange}
            maxLength={500}
          />
          <div
            style={{
              textAlign: "right",
              color: "#b0b0b0",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            {wordsLeft} mots restants
          </div>
          <button
            style={{
              width: "100%",
              background: isValid ? "#009cb7" : "#b0b0b0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 18,
              border: "none",
              padding: "18px 0",
              marginTop: 38,
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              boxShadow: "0 2px 12px rgba(0, 156, 183, 0.08)",
            }}
            disabled={!isValid}
            onClick={() => onContinue(description)}
          >
            Poursuivre
          </button>
        </div>
      </div>
    </>
  );
};

export default ProducerDescriptionPage;
