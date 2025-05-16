import React from "react";

interface BottomNavBarProps {
  activeTab: "home" | "messages" | "connections" | "profile";
  onTabChange: (tab: "home" | "messages" | "connections" | "profile") => void;
}

const icons = {
  connections: "/icons/profile-2user-bottom-nav.svg",
  like: "/icons/dark_heart_outline_like.svg",
  home: "/icons/home-2-bottom-nav.svg",
  messages: "/icons/messages-bottom-nav.svg",
  profile: "/icons/profile-bottom-nav.svg",
  comment: "/icons/comment.svg",
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  // Order: connections, like, home, messages, profile
  const leftTabs = [
    { id: "connections", icon: icons.connections },
    { id: "like", icon: icons.like },
  ];
  const rightTabs = [
    { id: "messages", icon: icons.messages },
    { id: "profile", icon: icons.profile },
  ];

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        width: "100vw",
        height: "150px",
        pointerEvents: "none", // Only enable pointer events for children
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        background:
          "linear-gradient(180deg, rgba(217, 217, 217, 0.00) 66.46%, #FFF 78.29%)",
      }}
    >
      {/* SVG Curved Background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="150"
        viewBox="0 0 375 30"
        fill="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1,
        }}
      >
        <path
          data-figma-bg-blur-radius="22"
          d="M0 0H93.75H128.989C142.006 0 153.66 8.06684 158.245 20.2499V20.2499C168.404 47.2497 206.596 47.2497 216.755 20.2499V20.2499C221.34 8.06684 232.994 0 246.011 0H281.25H375V98H0V0Z"
          fill="white"
          fillOpacity="1"
        />
        <defs>
          <clipPath
            id="bgblur_0_2402_1313_clip_path"
            transform="translate(22 22)"
          >
            <path d="M0 0H93.75H128.989C142.006 0 153.66 8.06684 158.245 20.2499V20.2499C168.404 47.2497 206.596 47.2497 216.755 20.2499V20.2499C221.34 8.06684 232.994 0 246.011 0H281.25H375V98H0V0Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Main Bar Content */}
      <div
        style={{
          width: "100vw",
          maxWidth: 430,
          height: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "relative",
          zIndex: 2,
          pointerEvents: "auto",
        }}
      >
        {/* Left icons */}
        <div style={{ display: "flex", gap: 36 }}>
          {leftTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.85,
                width: 36,
                height: 80,
              }}
            >
              <img
                src={tab.icon}
                alt={tab.id}
                style={{ width: 28, height: 28 }}
              />
            </button>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", gap: 36 }}>
          {rightTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.85,
                width: 36,
                height: 80,
              }}
            >
              <img
                src={tab.icon}
                alt={tab.id}
                style={{ width: 28, height: 28 }}
              />
            </button>
          ))}
        </div>

        {/* Floating Home Button */}
        <button
          onClick={() => onTabChange("home")}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, -32px)",
            bottom: 32,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: activeTab === "home" ? "#222" : "#333",
            border:
              activeTab === "home" ? "4px solid #7ee0f6" : "4px solid #fff",
            boxShadow:
              activeTab === "home"
                ? "0 4px 16px 0 #7ee0f6, 0 2px 8px 0 rgba(0,0,0,0.10)"
                : "0 2px 8px 0 rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            cursor: "pointer",
            pointerEvents: "auto",
            transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
            outline: "none",
          }}
        >
          <img src={icons.home} alt="home" style={{ width: 32, height: 32 }} />
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar;
