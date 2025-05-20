import React, { useEffect, useRef } from "react";

interface AccountMenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  userData: {
    name?: string;
    avatar?: string;
    email?: string;
    userRole?: string;
  };
}

const mainBlue = "#00B2D6";

const AccountMenu: React.FC<AccountMenuProps> = ({
  open,
  anchorRef,
  onClose,
  userData,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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
                src={userData.avatar || "/icons/account.svg"}
                alt={userData.name}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 14,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {userData.name}
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>
                  {userData.email || "-"}
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
                {userData.userRole
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
                color: "#e74c3c",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => alert("Déconnexion")}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountMenu;
