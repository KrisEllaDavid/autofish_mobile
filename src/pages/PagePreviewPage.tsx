import React, { useRef, useState } from "react";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";

interface PagePreviewPageProps {
  onBack: (data: any) => void;
  info: {
    pageName: string;
    country: string;
    address: string;
    phone: string;
    code: string;
    avatar?: string;
    banner?: string;
    userName?: string;
    userRole?: string;
    isPreview?: boolean;
    name: string;
  };
  onBannerChange?: (banner: string) => void;
}

const defaultBanner = "/images/page_banner.jpg";
const defaultAvatar = "/icons/account.svg";
const cameraIcon = "/icons/camera_icon_white.svg";
const locationIcon = "/icons/Location.svg";

const PagePreviewPage: React.FC<PagePreviewPageProps> = ({
  onBack,
  info,
  onBannerChange,
}) => {
  const [banner, setBanner] = useState<string | undefined>(info.banner);
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBanner(ev.target?.result as string);
        if (onBannerChange) {
          onBannerChange(ev.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    onBack({ ...info, banner });
  };

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
        .banner {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          position: relative;
        }
        .banner-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(1, 33, 46, 0.7);
          border-radius: 0 0 0 0;
        }
        .banner-camera {
          position: absolute;
          bottom: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          cursor: pointer;
          z-index: 3;
        }
        .banner-camera img {
          width: 22px;
          height: 22px;
        }
        .profile-info {
          position: absolute;
          top: 90px;
          left: 24px;
          display: flex;
          align-items: center;
          z-index: 2;
        }
        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid #fff;
          object-fit: cover;
          background: #fff;
        }
        .profile-text {
          margin-left: 16px;
          color: #fff;
        }
        .profile-text .name {
          font-size: 18px;
          font-weight: 700;
        }
        .profile-text .role {
          font-size: 13px;
          font-weight: 400;
          opacity: 0.9;
        }
        .page-title {
          position: absolute;
          top: 140px;
          left: 24px;
          color: #fff;
          font-size: 26px;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0,0,0,0.18);
          z-index: 2;
        }
        .page-address {
          position: absolute;
          top: 180px;
          left: 24px;
          color: #fff;
          font-size: 15px;
          font-weight: 400;
          display: flex;
          align-items: center;
          text-shadow: 0 2px 8px rgba(0,0,0,0.18);
          z-index: 2;
        }
        .publications-section {
          padding: 0 16px;
        }
        .publications-title {
          color: #000;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .publications-add {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0f0f0;
          color: #b0b0b0;
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: not-allowed;
        }
        .publications-box {
          width: 100%;
          min-height: 300px;
          background: #fafbfc;
          border-radius: 18px;
          border: 1.2px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .publications-box .empty {
          color: #b0b0b0;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .publications-box .pending {
          color: #b0b0b0;
          font-size: 14px;
        }
      `}</style>
      <div
        className="fade-in-page"
        style={{ minHeight: "100vh", background: "#fff" }}
      >
        <NavBar title="Aperçu de la page" onBack={handleBack} />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 270,
            marginBottom: 24,
            background: "#000",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={banner || defaultBanner}
            alt="banner"
            className="banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="banner-overlay" style={{ height: "100%" }} />
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 35,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
              zIndex: 2,
              width: "calc(100% - 48px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img
                src={info.avatar}
                alt="avatar"
                className="avatar"
                style={{ width: 56, height: 56, border: "3px solid #fff" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {info.name}
                </span>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 400,
                    fontSize: 13,
                    opacity: 0.9,
                  }}
                >
                  {info.userRole}
                </span>
              </div>
            </div>
            <div
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 26,
                marginTop: 6,
                marginBottom: 2,
                textShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              {info.pageName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={locationIcon}
                  alt="location"
                  style={{ width: 18, height: 18, marginRight: 6 }}
                />
                <span style={{ color: "#fff" }}>{info.address}</span>
              </div>
              <div
                className="banner-camera"
                onClick={handleBannerClick}
                style={{ position: "static", marginLeft: 12 }}
              >
                <img src={cameraIcon} alt="upload cover" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleBannerChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="publications-section">
          <div className="publications-title">
            Publications
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#f0f0f0",
                color: "#b0b0b0",
                fontSize: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.2px solid #e0e0e0",
                cursor: "not-allowed",
                fontWeight: 700,
              }}
            >
              +
            </span>
          </div>
          <div className="publications-box">
            <div className="empty">Aucune publication</div>
            <div className="pending">Vous êtes en attente de validation</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PagePreviewPage;
