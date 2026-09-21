import React, { useState } from "react";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import { useAuth } from "../context/AuthContext";
import { Button, TextField } from "../components/ui";
import "./Flow.css";

interface AddressPageProps {
  onBack: () => void;
}

const AddressPage: React.FC<AddressPageProps> = ({ onBack }) => {
  const { userData, updateUserData } = useAuth();
  const [address, setAddress] = useState(userData?.address || "");
  const [goToCategories, setGoToCategories] = useState(false);

  const isValid = address.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;
    updateUserData({ address: address.trim() });
    setGoToCategories(true);
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
    <div className="flow-screen fade-in-page">
      <NavBar title="Adresse complète" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-intro">
          <h1 className="flow-intro__title">Où vous trouve-t-on ?</h1>
          <p className="flow-intro__text">
            Votre adresse complète aide les clients à organiser les
            livraisons et les retraits.
          </p>
        </div>

        <form
          className="flow-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <TextField
            label="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Quartier, rue, repère…"
            autoComplete="street-address"
            enterKeyHint="done"
            hint="Par exemple : Akwa, rue Njo-Njo, face pharmacie du port."
          />
        </form>

        <div className="flow-actions">
          <Button size="lg" block disabled={!isValid} onClick={handleContinue}>
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
