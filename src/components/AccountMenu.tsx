import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { Avatar, Banner, Button, Chip } from "./ui";
import "./AccountMenu.css";

interface AccountMenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onChangePassword?: () => void;
}

const MENU_WIDTH = 268;
const EDGE_GAP = 12;

const AccountMenu: React.FC<AccountMenuProps> = ({
  open,
  anchorRef,
  onClose,
  onChangePassword,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { userData, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Measured before paint so the menu never appears in the wrong place for a
  // frame, and clamped to the viewport so it cannot hang off a narrow screen.
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const maxLeft = window.innerWidth - MENU_WIDTH - EDGE_GAP;
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(EDGE_GAP, Math.min(rect.right - MENU_WIDTH, maxLeft)),
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, anchorRef]);

  const handleLogout = () => {
    onClose();
    toast.info("Déconnexion…");
    setTimeout(() => logout(), 500);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { apiClient } = await import("../services/api");
      await apiClient.deleteAccount();

      toast.success("Votre compte a été supprimé.");
      setShowDeleteModal(false);
      onClose();
      setTimeout(() => logout(), 1000);
    } catch (error) {
      let message = "Le compte n'a pas pu être supprimé. Réessayez.";
      if (error && typeof error === "object") {
        if ("message" in error) message = (error as { message: string }).message;
        else if ("error" in error) message = (error as { error: string }).error;
      }
      toast.error(message, { autoClose: 5000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const roleLabel = userData?.userRole
    ? userData.userRole.charAt(0).toUpperCase() + userData.userRole.slice(1)
    : "Client";

  return (
    <>
      {open && position && (
        <div
          ref={menuRef}
          className="af-menu account-menu"
          role="menu"
          aria-label="Mon compte"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: MENU_WIDTH,
          }}
        >
          <div className="account-menu__identity">
            <Avatar
              src={userData?.avatar}
              name={userData?.name}
              size="lg"
              alt=""
            />
            <div className="account-menu__details">
              <p className="account-menu__name">{userData?.name}</p>
              <p className="account-menu__email">{userData?.email}</p>
              <Chip as="span" tone="brand" className="account-menu__role">
                {roleLabel}
              </Chip>
            </div>
          </div>

          <div className="af-menu__separator" />

          <button
            type="button"
            role="menuitem"
            className="af-menu__item"
            onClick={() => {
              onClose();
              onChangePassword?.();
            }}
          >
            Modifier mon mot de passe
          </button>

          <button
            type="button"
            role="menuitem"
            className="af-menu__item"
            onClick={handleLogout}
          >
            Se déconnecter
          </button>

          <div className="af-menu__separator" />

          <button
            type="button"
            role="menuitem"
            className="af-menu__item af-menu__item--danger"
            onClick={() => {
              setShowDeleteModal(true);
              onClose();
            }}
          >
            Supprimer mon compte
          </button>
        </div>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !isDeleting && setShowDeleteModal(false)}
          label="Supprimer mon compte"
        >
          <h2 className="modal-title">Supprimer votre compte ?</h2>
          <p className="modal-text">
            Vos publications, vos messages et vos informations personnelles
            seront définitivement effacés.
          </p>

          <Banner
            tone="danger"
            title="Cette action est irréversible"
            style={{ marginTop: "var(--space-7)" }}
          >
            Aucune de ces données ne pourra être récupérée après la
            suppression.
          </Banner>

          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={isDeleting}
              loadingLabel="Suppression…"
            >
              Supprimer
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AccountMenu;
