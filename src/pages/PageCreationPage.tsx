import React, { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import CountryDropdown from "../components/CountryDropdown";
import PhoneInput from "../components/PhoneInput";
import AddressInput from "../components/AddressInput";
import PagePreviewPage from "./PagePreviewPage";
import Modal from "../components/Modal";
import HomePage from "./HomePage";
import { useAuth } from "../context/AuthContext";
import { parseUserDataForProducerRegistration, validateUserDataForRegistration } from "../utils/registrationUtils";
import { Avatar, Button, TextField } from "../components/ui";
import "./Flow.css";

const countries = [
  { name: "Cameroun", code: "+237" },
  { name: "République du Congo", code: "+242" },
];

const PageCreationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userData, updateUserData, register, clearError, completeRegistration } = useAuth();
  
  // Business page information only (personal info already collected in SignupPage)
  const [pageName, setPageName] = useState(userData?.page?.pageName || "");
  const [businessCountry, setBusinessCountry] = useState(userData?.page?.country || userData?.country || countries[0].name);
  const [businessCountryCode, setBusinessCountryCode] = useState(userData?.page?.code || userData?.code || countries[0].code);
  const [businessAddress, setBusinessAddress] = useState(userData?.page?.address || userData?.address || "");
  const [businessPhone, setBusinessPhone] = useState(userData?.page?.phone || "");
  
  // Removed individual dropdown state - now handled by components
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isValid = pageName && businessCountry && businessAddress && businessPhone;

  if (showHomePage) {
    return <HomePage />;
  }

  const handleShowPreview = () => {
    updateUserData({
      // Business page info only (personal info already exists from SignupPage)
      page: {
        pageName,
        country: businessCountry,
        address: businessAddress,
        phone: businessPhone,
        code: businessCountryCode,
      },
    });
    setShowPreview(true);
  };

  const handleProducerRegistration = async () => {
    // Clear any previous errors
    clearError();
    
    // Update business page info only (personal info already exists from SignupPage)
    const updatedData = {
      // Business page info
      page: {
        pageName,
        country: businessCountry,
        address: businessAddress,
        phone: businessPhone,
        code: businessCountryCode,
      },
    };
    
    updateUserData(updatedData);
    
    // Wait a bit longer to ensure userData is updated from ContactInfoPage
    setTimeout(async () => {
      try {
        // Get the complete user data (personal info from SignupPage + business page info)
        const completeUserData = {
          ...userData,
          ...updatedData
        };
        
        // Debug: Log the complete user data
        console.log('Complete user data for producer registration:', completeUserData);
        
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
        
        // Mark registration as complete for producers
        completeRegistration();
        
        toast.success('Compte producteur créé avec succès! Bienvenue sur AutoFish!');
        
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
    <div className="flow-screen fade-in-page">
      <NavBar title="Création de page" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Votre page producteur</h1>
          <p className="flow-intro__text">
            Ces informations apparaîtront sur votre page publique, celle que
            les clients consultent avant de vous contacter.
          </p>
        </div>

        <form
          className="flow-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleProducerRegistration();
          }}
        >
          <TextField
            label="Nom de la page"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Par exemple : Pêcherie du Wouri"
            enterKeyHint="next"
          />

          <CountryDropdown
            countries={countries}
            selectedCountry={businessCountry}
            selectedCode={businessCountryCode}
            onCountryChange={(country, code) => {
              setBusinessCountry(country);
              setBusinessCountryCode(code);
            }}
            label="Pays de vente"
            required
            placeholder="Sélectionnez votre pays"
          />

          <AddressInput
            address={businessAddress}
            onAddressChange={setBusinessAddress}
            label="Adresse de l'activité"
            placeholder="Ville, quartier, repère…"
          />

          <PhoneInput
            countryCode={businessCountryCode}
            phoneNumber={businessPhone}
            onPhoneChange={setBusinessPhone}
            /* The dial code follows the country chosen above. */
            onCountryCodeClick={() => {}}
            label="Téléphone de l'activité"
            placeholder="6 XX XX XX XX"
            hint="Les clients vous joindront sur ce numéro."
          />
        </form>

        <div className="flow-actions">
          <Button
            size="lg"
            block
            loading={isRegistering}
            loadingLabel="Inscription…"
            disabled={!isValid}
            onClick={handleProducerRegistration}
          >
            Terminer l&apos;inscription
          </Button>

          <Button
            variant="outline"
            size="lg"
            block
            onClick={handleShowPreview}
          >
            Aperçu de la page
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        label="Page créée"
      >
        <div style={{ textAlign: "center" }}>
          <Avatar
            src={userData?.avatar}
            name={pageName || userData?.name}
            size="xl"
            ring
            alt=""
            style={{ marginInline: "auto" }}
          />

          <h2 className="modal-title" style={{ marginTop: "var(--space-7)" }}>
            Votre page est créée
          </h2>
          <p className="modal-text">
            {pageName ? `« ${pageName} » est enregistrée. ` : ""}
            Notre équipe vérifie votre compte producteur. Vous pourrez publier
            dès la validation.
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
              Aller à l&apos;accueil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PageCreationPage;
