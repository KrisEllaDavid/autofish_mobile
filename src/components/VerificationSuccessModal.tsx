import React from "react";
import Modal from "./Modal";
import { Button } from "./ui";
import "./VerificationSuccessModal.css";

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BadgeIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--success-600)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z" />
    <path d="m8.8 12.2 2.2 2.2 4.2-4.6" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

const unlocked = [
  "Créer des publications",
  "Gérer vos produits",
  "Échanger avec les clients",
  "Accéder à toute la plateforme",
];

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
  isOpen,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} label="Compte vérifié">
    <div className="verif-modal">
      <div className="verif-modal__badge">
        <BadgeIcon />
      </div>

      <h2 className="modal-title">Compte vérifié</h2>
      <p className="modal-text">
        Votre compte producteur est validé. Vous pouvez commencer à vendre sur
        AutoFish.
      </p>

      <ul className="verif-modal__list">
        {unlocked.map((item) => (
          <li key={item} className="verif-modal__item">
            <span className="verif-modal__check">
              <CheckIcon />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "var(--space-8)" }}>
        <Button size="lg" block onClick={onClose}>
          Commencer
        </Button>
      </div>
    </div>
  </Modal>
);

export default VerificationSuccessModal;
