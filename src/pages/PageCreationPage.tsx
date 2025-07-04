import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import PagePreviewPage from "./PagePreviewPage";
import Modal from "../components/Modal";
import HomePage from "./HomePage";
import { useAuth } from "../context/AuthContext";
import { parseUserDataForProducerRegistration, validateUserDataForRegistration } from "../utils/registrationUtils";

const countries = [
  { name: "Cameroun", code: "+237" },
  { name: "République du Congo", code: "+242" },
];

const PageCreationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userData, updateUserData, register, clearError } = useAuth();
  
  // Business page information
  const [pageName, setPageName] = useState(userData?.page?.pageName || "");
  const [country, setCountry] = useState(userData?.page?.country || countries[0].name);
  const [countryCode, setCountryCode] = useState(userData?.page?.code || countries[0].code);
  const [address, setAddress] = useState(userData?.page?.address || "");
  const [phone, setPhone] = useState(userData?.page?.phone || "");
  
  // Personal contact information (required by API at root level)
  const [personalCountry, setPersonalCountry] = useState(userData?.country || countries[0].name);
  const [personalCountryCode, setPersonalCountryCode] = useState(userData?.code || countries[0].code);
  const [personalAddress, setPersonalAddress] = useState(userData?.address || "");
  const [personalPhone, setPersonalPhone] = useState(userData?.phone || "");
  
  const [showCountryList, setShowCountryList] = useState(false);
  const [showPersonalCountryList, setShowPersonalCountryList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isValid = pageName && country && address && phone && personalCountry && personalAddress && personalPhone;

  if (showHomePage) {
    return <HomePage />;
  }

  const handleShowPreview = () => {
    updateUserData({
      // Personal contact info (required by API at root level)
      country: personalCountry,
      address: personalAddress,
      phone: personalPhone,
      code: personalCountryCode,
      // Business page info
      page: {
        pageName,
        country: country,
        address: address,
        phone: phone,
        code: countryCode,
      },
    });
    setShowPreview(true);
  };

  const handleProducerRegistration = async () => {
    // Clear any previous errors
    clearError();
    
    // Update both personal and business info
    const updatedData = {
      // Personal contact info (required by API at root level)
      country: personalCountry,
      address: personalAddress,
      phone: personalPhone,
      code: personalCountryCode,
      // Business page info
      page: {
        pageName,
        country: country,
        address: address,
        phone: phone,
        code: countryCode,
      },
    };
    
    updateUserData(updatedData);
    
    // Wait a bit longer to ensure userData is updated from ContactInfoPage
    setTimeout(async () => {
      try {
        // Get the complete user data (including both personal and page info just updated)
        const completeUserData = { 
          ...userData, 
          ...updatedData,
          // Ensure personal contact info is available at the root level for validation
          phone: personalPhone,
          code: personalCountryCode,
          country: personalCountry,
          address: personalAddress
        };
        
        // Validate user data
        const validation = validateUserDataForRegistration(completeUserData, completeUserData.password);
        if (!validation.isValid) {
          const missingFieldsMessage = validation.missingFields.length > 3 
            ? `${validation.missingFields.slice(0, 3).join(', ')} et ${validation.missingFields.length - 3} autres champs`
            : validation.missingFields.join(', ');
          toast.error(`Données manquantes: ${missingFieldsMessage}`);
          return;
        }
        
        setIsRegistering(true);
        
        // Parse user data for API registration
        const registrationData = parseUserDataForProducerRegistration(
          completeUserData, 
          completeUserData.password!
        );
        
        // Call the API registration
        await register(registrationData);
        
        toast.success('Compte producteur créé avec succès! Bienvenue sur AutoFish!');
        
        // Show success modal
        setShowModal(true);
        
      } catch (error: any) {
        // Handle different types of errors
        if (error?.email) {
          toast.error(`Email: ${error.email[0]}`);
        } else if (error?.password) {
          toast.error(`Mot de passe: ${error.password[0]}`);
        } else if (error?.non_field_errors) {
          toast.error(error.non_field_errors[0]);
        } else if (error?.detail) {
          toast.error(error.detail);
        } else {
          toast.error('Erreur lors de l\'inscription producteur. Veuillez réessayer.');
        }
      } finally {
        setIsRegistering(false);
      }
    }, 300);
  };

  if (showPreview) {
    return <PagePreviewPage onBack={() => setShowPreview(false)} />;
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
        .categories-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .categories-dropdown-arrow {
          font-size: 28px;
          color: #222;
          transition: transform 0.3s;
          display: flex;
          align-items: center;
        }
        .categories-dropdown-arrow img {
          transition: transform 0.3s;
        }
        .categories-dropdown.open .categories-dropdown-arrow {
          transform: rotate(180deg);
        }
        .categories-dropdown.open .categories-dropdown-arrow img {
          transform: rotate(90deg);
        }
        .categories-dropdown-list {
          margin-top: 18px;
          z-index: 1000;
        }
        .categories-dropdown-item {
          font-size: 16px;
          color: #222;
          cursor: pointer;
          padding: 12px 24px;
          transition: background 0.2s;
        }
        .categories-dropdown-item:hover {
          background: #f0f0f0;
        }
        .preview-btn {
          width: 100%;
          background: #fff;
          color: #222;
          font-weight: 700;
          font-size: 18px;
          border-radius: 18px;
          border: 1.2px solid #222;
          padding: 18px 0;
          margin-bottom: 18px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .continue-btn {
          width: 100%;
          background: #009cb7;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          border-radius: 18px;
          border: none;
          padding: 18px 0;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: 0 2px 12px rgba(0, 156, 183, 0.08);
        }
        .continue-btn:disabled {
          background: #b0b0b0;
          cursor: not-allowed;
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
        <NavBar title="Création de page" onBack={onBack} />
        <div
          style={{
            width: "100%",
            maxWidth: 370,
            margin: "0 auto",
            padding: "0 16px",
            boxSizing: "border-box",
            marginTop: 24,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 24, textAlign: "center" }}>
            Informations personnelles
          </div>
          
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quel est votre pays de résidence ?
          </div>
          <div
            className={`categories-dropdown${showPersonalCountryList ? " open" : ""}`}
            tabIndex={0}
            style={{ marginBottom: 22 }}
            onClick={() => setShowPersonalCountryList((open) => !open)}
          >
            <div
              className="categories-dropdown-header"
              style={{ cursor: "pointer" }}
            >
              <span style={{ color: personalCountry ? "#222" : "#b0b0b0" }}>
                {personalCountry || "Sélectionnez votre pays"}
              </span>
              <span className="categories-dropdown-arrow">
                <img
                  src="/icons/chevron.svg"
                  alt="chevron"
                  style={{ width: 24, height: 24 }}
                />
              </span>
            </div>
            {showPersonalCountryList && (
              <div
                className="categories-dropdown-list"
                style={{ marginTop: 18, zIndex: 1000 }}
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
                      setPersonalCountry(c.name);
                      setPersonalCountryCode(c.code);
                      setShowPersonalCountryList(false);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quelle est votre adresse personnelle (Ville, Quartier)
          </div>
          <input
            className="input-box"
            placeholder="Entrez votre adresse personnelle"
            value={personalAddress}
            onChange={(e) => setPersonalAddress(e.target.value)}
          />
          
          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quel est votre numéro de téléphone personnel?
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
              onClick={() => setShowPersonalCountryList(true)}
            >
              {personalCountryCode}{" "}
              <span style={{ fontSize: 16, color: "#b0b0b0" }}></span>
            </div>
            <input
              className="input-box"
              style={{ marginBottom: 0 }}
              placeholder="Entrez votre numéro personnel"
              value={personalPhone}
              onChange={(e) => setPersonalPhone(e.target.value)}
              type="tel"
            />
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 24, textAlign: "center", marginTop: 32 }}>
            Informations de votre page business
          </div>

          <div style={{ fontSize: 15, color: "#222", marginBottom: 10 }}>
            Quel est le nom de votre page ?
          </div>
          <input
            className="input-box"
            placeholder="Entrez le nom de la page"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
          />
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
                style={{ marginTop: 18, zIndex: 1000 }}
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
            className="preview-btn"
            type="button"
            onClick={handleShowPreview}
          >
            Aperçu de la page
          </button>
          <button
            className="continue-btn"
            disabled={!isValid || isRegistering}
            onClick={handleProducerRegistration}
          >
            {isRegistering ? 'Inscription en cours...' : 'Terminer l\'inscription'}
          </button>
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
                    src={userData?.avatar}
                    alt="cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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
                  Votre page producteur a bien été enregistrée
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
      </div>
    </>
  );
};

export default PageCreationPage;
