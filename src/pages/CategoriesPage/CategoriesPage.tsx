import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import { Button, Spinner } from "../../components/ui";
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
      
      {loading && (
        <div className="categories-status">
          <Spinner size="lg" />
          <p>Chargement des catégories…</p>
        </div>
      )}

      {error && (
        <div className="categories-status">
          <p className="categories-status__error">
            Les catégories n&apos;ont pas pu être chargées.
          </p>
          <Button variant="secondary" loading={loading} onClick={fetchCategories}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Categories Dropdown */}
      {!loading && !error && (
        <>
          <div className="categories-field">
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
          
          {profileType === "producer" && selectedCategories.length === 0 && (
            <p className="categories-hint">
              Sélectionnez au moins une catégorie pour continuer.
            </p>
          )}

          <button
            className="categories-action-btn"
            onClick={handleContinue}
            disabled={
              (profileType === "producer" &&
                selectedCategories.length === 0) ||
              isRegistering
            }
          >
            {isRegistering && (
              <span className="af-spinner af-spinner--on-brand" aria-hidden="true" />
            )}
            {profileType === "client" ? "Terminer l'inscription" : "Suivant"}
          </button>

        </>
      )}
    </div>
  );
};

export default CategoriesPage;
