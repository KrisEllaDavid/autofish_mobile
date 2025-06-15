import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import HomePage from "./HomePage";
import { useAuth } from "../context/AuthContext";

// Contact information interface
interface ContactInfo {
  country: string;
  code: string;
  address: string;
  phone: string;
}

const countries = [
  { name: "Cameroun", code: "+237" },
  { name: "République du Congo", code: "+242" },
  // Add more as needed
];

const ContactInfoPage: React.FC<{
  onBack?: () => void;
  onContinue?: (info: ContactInfo) => void;
}> = ({ onBack }) => {
  const { userData, updateUserData } = useAuth();
  const [country, setCountry] = useState(
    userData?.country || countries[0].name
  );
  const [countryCode, setCountryCode] = useState(
    userData?.code || countries[0].code
  );
  const [showCountryList, setShowCountryList] = useState(false);
  const [address, setAddress] = useState(userData?.address || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [showModal, setShowModal] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);

  const isValid = country && address && phone;

  const handleSignup = () => {
    updateUserData({
      country,
      code: countryCode,
      address,
      phone,
    });
    setShowModal(true);
  };

  if (showHomePage) {
    return <HomePage />;
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
        .input-box {
          width: 100%;
          background: #fafbfc;
          border-radius: 18px;
          border: 1.2px solid #e0e0e0;
          font-size: 16px;
          color: #222;
          padding: 18px 18px 18px 18px;
          margin-bottom: 22px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          font-weight: 500;
        }
        .input-box::placeholder {
          color: #b0b0b0;
          opacity: 1;
        }
        .country-select {
          width: 100%;
          font-size: 16px;
          color: #b0b0b0;
          padding: 18px 18px 18px 18px;
          margin-bottom: 22px;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .country-list-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.18);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .country-list {
          background: #fff;
          border-radius: 18px;
          padding: 18px 0;
          min-width: 240px;
          max-height: 320px;
          overflow-y: auto;
        }
        .country-list-item {
          padding: 12px 24px;
          font-size: 16px;
          color: #222;
          cursor: pointer;
          transition: background 0.2s;
        }
        .country-list-item:hover {
          background: none;
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
        <NavBar title="Mes coordonnées" onBack={onBack} />
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
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quelle est votre pays de vente ?
          </div>
          <div
            className={`categories-dropdown${showCountryList ? " open" : ""}`}
            tabIndex={0}
            style={{ marginBottom: 22 }}
            onClick={() => setShowCountryList((open) => !open)}
          >
            <div
              className="categories-dropdown-header"
              style={{ cursor: "pointer" }}
            >
              <span style={{ color: country ? "#222" : "#b0b0b0" }}>
                {country || "Sélectionnez votre pays"}
              </span>
              <span className="categories-dropdown-arrow">
                <img
                  src="/icons/chevron.svg"
                  alt="chevron"
                  style={{ width: 24, height: 24 }}
                />
              </span>
            </div>
            {showCountryList && (
              <div
                className="categories-dropdown-list"
                style={{
                  marginTop: 18,
                  zIndex: 1000,
                }}
              >
                {countries.map((c) => (
                  <div
                    key={c.name}
                    className="categories-dropdown-item"
                    style={{
                      fontSize: 16,
                      color: "#222",
                      cursor: "pointer",
                      padding: "12px 24px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCountry(c.name);
                      setCountryCode(c.code);
                      setShowCountryList(false);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quel est votre adresse (Ville, Quartier)
          </div>
          <input
            className="input-box"
            placeholder="Entrez votre adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quel est votre numéro de téléphone?
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 32 }}
          >
            <div
              style={{
                minWidth: 64,
                fontSize: 16,
                color: "#222",
                padding: "18px 10px 18px 18px",
                marginRight: 8,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
                position: "relative",
              }}
              onClick={() => setShowCountryList(true)}
            >
              {countryCode}{" "}
              <span style={{ fontSize: 16, color: "#b0b0b0" }}></span>
            </div>
            <input
              className="input-box"
              style={{ marginBottom: 0 }}
              placeholder="Entrez votre numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
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
              marginTop: 18,
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              boxShadow: "0 2px 12px rgba(0, 156, 183, 0.08)",
            }}
            disabled={!isValid}
            onClick={handleSignup}
          >
            Terminer l'inscription
          </button>
        </div>
        {showModal && (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <div
              style={{
                background: "#fff",
                borderRadius: 28,
                boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                padding: 32,
                maxWidth: 340,
                width: "90vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "3px solid #009cb7",
                  overflow: "hidden",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={userData?.avatar || "/icons/account.svg"}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#222",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Bravo !
              </div>
              <div
                style={{
                  color: "#b0b0b0",
                  fontSize: 17,
                  marginBottom: 28,
                  textAlign: "center",
                }}
              >
                Votre compte client a bien été enregistré
              </div>
              <button
                style={{
                  width: "100%",
                  background: "#009cb7",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 18,
                  border: "none",
                  padding: "16px 0",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowModal(false);
                  setShowHomePage(true);
                }}
              >
                Vers l'accueil
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default ContactInfoPage;
