import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Modal from "./Modal";

interface AccountMenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}

const mainBlue = "#00B2D6";

const AccountMenu: React.FC<AccountMenuProps> = ({
  open,
  anchorRef,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { userData, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (!anchorRef.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  const handleLogout = () => {
    onClose();
    toast.info("Déconnexion en cours...");
    setTimeout(() => {
      logout();
    }, 500);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Import API client dynamically to avoid circular dependencies
      const { apiClient } = await import("../services/api");

      await apiClient.deleteAccount();

      toast.success("Votre compte a été supprimé avec succès");
      setShowDeleteModal(false);
      onClose();

      // Logout after successful deletion
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Erreur lors de la suppression du compte. Veuillez réessayer.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Positioning: below anchor
  const getMenuStyle = (): React.CSSProperties => {
    if (!anchorRef.current) return { display: "none" };
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.right - 260, // right-align
      zIndex: 2000,
      minWidth: 260,
      maxWidth: 320,
      boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
      borderRadius: 18,
      background: "#fff",
      padding: 0,
      animation: open ? "fadeScaleIn 0.22s cubic-bezier(.4,0,.2,1)" : undefined,
      opacity: open ? 1 : 0,
      pointerEvents: open ? "auto" : "none",
      transition: "opacity 0.18s cubic-bezier(.4,0,.2,1)",
    };
  };

  return (
    <>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      {open && (
        <div ref={menuRef} style={getMenuStyle()}>
          <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
              Mon compte
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <img
                src={userData?.avatar || "/icons/autofish_blue_logo.svg"}
                alt={userData?.name}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 14,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "black" }}>
                  {userData?.name}
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>
                  {userData?.email || "-"}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  background: mainBlue,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "4px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                }}
              >
                {userData?.userRole
                  ? userData.userRole.charAt(0).toUpperCase() +
                    userData.userRole.slice(1)
                  : "Client"}
              </span>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <button
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: mainBlue,
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 10,
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => alert("Change password")}
            >
              Modifier mon mot de passe
            </button>
            <button
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: mainBlue,
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 10,
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => {
                setShowDeleteModal(true);
                onClose();
              }}
            >
              Supprimer mon compte
            </button>
            <button
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#e74c3c",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !isDeleting && setShowDeleteModal(false)}
          title="Supprimer mon compte"
        >
          <div style={{ padding: "20px 0" }}>
            <p style={{ marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
              Êtes-vous sûr de vouloir supprimer votre compte ?
            </p>
            <p style={{ marginBottom: 20, fontSize: 14, color: "#e74c3c", lineHeight: 1.6 }}>
              <strong>Cette action est irréversible.</strong> Toutes vos données, y compris vos publications, messages et informations personnelles seront définitivement supprimées.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "1.5px solid #ddd",
                  background: "#fff",
                  color: "#666",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "#e74c3c",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AccountMenu;
