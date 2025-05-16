import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import DescriptionPage from "../DescriptionPage";
import ContactInfoPage from "../ContactInfoPage";
import PageCreationPage from "../PageCreationPage";
import "./CategoriesPage.css";
import CryptoJS from "crypto-js";

const mockCategories = [
  "Produits agricoles",
  "Poissons",
  "Fruits de mer",
  "Épices",
  "Légumes",
  "Céréales",
];

interface CategoriesPageProps {
  onBack?: () => void;
  profileType: "client" | "producer";
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onBack,
  profileType,
  userData,
  setUserData,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableCategories, setAvailableCategories] =
    useState(mockCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [goToDescription, setGoToDescription] = useState(false);
  const [goToContactInfo, setGoToContactInfo] = useState(false);
  const [goToPageCreation, setGoToPageCreation] = useState(false);

  const handleSelect = (cat: string) => {
    setSelectedCategories([...selectedCategories, cat]);
    setAvailableCategories(availableCategories.filter((c) => c !== cat));
    setDropdownOpen(false);

    // Update userData with the selected categories
    setUserData((prev: any) => ({
      ...prev,
      selectedCategories: [...selectedCategories, cat],
    }));
  };

  const handleRemove = (cat: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    setAvailableCategories([...availableCategories, cat]);

    // Update userData with the updated selected categories
    setUserData((prev: any) => ({
      ...prev,
      selectedCategories: selectedCategories.filter((c) => c !== cat),
    }));
  };

  const handleContinue = () => {
    if (profileType === "client") {
      setGoToContactInfo(true);
    } else if (profileType === "producer") {
      setGoToPageCreation(true);
    }
  };

  const hashedPassword = userData.password
    ? CryptoJS.SHA256(userData.password).toString()
    : undefined;

  if (goToPageCreation) {
    return (
      <PageCreationPage
        onBack={() => setGoToPageCreation(false)}
        onPreview={() => {}}
        onContinue={() => {}}
        userData={userData}
        setUserData={setUserData}
      />
    );
  }

  if (goToContactInfo) {
    return (
      <ContactInfoPage
        onBack={() => setGoToContactInfo(false)}
        onContinue={() => {}}
        userData={userData}
        setUserData={setUserData}
      />
    );
  }

  if (goToDescription) {
    return (
      <DescriptionPage
        onBack={() => setGoToDescription(false)}
        onContinue={() => {
          if (profileType === "producer") setGoToPageCreation(true);
          else setGoToContactInfo(true);
        }}
        userData={userData}
        setUserData={setUserData}
      />
    );
  }

  return (
    <div className="categories-page">
      <NavBar title="Mes catégories" onBack={onBack} />
      <div className="categories-subtitle">
        Sélectionnez vos catégories principales
      </div>
      <div
        className={`categories-dropdown${dropdownOpen ? " open" : ""}`}
        tabIndex={0}
        onBlur={() => setDropdownOpen(false)}
      >
        <div
          className="categories-dropdown-header"
          onClick={() => setDropdownOpen((open) => !open)}
        >
          <span>Liste des catégories</span>
          <span className="categories-dropdown-arrow">
            <img
              src="/icons/chevron.svg"
              alt="chevron"
              style={{ width: 24, height: 24 }}
            />
          </span>
        </div>
        {dropdownOpen && availableCategories.length > 0 && (
          <div className="categories-dropdown-list">
            {availableCategories.map((cat) => (
              <div
                key={cat}
                className="categories-dropdown-item"
                onClick={() => handleSelect(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="categories-pills">
        {selectedCategories.map((cat) => (
          <div className="categories-pill" key={cat}>
            {cat}
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
      <button className="categories-action-btn" onClick={handleContinue}>
        Poursuivre
      </button>
    </div>
  );
};

export default CategoriesPage;
