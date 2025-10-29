import React, { useState } from "react";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import { useAuth } from "../context/AuthContext";

const getInputStyle = (hasContent: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "16px 18px",
  borderRadius: 15,
  border: hasContent ? "1.2px solid #222" : "1.2px solid #e0e0e0",
  background: "#fafbfc",
  fontSize: 16,
  color: "#222",
  marginBottom: 16,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  fontWeight: 500,
});

interface AddressPageProps {
  onBack: () => void;
}

const AddressPage: React.FC<AddressPageProps> = ({ onBack }) => {
  const { userData, updateUserData } = useAuth();
  const [address, setAddress] = useState(userData?.address || "");
  const [goToCategories, setGoToCategories] = useState(false);

  const isValid = address.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      updateUserData({ address: address.trim() });
      setGoToCategories(true);
    }
  };

  if (goToCategories) {
    return (
      <CategoriesPage
        onBack={() => setGoToCategories(false)}
        profileType="producer"
      />
    );
  }

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
        input::placeholder {
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
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >
        <NavBar title="Adresse complète" onBack={onBack} />
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
          <div style={{ fontSize: 15, color: "#222", marginBottom: 24 }}>
            Entrez votre adresse complète pour faciliter les livraisons
          </div>

          <input
            type="text"
            placeholder="Adresse complète (quartier, rue, etc.)"
            style={getInputStyle(!!address)}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div style={{ marginTop: 32 }}>
            <button
              onClick={handleContinue}
              disabled={!isValid}
              style={{
                width: "100%",
                background: isValid ? "#009CB7" : "#ccc",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 15,
                border: "none",
                padding: "16px 0",
                cursor: isValid ? "pointer" : "not-allowed",
                opacity: isValid ? 1 : 0.7,
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressPage;