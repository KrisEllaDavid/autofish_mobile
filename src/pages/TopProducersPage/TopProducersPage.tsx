import React, { useState, useEffect } from "react";
import "./TopProducersPage.css";
import TopNavBar from "../../components/TopNavBar";
import { useApiWithLoading } from "../../services/apiWithLoading";
import { ProducerPage } from "../../services/api";
import { imageService } from "../../services/imageService";

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

// Convert ProducerPage to Producer interface for component compatibility
const convertProducerPageToProducer = (producerPage: ProducerPage): Producer => ({
  id: producerPage.id,
  name: producerPage.name,
  avatar: producerPage.logo || imageService.getFallbackImageUrl('logos'),
  specialty: producerPage.categories.map(cat => cat.name).join(', ') || 'Producteur',
  location: `${producerPage.city}, ${producerPage.country}`,
  rating: 4.5, // TODO: Implement actual rating system
  isVerified: producerPage.is_validated,
});

const TopProducersPage: React.FC<TopProducersPageProps> = ({
  onNotificationClick,
  onMyPageClick,
  activeTab = "producers",
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const api = useApiWithLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real producer data from API
  useEffect(() => {
    const fetchProducers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated before making authenticated requests
        if (!api.isAuthenticated()) {
          setError('Vous devez être connecté pour voir les producteurs');
          setProducers([]);
          setLoading(false);
          return;
        }
        
        // Get all producer pages from API (requires authentication)
        const producerPagesData = await api.getProducerPages();
        
        // Convert to Producer interface and filter only validated producers
        const producersData = producerPagesData
          .filter(page => page.is_validated) // Only show validated producers
          .map(convertProducerPageToProducer);
        
        setProducers(producersData);
        
        if (import.meta.env.DEV) {
          console.log('✅ Loaded producers:', producersData.length);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load producers';
        setError(errorMessage);
        console.error('❌ Failed to load producers:', err);
        setProducers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, []);

  // Get unique categories from loaded producers
  const categories = [
    "Toutes les catégories",
    ...Array.from(new Set(producers.flatMap(p => p.specialty.split(', '))))
  ];

  const filteredProducers = producers.filter((producer) => {
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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Chargement des producteurs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>Erreur: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#00B2D6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Producers List */}
        {!loading && !error && (
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
                    (e.target as HTMLImageElement).src = imageService.getFallbackImageUrl('logos');
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
          
            {filteredProducers.length === 0 && (
              <div className="no-results">
                <p>Aucun producteur trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducersPage; 