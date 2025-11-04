import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import UnifiedDropdown from "../../components/UnifiedDropdown";
import DescriptionPage from "../DescriptionPage";
import PageCreationPage from "../PageCreationPage";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { Category } from "../../services/api";
import "./CategoriesPage.css";
import { useAuth } from "../../context/AuthContext";
import { parseUserDataForClientRegistration, validateUserDataForRegistration } from "../../utils/registrationUtils";
import { toast } from "react-toastify";

interface CategoriesPageProps {
  onBack?: () => void;
  profileType: "client" | "producer";
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onBack,
  profileType,
}) => {
  const { userData, updateUserData, register, clearError } = useAuth();
  const api = useApiWithLoading();
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goToDescription, setGoToDescription] = useState(false);
  const [goToPageCreation, setGoToPageCreation] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch categories from API - extracted to reusable function
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await api.getCategories();
      setAvailableCategories(categoriesData);

      if (import.meta.env.DEV) {
        console.log('✅ Loaded categories:', categoriesData.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      console.error('❌ Failed to load categories:', err);
      // Fallback to empty array if API fails
      setAvailableCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelect = (cat: Category) => {
    const newSelectedCategories = [...selectedCategories, cat];

    setSelectedCategories(newSelectedCategories);
    setAvailableCategories(availableCategories.filter((c) => c.id !== cat.id));

    // Update userData with the selected categories (store IDs as strings)
    updateUserData({
      selectedCategories: newSelectedCategories.map(c => c.id.toString()),
    });
  };

  const handleRemove = (cat: Category) => {
    const updatedSelected = selectedCategories.filter((c) => c.id !== cat.id);
    setSelectedCategories(updatedSelected);
    setAvailableCategories([...availableCategories, cat]);

    // Update userData with the updated selected categories
    updateUserData({
      selectedCategories: updatedSelected.map(c => c.id.toString()),
    });
  };

  const handleContinue = async () => {
    if (profileType === "client") {
      // Directly register consumer after choosing categories
      try {
        setIsRegistering(true);
        clearError();
        if (!userData || !userData.email || !userData.password) {
          toast.error("Informations d'inscription manquantes");
          return;
        }
        const completeUserData = { ...userData };
        const validation = validateUserDataForRegistration(completeUserData, completeUserData.password);
        if (!validation.isValid) {
          const msg = validation.missingFields.length > 3
            ? `${validation.missingFields.slice(0, 3).join(', ')} et ${validation.missingFields.length - 3} autres`
            : validation.missingFields.join(', ');
          toast.error(`Champs manquants: ${msg}`);
          return;
        }

        // Debug logging
        console.log('🔍 Consumer Registration Debug:');
        console.log('Complete User Data:', completeUserData);

        const registrationData = parseUserDataForClientRegistration(completeUserData, completeUserData.password!);

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

        await register(registrationData);
        // On success, isAuthenticated becomes true and App shows HomePage
        // Or needsEmailVerification becomes true and verification page is shown
        toast.success("Inscription réussie! Vérifiez votre email pour activer votre compte.");
      } catch (error) {
        // Only show error if registration actually failed
        console.error('Registration error:', error);
        toast.error("Inscription échouée. Veuillez réessayer.");
      } finally {
        setIsRegistering(false);
      }
    } else if (profileType === "producer") {
      // Producers need to provide description first
      setGoToDescription(true);
    }
  };

  if (goToPageCreation) {
    return <PageCreationPage onBack={() => setGoToPageCreation(false)} />;
  }

  // ContactInfoPage is no longer used for clients; keep code path for safety but never navigate there

  if (goToDescription) {
    return (
      <DescriptionPage
        onBack={() => setGoToDescription(false)}
        onContinue={(_description) => {
          // Producers go directly to page creation (which includes address collection)
          setGoToPageCreation(true);
        }}
      />
    );
  }

  return (
    <div className="categories-page">
      <NavBar title="Mes catégories" onBack={onBack} />
      <div className="categories-subtitle">
        Sélectionnez vos catégories principales
        {profileType === "producer" && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            * Au moins une catégorie est requise pour les producteurs
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #00B2D6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }} />
          <p>Chargement des catégories...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
          <p>Erreur: {error}</p>
          <button
            onClick={fetchCategories}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#ccc" : "#00B2D6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px"
            }}
          >
            {loading ? "Chargement..." : "Réessayer"}
          </button>
        </div>
      )}

      {/* Categories Dropdown */}
      {!loading && !error && (
        <>
          <div style={{ width: '90vw', maxWidth: 340 }}>
            <UnifiedDropdown
              options={availableCategories.map(cat => ({ 
                value: cat.id.toString(), 
                label: cat.name 
              }))}
              value=""
              onChange={(value) => {
                const category = availableCategories.find(cat => cat.id.toString() === value);
                if (category) {
                  handleSelect(category);
                }
              }}
              placeholder={availableCategories.length > 0 ? "Sélectionnez une catégorie" : "Aucune catégorie disponible"}
              icon="/icons/User-Outline.svg"
              activeIcon="/icons/User-Outline_blue.svg"
              disabled={availableCategories.length === 0}
            />
          </div>
          
          {/* Selected Categories Pills */}
          <div className="categories-pills">
            {selectedCategories.map((cat) => (
              <div className="categories-pill" key={cat.id}>
                {cat.name}
                <button
                  className="categories-pill-close"
                  onClick={() => handleRemove(cat)}
                  aria-label="Supprimer"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Continue Button */}
          <button
            className="categories-action-btn"
            onClick={handleContinue}
            disabled={(profileType === "producer" && selectedCategories.length === 0) || isRegistering}
            style={{
              opacity: (profileType === "producer" && selectedCategories.length === 0) || isRegistering ? 0.5 : 1,
              cursor: (profileType === "producer" && selectedCategories.length === 0) || isRegistering ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isRegistering && profileType === "client" && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {profileType === "client" ? "Terminer l'inscription" : "Suivant"}
            {profileType === "producer" && selectedCategories.length === 0 && (
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Sélectionnez au moins une catégorie
              </div>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
