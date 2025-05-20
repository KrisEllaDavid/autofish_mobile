import React, { useState, useEffect, useMemo } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import PostCard from "../components/PostCard";
import { mockPosts, Post } from "../mock/posts";
import useLocalStorage from "../hooks/useLocalStorage";
import "./HomePage.css";
import NotificationsPage from "./Notifications/NotificationsPage";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "home" | "messages" | "connections" | "profile"
  >("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>(
    "likedPosts",
    []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("HomePage mounted - userData:", userData);
    console.log("Is bottom nav visible?");
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
    console.log("Comment on post:", postId);
    // In a real app, you would open a comment dialog or navigate to a comments page
  };

  const handleProducerClick = (producerId: string) => {
    console.log("Navigate to producer:", producerId);
    // In a real app, you would navigate to the producer's profile
  };

  const handleTabChange = (
    tab: "home" | "messages" | "connections" | "profile"
  ) => {
    console.log("Tab changed to:", tab);
    setActiveTab(tab);
  };

  const refreshFeed = () => {
    setIsRefreshing(true);

    // Simulate network request
    setTimeout(() => {
      // Shuffle the posts to simulate new content
      setPosts([...mockPosts].sort(() => Math.random() - 0.5));
      setIsRefreshing(false);
    }, 1000);
  };

  if (showNotifications) {
    return (
      <NotificationsPage onBackToHome={() => setShowNotifications(false)} />
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
        onNotificationClick={() => setShowNotifications(true)}
        userRole={userData?.userRole}
        onMyPageClick={() => console.log("My Page clicked")}
        activeTab="home"
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
        {isRefreshing && (
          <div className="refresh-indicator">
            <span className="refresh-spinner">⟳</span>
            Chargement...
          </div>
        )}

        {/* Posts list */}
        {filteredPosts.map((post, index) => (
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
