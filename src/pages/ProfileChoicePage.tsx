import React from "react";
import NavBar from "../components/NavBar";

const userOutlineBlue = "/icons/User-Outline_blue.svg";
const userOutlineWhite = "/icons/User-Outline_white.svg";

interface ProfileChoicePageProps {
  name: string;
  avatar: string;
  onBack?: () => void;
}

const ProfileChoicePage: React.FC<ProfileChoicePageProps> = ({
  name,
  avatar,
  onBack,
}) => {
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
              src={avatar}
              alt="avatar"
              style={{
                width: 70,
                height: 70,
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
            {name}
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
          <button
            style={{
              width: "90vw",
              maxWidth: 340,
              background: "#fafbfc",
              color: "#009CB7",
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 24,
              border: "1.2px solid #e0e0e0",
              padding: "16px 0",
              marginBottom: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 4,
              boxSizing: "border-box",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <img
              src={userOutlineBlue}
              alt="client"
              style={{ width: 28, height: 28, marginLeft: 24, marginRight: 16 }}
            />
            <span style={{ fontWeight: 600, fontSize: 17 }}>
              Poursuivre comme client
            </span>
          </button>
          <button
            style={{
              width: "90vw",
              maxWidth: 340,
              background: "#222",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 24,
              border: "none",
              padding: "16px 0",
              marginBottom: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 4,
              boxSizing: "border-box",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <img
              src={userOutlineWhite}
              alt="producteur"
              style={{ width: 28, height: 28, marginLeft: 24, marginRight: 16 }}
            />
            <span style={{ fontWeight: 600, fontSize: 17 }}>
              Poursuivre comme producteur
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileChoicePage;
