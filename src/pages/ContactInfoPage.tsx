import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import HomePage from "./HomePage";
import { useAuth } from "../context/AuthContext";
import { parseUserDataForClientRegistration, validateUserDataForRegistration } from "../utils/registrationUtils";
import UnifiedDropdown from "../components/UnifiedDropdown";
import { Avatar, Button, TextField } from "../components/ui";
import "./Auth.css";
import "./Flow.css";

const countries = [
  { name: "Cameroun", code: "+237" },
  { name: "République du Congo", code: "+242" },
  // Add more as needed
];

const ContactInfoPage: React.FC<{
  onBack?: () => void;
  }> = ({ onBack }) => {
  const { userData, updateUserData, register, clearError } = useAuth();
  const [country, setCountry] = useState(
    userData?.country || countries[0].name
  );
  const [countryCode, setCountryCode] = useState(
    userData?.code || countries[0].code
  );
  const [address, setAddress] = useState(userData?.address || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [showModal, setShowModal] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isValid = country && address && phone;

  const handleSignup = async () => {
    // Clear any previous errors
    clearError();
    
    // Update user data first
    const updatedContactInfo = {
      country,
      code: countryCode,
      address,
      phone,
    };
    
    updateUserData(updatedContactInfo);
    
    // ContactInfoPage is only for clients - proceed with API registration
    
    // Wait a bit to ensure userData is updated
    setTimeout(async () => {
      try {
        // Get the complete user data (including contact info just updated)
        const completeUserData = { ...userData, ...updatedContactInfo };
        
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
        
        // Debug logging
        console.log('🔍 Consumer Registration Debug (ContactInfoPage):');
        console.log('Complete User Data:', completeUserData);
        
        // Parse user data for API registration
        const registrationData = parseUserDataForClientRegistration(
          completeUserData, 
          completeUserData.password!
        );
        
        console.log('🚀 Parsed Registration Data:', registrationData);
        console.log('📋 Registration Data Fields:');
        Object.entries(registrationData).forEach(([key, value]) => {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else if (Array.isArray(value)) {
            console.log(`  ${key}: Array(${value.length} items) ${JSON.stringify(value)}`);
          } else {
            console.log(`  ${key}: ${typeof value} = ${value}`);
          }
        });
        
        // Call the API registration
        await register(registrationData);
        
        // Update user data with contact info after successful registration
        updateUserData({
          country,
          code: countryCode,
          address,
          phone,
        });
        
        toast.success('Compte créé avec succès! Bienvenue sur AutoFish!');
        // Go directly to home after successful registration
        setShowHomePage(true);
        
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
          toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      } finally {
        setIsRegistering(false);
      }
    }, 100);
  };

  if (showHomePage) {
    return <HomePage />;
  }


  const countryOptions = countries.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <div className="flow-screen fade-in-page">
      <NavBar title="Mes coordonnées" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Vos coordonnées</h1>
          <p className="flow-intro__text">
            Dernière étape : où vous joindre et où vous livrer.
          </p>
        </div>

        <form
          className="flow-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <UnifiedDropdown
            label="Pays"
            required
            options={countryOptions}
            value={country}
            onChange={(value) => {
              setCountry(value);
              const match = countries.find((c) => c.name === value);
              if (match) setCountryCode(match.code);
            }}
            placeholder="Sélectionnez votre pays"
          />

          <TextField
            label="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ville, quartier…"
            autoComplete="street-address"
            enterKeyHint="next"
          />

          <div className="signup-phone">
            <UnifiedDropdown
              label="Indicatif"
              options={countries.map((c) => ({
                value: c.code,
                label: c.code,
              }))}
              value={countryCode}
              onChange={setCountryCode}
              placeholder="+237"
            />

            <TextField
              label="Téléphone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="done"
              placeholder="6 XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </form>

        <div className="flow-actions">
          <Button
            size="lg"
            block
            disabled={!isValid}
            loading={isRegistering}
            loadingLabel="Inscription…"
            onClick={handleSignup}
          >
            Terminer l&apos;inscription
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        label="Compte créé"
      >
        <div style={{ textAlign: "center" }}>
          <Avatar
            src={userData?.avatar}
            name={userData?.name}
            size="xl"
            ring
            alt=""
            style={{ marginInline: "auto" }}
          />

          <h2 className="modal-title" style={{ marginTop: "var(--space-7)" }}>
            Bienvenue, {userData?.name?.split(" ")[0] || "et bravo"} !
          </h2>
          <p className="modal-text">
            Votre compte client est créé. Vous pouvez commencer à explorer les
            arrivages près de chez vous.
          </p>

          <div style={{ marginTop: "var(--space-8)" }}>
            <Button
              size="lg"
              block
              onClick={() => {
                setShowModal(false);
                setShowHomePage(true);
              }}
            >
              Découvrir AutoFish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContactInfoPage;
