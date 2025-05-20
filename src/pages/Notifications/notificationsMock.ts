import { mockPosts } from "../../mock/posts";

export interface Notification {
  id: string;
  type: "new_post" | "like";
  user: {
    name: string;
    avatar: string | null;
  };
  message: string;
  date: string;
  seen: boolean;
  postId: string;
}

// Generate notifications from posts
export const notifications: Notification[] = mockPosts.slice(0, 5).map((post, idx) => ({
  id: String(idx + 1),
  type: "new_post",
  user: {
    name: post.producerName,
    avatar: post.producerAvatar,
  },
  message: `a publié un nouveau produit : ${post.category}`,
  date: "Aujourd'hui, 15:30",
  seen: false,
  postId: post.id,
}));

// Example: add a like notification for the first post
notifications.push({
  id: "like-1",
  type: "like",
  user: {
    name: "Dada",
    avatar: null,
  },
  message: `a liké votre publication : ${mockPosts[0].category}`,
  date: "Aujourd'hui, 15:30",
  seen: false,
  postId: mockPosts[0].id,
}); 