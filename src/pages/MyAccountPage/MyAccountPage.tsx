import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { useLoading } from "../../context/LoadingContext";
import { apiClient } from "../../services/api";
import { normalizeImageUrl } from "../../utils/imageUtils";
import useLocalStorage from "../../hooks/useLocalStorage";
import TopNavBar from "../../components/TopNavBar";
import "./MyAccountPage.css";

interface MyAccountPageProps {
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAddress?: string;
  userRole?: string;
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab,
  userAvatar: propsUserAvatar,
  userName: propsUserName,
  userEmail: propsUserEmail,
  userRole: propsUserRole,
}) => {
  const { userData, updateUserData } = useAuth();
  const api = useApiWithLoading();
  const { withLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [producersContactedCount, setProducersContactedCount] = useState(0);
  const [likedPublicationsCount, setLikedPublicationsCount] = useState(0);
  const [likedPosts] = useLocalStorage<string[]>("likedPosts", []);

  // Fetch statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch chats to count unique producers contacted
        const chats = await api.getChats();
        const uniqueProducers = new Set(
          chats.map(chat =>
            chat.producer === userData?.id ? chat.consumer : chat.producer
          ).filter(id => id !== null && id !== undefined)
        );
        setProducersContactedCount(uniqueProducers.size);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (userData?.id) {
      fetchStats();
    }

    // Set liked publications count from local storage
    setLikedPublicationsCount(likedPosts.length);
  }, [userData?.id, likedPosts.length]);

  // Use real user data from AuthContext, with fallbacks from props
  const userAvatar = userData?.avatar || propsUserAvatar;
  const userName = userData?.name || propsUserName || "Utilisateur";
  const userEmail = userData?.email || propsUserEmail || "";

  // For producers, phone and address come from the producer page
  // For consumers, they come directly from user data
  const isProducer = userData?.userRole === 'producteur';
  const userPhone = isProducer
    ? (userData?.page?.phone || "")
    : (userData?.phone || "");
  const userAddress = isProducer
    ? (userData?.page?.address || "")
    : (userData?.address || "");
  const userRole = userData?.userRole || propsUserRole;

  const getInitials = () => {
    if (!userName) return "U";
    const names = userName.split(" ");
    return names.map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  const [address, setAddress] = useState(userAddress);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form fields when userData loads
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setPhone(userData.phone || "");
      setAddress(userData.address || "");
    }
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleAvatarEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop grande. Veuillez choisir une image de moins de 5 MB.");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Veuillez choisir une image valide.");
        return;
      }

      // Upload immediately with global loading
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      // Use withLoading to show global loading screen
      const response = await withLoading(apiClient.updateCurrentUser({
        profile_picture: file,
      }));

      // Update local context with new avatar URL
      updateUserData({
        avatar: response.profile_picture_url || response.profile_picture,
      });

      alert("Photo de profil mise à jour avec succès!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Erreur lors de la mise à jour de la photo de profil");
    }
  };

  const handleUpdateClick = async () => {
    if (!userData) return;

    try {
      // Extract first and last name from full name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Call backend to update profile using the new API method
      const response = await apiClient.updateCurrentUser({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
      });

      // Update local context with new data
      updateUserData({
        name: `${response.first_name || ''} ${response.last_name || ''}`.trim(),
        phone: response.phone,
        address: response.address,
      });

      setIsEditing(false);
      alert("Profil mis à jour avec succès!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <div className="my-account-page">
      {/* Top Navigation */}
      <TopNavBar
        title="Profil"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        onNotificationClick={onNotificationClick}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      {/* Profile Content */}
      <div className="profile-content" style={{ marginTop: '80px' }}>
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            {userAvatar ? (
              <img
                src={normalizeImageUrl(userAvatar)}
                alt={userName}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-initials">
                {getInitials()}
              </div>
            )}
            <button
              className="profile-avatar-edit"
              onClick={handleAvatarEditClick}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#00b2d6"/>
                <path d="M10 6.5v7M6.5 10h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{producersContactedCount}</div>
            <div className="profile-stat-label">Producteurs<br/>contactés</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{likedPublicationsCount}</div>
            <div className="profile-stat-label">Publications<br/>likées</div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="profile-fields">
          {/* Name */}
          <div className="profile-field">
            <div className="profile-field-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16 17v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className="profile-field-input"
              placeholder="Nom complet"
            />
            <button
              className="profile-field-edit"
              onClick={handleEditClick}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.166 2.5a2.12 2.12 0 0 1 3 3L6.25 16.416l-4.167 1.25 1.25-4.167L14.166 2.5z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Phone */}
          <div className="profile-field">
            <div className="profile-field-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.333 14.1v2.5a1.667 1.667 0 0 1-1.816 1.667 16.492 16.492 0 0 1-7.192-2.559 16.25 16.25 0 0 1-5-5A16.492 16.492 0 0 1 1.767 3.517 1.667 1.667 0 0 1 3.425 1.7h2.5a1.667 1.667 0 0 1 1.667 1.434c.105.792.3 1.567.583 2.316a1.667 1.667 0 0 1-.375 1.759l-1.058 1.058a13.333 13.333 0 0 0 5 5l1.058-1.058a1.667 1.667 0 0 1 1.759-.375c.749.283 1.524.478 2.316.583a1.667 1.667 0 0 1 1.434 1.692z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="profile-field-input"
              placeholder="Téléphone"
            />
            <button
              className="profile-field-edit"
              onClick={handleEditClick}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.166 2.5a2.12 2.12 0 0 1 3 3L6.25 16.416l-4.167 1.25 1.25-4.167L14.166 2.5z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Address */}
          <div className="profile-field">
            <div className="profile-field-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 8.333c0 5.834-7.5 10-7.5 10s-7.5-4.166-7.5-10a7.5 7.5 0 1 1 15 0z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="8.333" r="2.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing}
              className="profile-field-input"
              placeholder="Adresse"
            />
            <button
              className="profile-field-edit"
              onClick={handleEditClick}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.166 2.5a2.12 2.12 0 0 1 3 3L6.25 16.416l-4.167 1.25 1.25-4.167L14.166 2.5z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Update Button */}
        <button className="profile-update-button" onClick={handleUpdateClick}>
          Mettre à jour
        </button>
      </div>
    </div>
  );
};

export default MyAccountPage;



