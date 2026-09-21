import React from "react";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import IDVerificationPage from "./IDVerificationPage";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/ui";
import "./Flow.css";

const userOutlineBlue = "/icons/User-Outline_blue.svg";
const userOutlineWhite = "/icons/User-Outline_white.svg";

interface ProfileChoicePageProps {
  onBack: () => void;
}

const ProfileChoicePage: React.FC<ProfileChoicePageProps> = ({ onBack }) => {
  const { userData, updateUserData } = useAuth();
  const [goToCategories, setGoToCategories] = React.useState(false);
  const [goToIDVerification, setGoToIDVerification] = React.useState(false);
  const [profileType, setProfileType] = React.useState<
    "client" | "producer" | null
  >(null);

  if (goToCategories && profileType === "client") {
    return (
      <CategoriesPage
        onBack={() => setGoToCategories(false)}
        profileType={profileType}
      />
    );
  }

  if (goToIDVerification && profileType === "producer") {
    return (
      <IDVerificationPage
        onBack={() => setGoToIDVerification(false)}
        profileType={profileType}
      />
    );
  }

  return (
    <div className="flow-screen fade-in-page">
      <NavBar title="Choix du profil" onBack={onBack} />

      <div className="flow-body">
        <div className="flow-identity">
          <Avatar src={userData?.avatar} name={userData?.name} size="xl" ring />
          <p className="flow-identity__name">{userData?.name}</p>
          <p className="flow-identity__welcome">Bienvenue sur Autofish Store</p>
          <p className="flow-identity__question">
            Comment comptez-vous utiliser l&apos;application ?
          </p>
        </div>

        <div className="flow-choices">
          <button
            type="button"
            className="flow-choice"
            onClick={() => {
              updateUserData({ userRole: "client" });
              setProfileType("client");
              setGoToIDVerification(false);
              setGoToCategories(true);
            }}
          >
            <span className="flow-choice__icon">
              <img src={userOutlineBlue} alt="" aria-hidden="true" />
            </span>
            <span className="flow-choice__body">
              <span className="flow-choice__label">Je suis client</span>
              <span className="flow-choice__hint">
                Parcourir et acheter du poisson frais.
              </span>
            </span>
          </button>

          <button
            type="button"
            className="flow-choice flow-choice--strong"
            onClick={() => {
              updateUserData({ userRole: "producteur" });
              setProfileType("producer");
              setGoToIDVerification(true);
            }}
          >
            <span className="flow-choice__icon">
              <img src={userOutlineWhite} alt="" aria-hidden="true" />
            </span>
            <span className="flow-choice__body">
              <span className="flow-choice__label">Je suis producteur</span>
              <span className="flow-choice__hint">
                Publier mes produits et vendre. Vérification requise.
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileChoicePage;
