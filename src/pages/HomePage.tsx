import React, { useState, useEffect, useMemo } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import PostCard from "../components/PostCard";
import VerificationStatusBanner from "../components/VerificationStatusBanner";
import VerificationSuccessModal from "../components/VerificationSuccessModal";
import useLocalStorage from "../hooks/useLocalStorage";
import { useVerificationStatus } from "../hooks/useVerificationStatus";
import "./HomePage.css";
import NotificationsPage from "./Notifications/NotificationsPage";
import MyPage from "./MyPage";
import TopProducersPage from "./TopProducersPage/TopProducersPage";
import FavoritePostsPage from "./FavoritePostsPage/FavoritePostsPage";
import MessagesPage from "./MessagesPage/MessagesPage";
import MyAccountPage from "./MyAccountPage/MyAccountPage";
import { useAuth } from "../context/AuthContext";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Publication, ProducerPage } from "../services/api";

type MainTab = "home" | "messages" | "producers" | "profile" | "myPage" | "favorites";

enum Overlay {
  None = "none",
  Notifications = "notifications",
}

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const api = useApiWithLoading();
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [overlay, setOverlay] = useState<Overlay>(Overlay.None);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [producerPages, setProducerPages] = useState<{[key: number]: ProducerPage}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastPublicationCount, setLastPublicationCount] = useLocalStorage<number>('lastPublicationCount', 0);
  const [hasNewPublications, setHasNewPublications] = useState<boolean>(false);
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>(
    "likedPosts",
    []
  );
  const [search, setSearch] = useState("");

  // Pagination state for lazy loading
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Verification status monitoring
  const { showVerificationModal, closeVerificationModal } = useVerificationStatus();

  // Debug logging
  useEffect(() => {
    // TODO: Add analytics tracking for HomePage mount
    // TODO: Add bottom navigation visibility tracking
  }, [userData]);

  // Load publications with pagination and preference-based sorting
  const fetchPublications = async (page: number, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Get user's category IDs for preference sorting
      const userCategoryIds = userData?.selectedCategories?.map(cat => parseInt(cat)) || [];

      // Fetch paginated feed with user preferences
      const feedResponse = await api.getPublicFeed({
        page,
        limit: 20,
        user_categories: userCategoryIds.length > 0 ? userCategoryIds : undefined
      });

      // Update publications (append for lazy loading, replace for initial)
      if (append) {
        setPublications(prev => [...prev, ...feedResponse.results]);
      } else {
        setPublications(feedResponse.results);
      }

      // Update pagination state
      setCurrentPage(feedResponse.page);
      setHasMore(feedResponse.next !== null);

      // Check for new publications
      if (!append && feedResponse.count > lastPublicationCount) {
        setHasNewPublications(true);
      }
      setLastPublicationCount(feedResponse.count);

      // Try to fetch producer page data if user is authenticated (only on initial load)
      if (!append) {
        const producerPagesData: {[key: number]: ProducerPage} = {};
        
        try {
          // Check if user is authenticated before making authenticated requests
          if (import.meta.env.DEV) {
            console.log('🔍 Authentication check:', {
              userData: !!userData,
              isAuthenticated: api.isAuthenticated(),
              hasToken: !!api.getAccessToken()
            });
          }
          
          if (userData && api.isAuthenticated()) {
            if (import.meta.env.DEV) {
              console.log('🔑 User authenticated, fetching producer pages...');
            }
            const allProducerPages = await api.getProducerPages();
            
            // Create a lookup map of page ID to producer page data
            allProducerPages.forEach(page => {
              producerPagesData[page.id] = page;
            });
            
            if (import.meta.env.DEV) {
              console.log('✅ Loaded producer pages with authentication:', allProducerPages.length);
            }
          } else {
            if (import.meta.env.DEV) {
              console.log('⚠️ User not authenticated, creating minimal producer data from publications');
            }
            
            // Create minimal producer data from publication page IDs when not authenticated
            const uniquePageIds = [...new Set(feedResponse.results.map((pub: Publication) => pub.page))];
            uniquePageIds.forEach((pageId: number) => {
              producerPagesData[pageId] = {
                id: pageId,
                producer: 0,
                name: `Producteur #${pageId}`,
                slug: `producer-${pageId}`,
                country: '',
                address: '',
                telephone: '',
                categories: [],
                city: '',
                description: '',
                is_validated: true,
                created_at: '',
                updated_at: '',
              };
            });
          }
        } catch (producerError) {
          // If producer pages fail to load, continue with publications only
          if (import.meta.env.DEV) {
            console.warn('⚠️ Failed to load producer pages, continuing with publications only:', producerError);
          }
        }
        
        setProducerPages(producerPagesData);
      }

    } catch (err) {
      // Handle different types of errors more gracefully
      let errorMessage = 'Failed to load publications';

      if (err && typeof err === 'object') {
        // Handle API error responses
        if ('detail' in err && typeof err.detail === 'string') {
          errorMessage = err.detail;
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Failed to load publications:', err);

      // Set empty arrays so the UI can still render
      if (!append) {
        setPublications([]);
        setProducerPages({});
      }
    } finally {
      if (!append) {
        setLoading(false);
        setInitialLoad(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    // Wait for auth context to be ready before making any requests
    if (userData === undefined) {
      if (import.meta.env.DEV) {
        console.log('⏳ Waiting for auth context to initialize...');
      }
      return;
    }

    fetchPublications(1, false);
  }, [userData]); // Add userData as dependency so it refetches when user logs in

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          // Load next page when bottom element is visible
          fetchPublications(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage]);

  // Removed pull-to-refresh feature

  // Sort publications, prioritizing user's selected categories
  const sortedPublications = useMemo(() => {
    const sorted = [...publications];

    // If user has selected categories, prioritize them
    if (
      userData?.selectedCategories &&
      userData.selectedCategories.length > 0
    ) {
      sorted.sort((a, b) => {
        const aMatch =
          userData.selectedCategories?.includes(a.category.name) || false;
        const bMatch =
          userData.selectedCategories?.includes(b.category.name) || false;

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return sorted;
  }, [publications, userData?.selectedCategories]);

  // Filter publications by search
  const filteredPublications = useMemo(() => {
    if (!search.trim()) return sortedPublications;
    const q = search.trim().toLowerCase();
    return sortedPublications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(q) ||
        pub.category.name.toLowerCase().includes(q) ||
        pub.description.toLowerCase().includes(q) ||
        pub.location.toLowerCase().includes(q)
    );
  }, [search, sortedPublications]);

  const handleLike = async (publicationId: number) => {
    // Check if user is authenticated before attempting to like
    if (!userData || !userData.registrationComplete) {
      // TODO: Show login modal or redirect to login
      console.log('User must be logged in to like posts');
      alert('Veuillez vous connecter pour aimer cette publication.');
      return;
    }

    try {
      const result = await api.toggleLikePublication(publicationId);
      
      // Update the publication in the list
      setPublications(prev => prev.map(pub => {
        if (pub.id === publicationId) {
          return {
            ...pub,
            likes: result.status === 'added to favorites' ? pub.likes + 1 : pub.likes - 1
          };
        }
        return pub;
      }));

      // Update local storage for liked posts
      if (result.status === 'added to favorites') {
        setLikedPosts([...likedPosts, publicationId.toString()]);
      } else {
        setLikedPosts(likedPosts.filter((id) => id !== publicationId.toString()));
      }

      console.log(result.status === 'added to favorites' ? 'Added to favorites!' : 'Removed from favorites');
    } catch (err) {
      let errorMessage = 'Failed to update like';
      
      // Handle authentication errors specifically
      if (err && typeof err === 'object') {
        if ('detail' in err) {
          errorMessage = err.detail as string;
          
          // If it's an authentication error, inform the user
          if (errorMessage.toLowerCase().includes('authentication') || 
              errorMessage.toLowerCase().includes('token') ||
              errorMessage.toLowerCase().includes('unauthorized')) {
            alert('Votre session a expiré. Veuillez vous reconnecter.');
            // TODO: Redirect to login or refresh token
            return;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('Failed to update like:', errorMessage);
      alert('Erreur lors de la mise à jour du like: ' + errorMessage);
    }
  };

  const handleComment = (publicationId: number) => {
    // TODO: Implement comment functionality
    console.log('Comment on publication:', publicationId);
  };

  const handleProducerClick = (producerId: number) => {
    // TODO: Navigate to producer profile
    console.log('Navigate to producer:', producerId);
  };

  // --- Navigation Logic ---
  // Always go to home, clear overlays
  const goHome = () => {
    setActiveTab("home");
    setOverlay(Overlay.None);
  };

  // BottomNavBar tab change
  const handleTabChange = (tab: MainTab) => {
    if (tab === "home") {
      goHome();
      return;
    }
    setActiveTab(tab);
    setOverlay(Overlay.None);
  };

  // TopNavBar notification click
  const handleNotificationClick = () => {
    setOverlay(Overlay.Notifications);
    // Clear new publications indicator when user checks notifications
    setHasNewPublications(false);
  };

  // TopNavBar my page click
  const handleMyPageClick = () => {
    setOverlay(Overlay.None);
    setActiveTab("myPage");
  };

  // TODO: Connect to pull-to-refresh functionality
  // const refreshFeed = () => {
  //   setIsRefreshing(true);
  //   // Simulate feed refresh
  //   setTimeout(() => {
  //     // Refresh logic here
  //     // setPublications([...newPublications]);
  //     setIsRefreshing(false);
  //   }, 1500);
  // };

  // Show notifications overlay
  if (overlay === Overlay.Notifications) {
    return (
      <NotificationsPage
        onBackToHome={goHome}
        onNotificationClick={handleNotificationClick}
        onMyPageClick={handleMyPageClick}
        onTabChange={handleTabChange}
        activeTab="notifications"
        userAvatar={userData?.avatar}
        userName={userData?.name}
        userEmail={userData?.email}
        userRole={userData?.userRole}
      />
    );
  }

  // Show my page
  if (activeTab === "myPage") {
    return (
      <MyPage 
        onBack={goHome}
        onNotificationClick={handleNotificationClick}
        onMyPageClick={handleMyPageClick}
        onTabChange={handleTabChange}
        activeTab="myPage"
        userAvatar={userData?.avatar}
        userName={userData?.name}
        userEmail={userData?.email}
        userRole={userData?.userRole}
      />
    );
  }

  // Show favorites page
  if (activeTab === "favorites") {
    return (
      <div className="home-container">
        <FavoritePostsPage
          onNotificationClick={handleNotificationClick}
          onMyPageClick={handleMyPageClick}
          activeTab="favorites"
          userAvatar={userData?.avatar}
          userName={userData?.name}
          userEmail={userData?.email}
          userRole={userData?.userRole}
        />
        <BottomNavBar activeTab="favorites" onTabChange={handleTabChange} />
      </div>
    );
  }

  // Show messages page
  if (activeTab === "messages") {
    return (
      <div className="home-container">
        <MessagesPage
          onNotificationClick={handleNotificationClick}
          onMyPageClick={handleMyPageClick}
          activeTab="messages"
          userAvatar={userData?.avatar}
          userName={userData?.name}
          userEmail={userData?.email}
          userRole={userData?.userRole}
        />
        <BottomNavBar activeTab="messages" onTabChange={handleTabChange} />
      </div>
    );
  }

  // Show profile/account page
  if (activeTab === "profile") {
    return (
      <div className="home-container">
        <MyAccountPage
          onNotificationClick={handleNotificationClick}
          onMyPageClick={handleMyPageClick}
          activeTab="profile"
          userAvatar={userData?.avatar}
          userName={userData?.name}
          userEmail={userData?.email}
          userRole={userData?.userRole}
        />
        <BottomNavBar activeTab="profile" onTabChange={handleTabChange} />
      </div>
    );
  }

  // Show producers page
  if (activeTab === "producers") {
    return (
      <div className="home-container">
        <TopProducersPage
          onBackToHome={goHome}
          onNotificationClick={handleNotificationClick}
          onMyPageClick={handleMyPageClick}
          activeTab="producers"
          userAvatar={userData?.avatar}
          userName={userData?.name}
          userEmail={userData?.email}
          userRole={userData?.userRole}
        />
        <BottomNavBar activeTab="producers" onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <TopNavBar
        title="Accueil"
        userAvatar={userData?.avatar}
        userName={userData?.name}
        userEmail={userData?.email}
        onNotificationClick={handleNotificationClick}
        userRole={userData?.userRole}
        onMyPageClick={handleMyPageClick}
        activeTab={activeTab}
        hasNewPublications={hasNewPublications}
      />
      {/* Search Bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "80px 0 16px 0",
          backgroundColor: "white",
          height: "80px",
          padding: "0 16px",
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            position: "relative",
          }}
        >
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              backgroundColor: "white",
            }}
          />
        </div>
      </div>

      {/* Verification Status Banner */}
      <VerificationStatusBanner />

      {/* Content */}
      <div className="content">
        <div
          className="posts-feed"
          style={{ position: 'relative' }}
        >
          {loading && initialLoad ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #00B2D6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '20px auto'
              }} />
              <p>Chargement des publications...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
              <p>Erreur: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#00B2D6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <img src="/icons/autofish_blue_logo.svg" alt="publications" />
              </div>
              <h2>Aucune publication disponible</h2>
              <p>Il n'y a pas encore de publications à afficher. Revenez plus tard!</p>
            </div>
          ) : (
            <div className="posts-container">
              {filteredPublications.map((publication) => {
                const producerPage = producerPages[publication.page];
                return (
                  <PostCard
                    key={publication.id}
                    id={publication.id.toString()}
                    producerName={publication.page_name || producerPage?.name || 'Producteur inconnu'}
                    producerAvatar={producerPage?.logo || '/icons/account_icon.svg'}
                    postImage={publication.picture_url || publication.picture || '/icons/autofish_blue_logo.svg'}
                    description={publication.description}
                    date={publication.date_posted}
                    likes={publication.likes_count || publication.likes || 0}
                    comments={0} // TODO: Implement comments system
                    category={publication.category_name || publication.category.name}
                    location={publication.location}
                    price={publication.price}
                    producerPhone={publication.producer_phone || producerPage?.telephone}
                    postTitle={publication.title}
                    onLike={() => handleLike(publication.id)}
                    onComment={() => handleComment(publication.id)}
                    onProducerClick={() => handleProducerClick(publication.producer || 0)}
                    isLiked={publication.is_liked !== undefined ? publication.is_liked : likedPosts.includes(publication.id.toString())}
                  />
                );
              })}

              {/* Loading more indicator */}
              {loadingMore && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '30px 0',
                  color: '#009CB7'
                }}>
                  <div style={{
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #009CB7',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              )}

              {/* Intersection observer target for infinite scroll */}
              <div
                ref={observerTarget}
                style={{ height: '10px', width: '100%' }}
                aria-hidden="true"
              />

              {/* No more posts message */}
              {!hasMore && publications.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px 0',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  Vous avez vu toutes les publications
                </div>
              )}

              {/* Spacer element to add 100px after the last post */}
              <div style={{ height: '100px', width: '100%' }} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Verification Success Modal */}
      <VerificationSuccessModal
        isOpen={showVerificationModal}
        onClose={closeVerificationModal}
      />
    </div>
  );
};

export default HomePage;
