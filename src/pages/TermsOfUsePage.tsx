import React from "react";
import NavBar from "../components/NavBar";

const autofishBlueLogo = "/icons/autofish_blue_logo.svg";

interface TermsOfUsePageProps {
  onBack?: () => void;
}

const TermsOfUsePage: React.FC<TermsOfUsePageProps> = ({ onBack }) => {
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
        .terms-content {
          padding: 20px;
          padding-bottom: 40px;
        }
        .terms-content h1 {
          font-size: 24px;
          font-weight: 700;
          color: #009CB7;
          text-align: center;
          margin-bottom: 8px;
          font-family: "Arial Rounded MT Bold", Arial, sans-serif;
        }
        .terms-content .subtitle {
          font-size: 16px;
          font-style: italic;
          color: #666;
          text-align: center;
          margin-bottom: 24px;
        }
        .terms-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: #009CB7;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .terms-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #222;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .terms-content p {
          font-size: 14px;
          color: #444;
          line-height: 1.6;
          margin-bottom: 12px;
          text-align: justify;
        }
        .terms-content ul {
          margin-left: 20px;
          margin-bottom: 12px;
        }
        .terms-content li {
          font-size: 14px;
          color: #444;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .terms-content strong {
          font-weight: 600;
          color: #222;
        }
        .terms-content .last-updated {
          font-size: 13px;
          color: #888;
          font-style: italic;
          margin-bottom: 20px;
          text-align: center;
        }
        .terms-content .contact-box {
          background: #f5f5f5;
          border-left: 4px solid #009CB7;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .terms-content .contact-box p {
          margin-bottom: 4px;
        }
      `}</style>
      <div
        className="fade-in-page"
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          paddingTop: 64,
        }}
      >
        <NavBar title="Conditions d'utilisation" onBack={onBack} />

        <div className="terms-content">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img
              src={autofishBlueLogo}
              alt="Autofish Logo"
              style={{ width: 60, height: 60, marginBottom: 12 }}
            />
          </div>

          <h1>CONDITIONS D'UTILISATION</h1>
          <div className="subtitle">Application Mobile Auto-Fish Store</div>
          <div className="last-updated">Dernière mise à jour : 01 janvier 2026</div>

          <h2>1. INTRODUCTION ET CHAMP D'APPLICATION</h2>
          <p>
            Les présentes Conditions d'Utilisation (ci-après « Conditions ») régissent l'accès à et l'utilisation de l'application mobile Auto-Fish Store (ci-après « Application ») et de ses services. L'Application est une plateforme numérique de mise en relation entre producteurs agropastoraux ou agroalimentaires et consommateurs, développée et exploitée par l'entité juridique responsable (ci-après « Opérateur »).
          </p>
          <p>
            En téléchargeant, en accédant à ou en utilisant l'Application, vous acceptez d'être lié par l'intégralité de ces Conditions. Si vous n'acceptez pas ces termes, veuillez cesser d'utiliser l'Application immédiatement.
          </p>

          <h2>2. DÉFINITIONS</h2>

          <h3>Utilisateur</h3>
          <p>Toute personne physique ou morale qui crée un compte et utilise l'Application.</p>

          <h3>Producteur</h3>
          <p>Personne physique ou morale proposant des produits agroalimentaires à la vente via la plateforme Auto-Fish Store.</p>

          <h3>Consommateur</h3>
          <p>Personne physique qui utilise l'Application pour rechercher, contacter les producteurs et acquérir des produits agroalimentaires.</p>

          <h3>Produit</h3>
          <p>Bien agroalimentaire (aquaculture, fruits, légumes, élevage, etc.) proposé à la vente par un Producteur.</p>

          <h3>Publication</h3>
          <p>Annonce ou présentation de Produit créée par un Producteur et affichée sur l'Application.</p>

          <h3>Chat/Messagerie</h3>
          <p>Système de communication intégré permettant aux Producteurs et Consommateurs d'échanger des messages et des informations relatives à une transaction.</p>

          <h2>3. ACCÈS À L'APPLICATION ET CRÉATION DE COMPTE</h2>

          <h3>3.1 Conditions d'Accès</h3>
          <ul>
            <li>L'accès à l'Application est réservé aux personnes physiques ou morales agissant à titre personnel ou professionnel et ayant la capacité juridique d'accepter ces Conditions.</li>
            <li>Les mineurs (personnes de moins de 18 ans) ne peuvent pas créer un compte Producteur, mais peuvent créer un compte Consommateur avec l'autorisation parentale explicite.</li>
            <li>L'Opérateur se réserve le droit de refuser l'accès à toute personne non-conforme à ces conditions.</li>
          </ul>

          <h3>3.2 Inscription des Producteurs</h3>
          <p>L'inscription d'un Producteur sur l'Application nécessite la fourniture des informations suivantes :</p>
          <ul>
            <li><strong>Adresse Email</strong> : Validation par lien de confirmation</li>
            <li><strong>Identité</strong> : Vérification admin (CNI, Passport)</li>
            <li><strong>Mot de Passe</strong> : Min. 8 caractères + chiffre + majuscule</li>
            <li><strong>Téléphone</strong> : Format +237 ou +242</li>
            <li><strong>Catégories de Produits</strong> : Max 2 catégories</li>
          </ul>
          <p><strong>Étapes d'activation d'un compte Producteur :</strong></p>
          <ul>
            <li>Vérification de l'email via lien de confirmation (envoyé par Auto-Fish Store)</li>
            <li>Approbation manuelle par l'Administrateur de la plateforme</li>
            <li>Création et validation de la Page Producteur avant publication de produits</li>
          </ul>

          <h3>3.3 Inscription des Consommateurs</h3>
          <p>L'inscription d'un Consommateur nécessite :</p>
          <ul>
            <li>Adresse email valide (vérification par lien de confirmation)</li>
            <li>Mot de passe sécurisé (min. 8 caractères, 1 chiffre, 1 majuscule)</li>
            <li>Prénom (2-30 caractères)</li>
            <li>Sexe (Masculin/Féminin)</li>
            <li>Ville de résidence (sélection dans liste prédéfinie)</li>
          </ul>
          <p><strong>Accès immédiat</strong> : Le compte Consommateur est actif immédiatement après la vérification de l'email. Aucune approbation administrative n'est requise.</p>

          <h2>4. RESPONSABILITÉS DES UTILISATEURS</h2>

          <h3>4.1 Responsabilités Communes</h3>
          <ul>
            <li>Fournir des informations exactes, complètes et à jour lors de l'inscription</li>
            <li>Maintenir la confidentialité de vos identifiants d'accès et mot de passe</li>
            <li>Notifier immédiatement l'Opérateur en cas d'accès non autorisé ou d'utilisation frauduleuse de votre compte</li>
            <li>Respecter les lois et réglementations applicables dans votre juridiction</li>
            <li>Ne pas utiliser l'Application à des fins illégales, frauduleuses ou préjudiciables</li>
          </ul>

          <h3>4.2 Responsabilités Spécifiques des Producteurs</h3>
          <ul>
            <li><strong>Qualité et Authenticité</strong> : Garantir que tous les produits proposés sont authentiques, de bonne qualité et conformes aux descriptions publiées</li>
            <li><strong>Conformité Légale</strong> : Respecter toutes les normes sanitaires, phytosanitaires et légales applicables aux produits agropastoraux ou agroalimentaires</li>
            <li><strong>Documentation</strong> : Conserver et fournir sur demande toute documentation relative à la provenance et la qualité des produits</li>
            <li><strong>Tarification Transparente</strong> : Afficher des prix clairs, honnêtes et sans frais cachés</li>
            <li><strong>Communication Responsable</strong> : Répondre aux demandes des Consommateurs de manière diligente et honnête</li>
            <li><strong>Stock et Disponibilité</strong> : Maintenir des informations précises sur la disponibilité et la quantité de produits</li>
          </ul>

          <h3>4.3 Responsabilités Spécifiques des Consommateurs</h3>
          <ul>
            <li><strong>Communication Honnête</strong> : Interagir avec les Producteurs de manière respectueuse et honnête</li>
            <li><strong>Respect des Accords</strong> : Honorer les engagements de commande et de paiement convenus avec les Producteurs</li>
            <li><strong>Feedback Authentique</strong> : Fournir des avis et notation basés sur une expérience réelle et en accord avec les faits</li>
            <li><strong>Absence d'Abus</strong> : Ne pas harceler, menacer ou insulter les Producteurs via le système de messagerie</li>
          </ul>

          <h2>5. PUBLICATIONS, CONTENU ET MODÉRATION</h2>

          <h3>5.1 Publication de Produits</h3>
          <p>Chaque Publication doit inclure :</p>
          <ul>
            <li>Description détaillée du produit</li>
            <li>Prix unitaire clair</li>
            <li>Quantité disponible</li>
            <li>Localisation précise</li>
            <li>Catégorie pertinente</li>
            <li>Photos ou images de bonne qualité (le cas échéant)</li>
          </ul>

          <h3>5.2 Validation et Modération</h3>
          <p>Chaque Publication est sujette à une modération administrative avant d'être rendue visible aux Consommateurs. L'Administrateur vérifie :</p>
          <ul>
            <li>La conformité avec les règles de la plateforme</li>
            <li>L'absence de contenu offensant, diffamatoire ou illégal</li>
            <li>La pertinence du produit pour la plateforme</li>
            <li>La qualité et l'exactitude des informations fournies</li>
          </ul>

          <h3>5.3 Contenu Prohibé</h3>
          <p>Les utilisateurs s'engagent à ne pas publier ou partager de contenu :</p>
          <ul>
            <li>Illégal ou violant les lois applicables</li>
            <li>Offensant, abusif, harcelant, ou discriminatoire</li>
            <li>Diffamatoire ou portant atteinte à la réputation</li>
            <li>Contenant du spam, des mots-clés artificiels ou des liens malveillants</li>
            <li>Contrefait, faux ou trompeur</li>
            <li>Violant les droits d'auteur, marques déposées ou propriété intellectuelle d'autrui</li>
            <li>Représentant un danger pour la santé publique ou l'environnement</li>
          </ul>

          <h2>6. SYSTÈME DE CHAT ET MESSAGERIE</h2>

          <h3>6.1 Fonctionnement Général</h3>
          <p>Le système de Chat intégré permet aux Consommateurs de contacter les Producteurs pour obtenir des informations sur les produits ou négocier les termes d'une transaction.</p>
          <p>Les messages échangés via le Chat constituent des preuves de communication et peuvent être utilisés en cas de litige.</p>

          <h3>6.2 Règles de Conduite</h3>
          <ul>
            <li>Utiliser le Chat uniquement à des fins de discussion relative aux transactions ou aux produits</li>
            <li>Respecter la dignité et les droits d'autrui</li>
            <li>Ne pas partager d'informations sensibles (numéros de compte bancaire, mots de passe)</li>
            <li>Ne pas envoyer de spam, de contenu offensant ou de liens malveillants</li>
            <li>Répondre aux demandes de manière diligente et professionnelle</li>
          </ul>

          <h2>7. SYSTÈME DE NOTATION ET AVIS</h2>
          <p>Les Consommateurs peuvent noter les pages des Producteurs sur une échelle de 1 à 5 étoiles et laisser des commentaires. Les avis doivent être basés sur une expérience réelle, honnêtes et objectifs.</p>

          <h2>8. TRANSACTIONS ET RESPONSABILITÉ</h2>
          <p>Auto-Fish Store est une plateforme de mise en relation. L'Opérateur facilite la communication entre Producteurs et Consommateurs, mais n'est pas responsable de :</p>
          <ul>
            <li>La qualité, la sécurité ou la légalité des produits proposés</li>
            <li>La livraison, l'emballage ou la conservation des produits</li>
            <li>Les paiements ou transactions directes entre Producteurs et Consommateurs</li>
            <li>Les litiges ou malentendus entre utilisateurs</li>
          </ul>

          <h2>9. DONNÉES PERSONNELLES ET CONFIDENTIALITÉ</h2>
          <p>L'Opérateur collecte et traite les données personnelles nécessaires au fonctionnement de la plateforme conformément aux lois sur la protection des données applicables.</p>
          <p><strong>Vous avez le droit de :</strong></p>
          <ul>
            <li>Accéder à vos données personnelles</li>
            <li>Rectifier les informations inexactes</li>
            <li>Demander la suppression de vos données (dans les limites légales)</li>
            <li>Retirer votre consentement à tout moment</li>
          </ul>

          <h2>10. GESTION DE COMPTE, SUSPENSION ET SUPPRESSION</h2>
          <p>L'Opérateur peut suspendre un compte si l'utilisateur viole ces Conditions, engage des activités frauduleuses, harcèle d'autres utilisateurs, ou publie du contenu illégal.</p>
          <p>Vous pouvez demander la suppression de votre compte à tout moment en contactant le service client.</p>

          <h2>11. PROPRIÉTÉ INTELLECTUELLE</h2>
          <p>L'Application, son interface et tout contenu créé par l'Opérateur sont protégés par les lois sur le droit d'auteur et la propriété intellectuelle.</p>
          <p>Vous conservez la propriété intellectuelle du contenu que vous créez, mais accordez à l'Opérateur une licence pour l'afficher sur la plateforme.</p>

          <h2>12. LIMITATION DE RESPONSABILITÉ</h2>
          <p>L'Application est fournie "en l'état". L'Opérateur ne peut garantir l'absence d'interruptions, d'erreurs ou la disponibilité continue de la plateforme.</p>

          <h2>13. MODIFICATIONS DES CONDITIONS</h2>
          <p>L'Opérateur se réserve le droit de modifier ces Conditions à tout moment. Les modifications seront communiquées via une notification dans l'Application ou par email.</p>

          <h2>14. LOI APPLICABLE ET JURIDICTION</h2>
          <p>Les présentes Conditions sont régies par les lois en vigueur au Cameroun et en République du Congo. En cas de litige, les parties acceptent la juridiction compétente du lieu de résidence du Producteur.</p>

          <h2>15. CONTACT</h2>
          <div className="contact-box">
            <p><strong>Opérateur Auto-Fish Store</strong></p>
            <p>Email : autofish.cmcg@gmail.com</p>
            <p>Téléphone : +237 695 79 05 82 / +242 06 782 66 88</p>
            <p>Adresse : 24 Rue Eymard ITOBA, Massengo, Djiri, Brazzaville</p>
          </div>

          <div className="last-updated" style={{ marginTop: 32, marginBottom: 0 }}>
            Dernière mise à jour : 01 Janvier 2026
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUsePage;
