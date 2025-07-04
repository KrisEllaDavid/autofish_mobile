import React, { useState, useEffect, useMemo } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import PostCard from "../components/PostCard";
import { mockPosts, Post } from "../mock/posts";
import useLocalStorage from "../hooks/useLocalStorage";
import "./HomePage.css";
import NotificationsPage from "./Notifications/NotificationsPage";
import MyPage from "./MyPage";
import { useAuth } from "../context/AuthContext";

type MainTab = "home" | "messages" | "connections" | "profile" | "myPage";

enum Overlay {
  None = "none",
  Notifications = "notifications",
}

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [overlay, setOverlay] = useState<Overlay>(Overlay.None);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>(
    "likedPosts",
    []
  );
  const [search, setSearch] = useState("");

  // Debug logging
  useEffect(() => {
    // TODO: Add analytics tracking for HomePage mount
    // TODO: Add bottom navigation visibility tracking
  }, [userData]);

  // Load and sort posts, prioritizing user's selected categories
  useEffect(() => {
    // Clone the posts array to avoid mutating the original
    const sortedPosts = [...mockPosts];

    // If user has selected categories, prioritize them
    if (
      userData?.selectedCategories &&
      userData.selectedCategories.length > 0
    ) {
      sortedPosts.sort((a, b) => {
        const aMatch =
          userData.selectedCategories?.includes(a.category) || false;
        const bMatch =
          userData.selectedCategories?.includes(b.category) || false;

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    setPosts(sortedPosts);
  }, [userData?.selectedCategories]);

  // Filter posts by search
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        post.producerName.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q)
    );
  }, [search, posts]);

  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }

    // Update UI immediately
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: likedPosts.includes(postId)
                ? post.likes - 1
                : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
  };

  const handleProducerClick = (producerId: string) => {
    // TODO: Navigate to producer profile
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
  //     // setPosts([...newPosts]);
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
      <div className="home-container">
        <TopNavBar
          title="Ma page"
          userAvatar={userData?.avatar}
          userName={userData?.name}
          userEmail={userData?.email}
          onNotificationClick={handleNotificationClick}
          userRole={userData?.userRole}
          onMyPageClick={handleMyPageClick}
          activeTab="myPage"
        />
        <MyPage onBack={goHome} />
        <BottomNavBar activeTab="profile" onTabChange={handleTabChange} />
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
      />
      {/* Search Bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "80px 0 16px 0",
          background: "white",
          height: "80px",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: 700,
            background: "#f7f7f7",
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            height: 56,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <img
            src="/icons/Search.svg"
            alt="search"
            style={{ width: 24, height: 24, opacity: 0.5, marginRight: 12 }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un producteur..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 18,
              width: "100%",
              color: "#222",
            }}
          />
        </div>
      </div>
      {/* Posts Feed - Only this part should be scrollable */}
      <div className="posts-feed">
        {/* Pull to refresh indicator */}
        {/* {isRefreshing && (
          <div className="refresh-indicator">
            <span className="refresh-spinner">⟳</span>
            Chargement...
          </div>
        )} */}

        {/* Posts list */}
        {filteredPosts.map((post) => (
          <div key={post.id} className="post-animation">
            <PostCard
              post={post}
              isLiked={likedPosts.includes(post.id)}
              onLike={handleLike}
              onComment={handleComment}
              onProducerClick={handleProducerClick}
            />
          </div>
        ))}

        {/* Add extra space at the bottom to ensure content doesn't hide behind bottom nav */}
        <div style={{ height: "70px" }}></div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default HomePage;
