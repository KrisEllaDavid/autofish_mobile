import React, { useState } from "react";
import "./TopProducersPage.css";
import TopNavBar from "../../components/TopNavBar";

interface Producer {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  location: string;
  rating: number;
  isVerified: boolean;
}

interface TopProducersPageProps {
  onBackToHome?: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

// Mock data for producers (replace with API call)
const mockProducers: Producer[] = [
  {
    id: 1,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-1.jpg",
    specialty: "Poissons frais",
    location: "Dakar, Sénégal",
    rating: 4.8,
    isVerified: true,
  },
  {
    id: 2,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-2.jpg",
    specialty: "Fruits de mer",
    location: "Dakar, Sénégal",
    rating: 4.5,
    isVerified: true,
  },
  {
    id: 3,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-3.jpg",
    specialty: "Poissons d'élevage",
    location: "Dakar, Sénégal",
    rating: 4.9,
    isVerified: true,
  },
  {
    id: 4,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-4.jpg",
    specialty: "Poissons exotiques",
    location: "Dakar, Sénégal",
    rating: 4.7,
    isVerified: true,
  },
  {
    id: 5,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-5.jpg",
    specialty: "Poissons frais",
    location: "Dakar, Sénégal",
    rating: 4.6,
    isVerified: true,
  },
  {
    id: 6,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-6.jpg",
    specialty: "Fruits de mer",
    location: "Dakar, Sénégal",
    rating: 4.4,
    isVerified: true,
  },
  {
    id: 7,
    name: "Rosio AutoFish-Store",
    avatar: "/images/producer-avatar-7.jpg",
    specialty: "Poissons d'élevage",
    location: "Dakar, Sénégal",
    rating: 4.8,
    isVerified: true,
  },
];

const TopProducersPage: React.FC<TopProducersPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "producers",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");

  const categories = [
    "Toutes les catégories",
    "Poissons frais",
    "Fruits de mer",
    "Poissons d'élevage",
    "Poissons exotiques",
  ];

  const filteredProducers = mockProducers.filter((producer) => {
    const matchesSearch = producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         producer.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Toutes les catégories" || 
                           producer.specialty === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProducerClick = (producerId: number) => {
    console.log("Navigate to producer profile:", producerId);
    // TODO: Navigate to producer detail page
  };

  const handleViewProfile = (producerId: number) => {
    console.log("View producer profile:", producerId);
    // TODO: Navigate to producer profile view
  };

  return (
    <div className="top-producers-page">
      <TopNavBar
        title="Producteurs"
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        onNotificationClick={onNotificationClick}
        userRole={userRole}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      <div className="producers-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-input-container">
            <img src="/icons/Search.svg" alt="search" className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un producteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Producers List */}
        <div className="producers-list">
          {filteredProducers.map((producer, index) => (
            <div
              key={producer.id}
              className="producer-card"
              onClick={() => handleProducerClick(producer.id)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="producer-avatar">
                <img
                  src={producer.avatar}
                  alt={producer.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/60x60/00B2D6/ffffff?text=P";
                  }}
                />
                {producer.isVerified && (
                  <div className="verification-badge">
                    <img src="/icons/Check.svg" alt="verified" />
                  </div>
                )}
              </div>

              <div className="producer-info">
                <div className="producer-header">
                  <h3 className="producer-name">{producer.name}</h3>
                  <div className="producer-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">{producer.rating}</span>
                  </div>
                </div>
                <p className="producer-specialty">{producer.specialty}</p>
                <p className="producer-location">{producer.location}</p>
              </div>

              <button
                className="view-profile-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile(producer.id);
                }}
              >
                <img src="/icons/Eye Open.svg" alt="view" />
                <span>voir</span>
              </button>
            </div>
          ))}
        </div>

        {filteredProducers.length === 0 && (
          <div className="no-results">
            <p>Aucun producteur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducersPage; 