import React from "react";
import NavBar from "../components/NavBar";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import IDVerificationPage from "./IDVerificationPage";
import { useAuth } from "../context/AuthContext";

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
    <>
      <style>{`
        .fade-in-page {
          opacity: 0;
          animation: fadeInPage 0.5s ease-in forwards;
        }
        @keyframes fadeInPage {
          to { opacity: 1; }
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
          paddingTop: 64,
        }}
      >
        <NavBar title="Choix du profil" onBack={onBack} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: "2px solid #00A6C0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              marginTop: 16,
            }}
          >
            <img
              src={userData?.avatar}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 20,
              color: "#222",
              marginTop: 16,
              marginBottom: 30,
            }}
          >
            {userData?.name}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 19,
              color: "#009CB7",
              marginBottom: 8,
              textAlign: "center",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            }}
          >
            Bienvenue sur Autofish Store!
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#131313",
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            Quel type d'utilisateur êtes vous ?
          </div>

          <div
            style={{
              width: "90vw",
              maxWidth: 340,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <button
              onClick={() => {
                updateUserData({ userRole: "client" });
                setGoToIDVerification(false);
                setGoToCategories(true);
              }}
              style={{
                width: "100%",
                background: "#fafbfc",
                border: "1.5px solid #00A6C0",
                borderRadius: 20,
                padding: "18px 0 18px 0",
                display: "flex",
                alignItems: "center",
                gap: 0,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <img
                src={userOutlineBlue}
                alt="client"
                style={{
                  width: 28,
                  height: 28,
                  marginLeft: 18,
                  marginRight: 12,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#222",
                  fontFamily: "inherit",
                }}
              >
                Poursuivre comme client
              </span>
            </button>

            <button
              onClick={() => {
                updateUserData({ userRole: "producteur" });
                setGoToIDVerification(true);
              }}
              style={{
                width: "100%",
                background: "#232228",
                border: "none",
                borderRadius: 20,
                padding: "18px 0 18px 0",
                display: "flex",
                alignItems: "center",
                gap: 0,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <img
                src={userOutlineWhite}
                alt="producteur"
                style={{
                  width: 28,
                  height: 28,
                  marginLeft: 18,
                  marginRight: 12,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#fff",
                  fontFamily: "inherit",
                }}
              >
                Poursuivre comme producteur
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileChoicePage;
