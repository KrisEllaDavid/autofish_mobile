import React, { useState, useEffect, useCallback } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Publication } from "../services/api";
import { toast } from "react-toastify";

const MAIN_BLUE = "#00B2D6";
const searchIcon = "/icons/Search.svg";

interface SearchResultsPageProps {
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (tab: "home" | "messages" | "producers" | "profile" | "favorites") => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onPostClick?: (postId: number) => void;
  initialSearchQuery?: string;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  onBack,
  onNotificationClick,
  onMyPageClick,
  onTabChange,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole,
  onPostClick,
  initialSearchQuery = "",
}) => {
  const { userData } = useAuth();
  const api = useApiWithLoading();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [results, setResults] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) {
      toast.info("Veuillez entrer un terme de recherche");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSearchQuery(searchInput);

    try {
      // Fetch all publications and filter client-side
      // In production, you'd want server-side search
      const allPublications = await api.getPublicFeed(1, 100, userData?.selectedCategories);

      const query = searchInput.trim().toLowerCase();
      const filtered = allPublications.results.filter(
        (pub) =>
          pub.title.toLowerCase().includes(query) ||
          pub.description.toLowerCase().includes(query) ||
          pub.location.toLowerCase().includes(query) ||
          (pub.category_name && pub.category_name.toLowerCase().includes(query))
      );

      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Erreur lors de la recherche");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchInput, api, userData?.selectedCategories]);

  // Auto-search on mount if initial query provided
  useEffect(() => {
    if (initialSearchQuery.trim()) {
      handleSearch();
    }
  }, []);

  const handleLike = async (publicationId: number) => {
    if (!api.isAuthenticated()) {
      toast.info("Veuillez vous connecter pour aimer une publication");
      return;
    }

    try {
      await api.likePublication(publicationId);

      // Update local state
      setResults((prev) =>
        prev.map((pub) =>
          pub.id === publicationId
            ? {
                ...pub,
                is_liked: !pub.is_liked,
                likes_count: pub.is_liked
                  ? (pub.likes_count || 0) - 1
                  : (pub.likes_count || 0) + 1,
              }
            : pub
        )
      );
    } catch (error) {
      console.error("Error liking publication:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNavBar
        title="Recherche"
        userAvatar={userAvatar || userData?.avatar}
        userName={userName || userData?.name}
        userEmail={userEmail || userData?.email}
        userRole={userRole || userData?.userRole}
        onNotificationClick={onNotificationClick}
        onMyPageClick={onMyPageClick}
        activeTab={activeTab}
      />

      {/* Search Section */}
      <div
        style={{
          width: "100%",
          backgroundColor: "white",
          padding: "96px 16px 16px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Back Button */}
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: MAIN_BLUE,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 16,
              padding: 0,
            }}
          >
            <span style={{ fontSize: 18 }}>←</span>
            <span>Retour</span>
          </button>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#222",
              marginBottom: 16,
            }}
          >
            Rechercher des produits
          </h1>

          {/* Search Input */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: 8,
            }}
          >
            <input
              type="text"
              placeholder="Entrez le nom du produit, catégorie, localisation..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                backgroundColor: "white",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = MAIN_BLUE;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                padding: "14px 24px",
                backgroundColor: MAIN_BLUE,
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #ffffff40",
                      borderTop: "2px solid #ffffff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Recherche...
                </>
              ) : (
                <>
                  <img
                    src={searchIcon}
                    alt="search"
                    style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }}
                  />
                  Rechercher
                </>
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#999",
              marginTop: 8,
            }}
          >
            💡 Astuce : Essayez de rechercher par catégorie (ex: Poisson, Manioc) ou par ville
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div
        style={{
          flex: 1,
          padding: "24px 16px 100px 16px",
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {!hasSearched ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              🔍
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: "#222",
              }}
            >
              Trouvez les produits que vous cherchez
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              Utilisez la barre de recherche ci-dessus pour trouver des produits par nom, catégorie ou localisation.
            </p>
          </div>
        ) : isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: `4px solid ${MAIN_BLUE}40`,
                borderTop: `4px solid ${MAIN_BLUE}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px auto",
              }}
            />
            <p>Recherche en cours...</p>
          </div>
        ) : results.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              😕
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: "#222",
              }}
            >
              Aucun résultat trouvé
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Nous n'avons trouvé aucun produit correspondant à "<strong>{searchQuery}</strong>"
            </p>
            <p style={{ fontSize: 14, color: "#999" }}>
              Essayez avec d'autres mots-clés ou vérifiez l'orthographe
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 4,
                }}
              >
                Résultats de recherche
              </h2>
              <p style={{ fontSize: 14, color: "#666" }}>
                {results.length} produit{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""} pour "
                <strong>{searchQuery}</strong>"
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {results.map((pub) => (
                <div
                  key={pub.id}
                  onClick={() => onPostClick?.(pub.id)}
                  style={{ cursor: "pointer" }}
                >
                  <PostCard
                    id={pub.id.toString()}
                    producerName={pub.page_name || "Producteur"}
                    producerAvatar={userAvatar || "/icons/autofish_blue_logo 1.png"}
                    postImage={pub.picture_url || pub.picture || ""}
                    description={pub.description}
                    date={pub.date_posted}
                    likes={pub.likes_count || pub.likes || 0}
                    comments={0}
                    category={pub.category_name || ""}
                    location={pub.location}
                    price={pub.price}
                    isLiked={pub.is_liked || false}
                    producerPhone={pub.producer_phone}
                    postTitle={pub.title}
                    onLike={() => handleLike(pub.id)}
                    onComment={() => {}}
                    onProducerClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNavBar activeTab={activeTab || "home"} onTabChange={onTabChange} />

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchResultsPage;
