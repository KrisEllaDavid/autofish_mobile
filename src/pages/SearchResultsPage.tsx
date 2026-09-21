import React, { useState, useEffect, useCallback } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Publication } from "../services/api";
import { toast } from "react-toastify";
import { Chip, EmptyState, PostCardSkeleton } from "../components/ui";
import "./SearchResultsPage.css";

const searchIcon = "/icons/Search.svg";

/** Starting points offered before the first query, so the empty search
 *  screen suggests something rather than just waiting. */
const SUGGESTIONS = ["Tilapia", "Crevettes", "Maquereau", "Douala", "Yaoundé"];

type NavTab = "home" | "messages" | "producers" | "profile" | "favorites";

interface SearchResultsPageProps {
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (tab: NavTab) => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onPostClick?: (postId: number) => void;
  initialSearchQuery?: string;
}

const ClearIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  onBack: _onBack,
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

  const runSearch = useCallback(
    async (term: string) => {
      const query = term.trim();
      if (!query) return;

      setIsLoading(true);
      setHasSearched(true);
      setSearchQuery(query);

      try {
        // Filtering happens client-side against a single page of the feed;
        // a server-side search endpoint would replace this.
        const allPublications = await api.getPublicFeed({
          page: 1,
          limit: 100,
          user_categories: userData?.selectedCategories?.map((cat) =>
            parseInt(cat)
          ),
        });

        const needle = query.toLowerCase();
        setResults(
          allPublications.results.filter(
            (pub) =>
              pub.title.toLowerCase().includes(needle) ||
              pub.description.toLowerCase().includes(needle) ||
              pub.location.toLowerCase().includes(needle) ||
              pub.category_name?.toLowerCase().includes(needle)
          )
        );
      } catch {
        toast.error("La recherche a échoué. Réessayez.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [api, userData?.selectedCategories]
  );

  const handleSearch = useCallback(() => {
    if (!searchInput.trim()) {
      toast.info("Entrez un terme à rechercher.");
      return;
    }
    runSearch(searchInput);
  }, [searchInput, runSearch]);

  useEffect(() => {
    if (initialSearchQuery.trim()) runSearch(initialSearchQuery);
    // Runs once for the query handed in by the feed.
  }, []);

  const handleLike = async (publicationId: number) => {
    if (!api.isAuthenticated()) {
      toast.info("Connectez-vous pour aimer une publication.");
      return;
    }

    try {
      await api.likePublication(publicationId);
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
    } catch {
      toast.error("Le like n'a pas pu être enregistré.");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setResults([]);
    setHasSearched(false);
    setSearchQuery("");
  };

  return (
    <div className="search-page">
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

      <div className="search-scroll">
        <div className="search-bar">
          <div className="search-bar__inner">
            <div className="search-bar__field">
              <img
                src={searchIcon}
                alt=""
                aria-hidden="true"
                className="search-bar__icon"
              />
              <input
                type="search"
                className="search-bar__input"
                value={searchInput}
                placeholder="Produit, catégorie, ville…"
                aria-label="Rechercher"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-bar__clear"
                  onClick={clearSearch}
                  aria-label="Effacer la recherche"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="search-results" aria-busy="true">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : !hasSearched ? (
          <div className="search-intro">
            <h2 className="search-intro__title">Suggestions</h2>
            <div className="search-intro__chips">
              {SUGGESTIONS.map((term) => (
                <Chip
                  key={term}
                  onClick={() => {
                    setSearchInput(term);
                    runSearch(term);
                  }}
                >
                  {term}
                </Chip>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<img src={searchIcon} alt="" />}
            title="Aucun résultat"
            description={`Rien ne correspond à « ${searchQuery} ». Essayez un autre terme ou une autre ville.`}
            actionLabel="Effacer la recherche"
            onAction={clearSearch}
          />
        ) : (
          <>
            <p className="search-meta">
              <strong>{results.length}</strong>{" "}
              {results.length > 1 ? "résultats" : "résultat"} pour «{" "}
              {searchQuery} »
            </p>

            <div className="search-results">
              {results.map((pub) => (
                <div key={pub.id} onClick={() => onPostClick?.(pub.id)}>
                  <PostCard
                    id={pub.id.toString()}
                    producerName={pub.page_name || "Producteur"}
                    producerAvatar={
                      pub.producer_picture || "/icons/account_icon.svg"
                    }
                    postImage={
                      pub.picture_url ||
                      pub.picture ||
                      "/icons/autofish_blue_logo.svg"
                    }
                    description={pub.description}
                    date={pub.date_posted}
                    likes={pub.likes_count || pub.likes || 0}
                    comments={pub.comments_count || 0}
                    category={pub.category_name || pub.category.name}
                    location={pub.location}
                    price={pub.price}
                    isLiked={pub.is_liked}
                    producerPhone={pub.producer_phone}
                    postTitle={pub.title}
                    onLike={() => handleLike(pub.id)}
                    hideContactButton={
                      !!(userData && pub.producer === userData.id)
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNavBar
        activeTab={(activeTab as NavTab) || "home"}
        onTabChange={onTabChange}
      />
    </div>
  );
};

export default SearchResultsPage;
