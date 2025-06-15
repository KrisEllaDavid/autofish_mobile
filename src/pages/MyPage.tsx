import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import NavBar from "../components/NavBar";
import { compressImage, validateImage } from "../utils/imageCompression";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import PostCard from "../components/PostCard";
import { Post } from "../mock/posts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Extended Post interface for MyPage with additional properties
interface MyPost extends Post {
  lastModified?: string;
  isLiked?: boolean;
}

// Constants
const DEFAULT_BANNER = "/images/page_banner.jpg";
const MAIN_BLUE = "#00B2D6";
const CATEGORIES = [
  "Sélectionner une catégorie",
  "Produits agricoles",
  "Poissons",
  "Fruits de mer",
  "Épices",
  "Légumes",
  "Céréales",
];
const MODAL_Z_INDEX = 100000;

const defaultBanner = DEFAULT_BANNER;
const cameraIcon = "/icons/camera_icon_white.svg";
const editIconWhite = "/icons/edit-white.svg";
const editIconBlack = "/icons/edit-black.svg";

const MyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userData, updateUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState<string>(
    userData?.page?.banner || defaultBanner
  );
  const [showPageNameModal, setShowPageNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pageName, setPageName] = useState(userData?.page?.pageName || "");
  const [location, setLocation] = useState(userData?.page?.address || "");
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<MyPost | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Post modal state
  const [postImage, setPostImage] = useState<string>("");
  const [postDescription, setPostDescription] = useState("");
  const [postCategory, setPostCategory] = useState(CATEGORIES[0]);
  const [postPrice, setPostPrice] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Load posts from cache or context
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // Try to get from cache first
        const cachedPosts = localStorage.getItem("myPosts");
        if (cachedPosts) {
          const parsedPosts = JSON.parse(cachedPosts);
          // Sort posts by lastModified date
          parsedPosts.sort(
            (a: MyPost, b: MyPost) =>
              new Date(b.lastModified || b.date).getTime() -
              new Date(a.lastModified || a.date).getTime()
          );
          setPosts(parsedPosts);
        } else if (userData?.myPosts) {
          const sortedPosts = [...userData.myPosts].sort(
            (a: MyPost, b: MyPost) =>
              new Date(b.lastModified || b.date).getTime() -
              new Date(a.lastModified || a.date).getTime()
          );
          setPosts(sortedPosts);
          // Cache the posts
          localStorage.setItem("myPosts", JSON.stringify(sortedPosts));
        }
      } catch {
        // Error loading posts - show user-friendly message
        toast.error("Erreur lors du chargement des publications");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [userData?.myPosts]);

  // Banner change
  const handleBannerClick = () => fileInputRef.current?.click();
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      try {
        validateImage(file);
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 600,
          quality: 0.8,
        });
        const reader = new FileReader();
        reader.onload = (ev) => {
          const newBanner = ev.target?.result as string;
          setBanner(newBanner);
          updateUserData({ page: { ...userData?.page, banner: newBanner } });
        };
        reader.readAsDataURL(compressedFile);
      } catch {
        // Error processing image - show user-friendly message
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };

  // Edit page name/location
  const savePageName = () => {
    updateUserData({ page: { ...userData?.page, pageName } });
    setShowPageNameModal(false);
    toast.success("Nom de la page modifié avec succès");
  };
  const saveLocation = () => {
    updateUserData({ page: { ...userData?.page, address: location } });
    setShowLocationModal(false);
    toast.success("Adresse modifiée avec succès");
  };

  // Post modal logic
  const openCreatePostModal = () => {
    setEditingPost(null);
    setPostImage("");
    setPostDescription("");
    setPostCategory(CATEGORIES[0]);
    setPostPrice("");
    setShowPostModal(true);
  };
  const openEditPostModal = (post: MyPost) => {
    setEditingPost(post);
    setPostImage(post.postImage || "");
    setPostDescription(post.description || "");
    setPostCategory(post.category || CATEGORIES[0]);
    setPostPrice(post.price?.toString() || "");
    setShowPostModal(true);
  };
  const handlePostImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      try {
        validateImage(file);
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
        });
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPostImage(ev.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch {
        // Error processing image - show user-friendly message
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };
  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const updatedPosts = posts.filter((p) => p.id !== postToDelete);
      setPosts(updatedPosts);
      localStorage.setItem("myPosts", JSON.stringify(updatedPosts));
      await updateUserData({ myPosts: updatedPosts });
      toast.success("Publication supprimée avec succès");
    } catch {
      // Error deleting post - already handled with toast.error below
      toast.error("Erreur lors de la suppression de la publication");
    } finally {
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const handleSavePost = async () => {
    // Validate form
    if (!postImage) {
      toast.error("Veuillez ajouter une image");
      return;
    }
    if (!postDescription.trim()) {
      toast.error("Veuillez ajouter une description");
      return;
    }
    if (!postCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (
      !postPrice ||
      isNaN(parseFloat(postPrice)) ||
      parseFloat(postPrice) <= 0
    ) {
      toast.error("Veuillez entrer un prix valide");
      return;
    }

    setIsSaving(true);
    try {
      const newPost: MyPost = {
        id: editingPost ? editingPost.id : Date.now().toString(),
        postImage: postImage,
        description: postDescription.trim(),
        category: postCategory,
        price: parseFloat(postPrice),
        producerName: userData?.page?.pageName || "",
        producerAvatar: userData?.avatar || "",
        location: userData?.page?.address || "",
        date: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        likes: editingPost?.likes || 0,
        comments: editingPost?.comments || 0,
        isLiked: editingPost?.isLiked || false,
      };

      let updatedPosts;
      if (editingPost) {
        updatedPosts = posts.map((p) =>
          p.id === editingPost.id ? newPost : p
        );
        toast.success("Publication modifiée avec succès");
      } else {
        updatedPosts = [newPost, ...posts];
        toast.success("Publication créée avec succès");
      }

      // Sort posts by lastModified date
      updatedPosts.sort(
        (a, b) =>
          new Date(b.lastModified || b.date).getTime() -
          new Date(a.lastModified || a.date).getTime()
      );

      setPosts(updatedPosts);
      localStorage.setItem("myPosts", JSON.stringify(updatedPosts));
      await updateUserData({ myPosts: updatedPosts });

      setShowPostModal(false);
    } catch {
      // Error saving post - already handled with toast.error below
      toast.error("Erreur lors de l'enregistrement de la publication");
    } finally {
      setIsSaving(false);
    }
  };

  // Create portal for modal
  const renderModal = () => {
    if (!showPostModal) return null;

    return ReactDOM.createPortal(
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)}>
        <div
          style={{
            maxWidth: 400,
            width: "90vw",
            padding: 24,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: MODAL_Z_INDEX,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 18,
              color: MAIN_BLUE,
            }}
          >
            {editingPost ? "Modifier la publication" : "Nouvelle publication"}
          </div>
          <div className="modal-form-label">Image</div>
          {postImage && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={postImage}
                alt="post"
                className="modal-form-img-preview"
                style={{ width: "100%", maxWidth: "100%", borderRadius: 12 }}
              />
              <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
                {editingPost
                  ? "Choisir une nouvelle image pour remplacer celle-ci"
                  : ""}
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePostImageChange}
            style={{ marginBottom: 12 }}
          />
          <div className="modal-form-label">Description</div>
          <textarea
            className="modal-form-textarea"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            placeholder="Décrivez votre publication..."
          />
          <div className="modal-form-label">Catégorie</div>
          <select
            className="modal-form-select"
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="modal-form-label">Prix</div>
          <input
            className="modal-form-input"
            type="number"
            value={postPrice}
            onChange={(e) => setPostPrice(e.target.value)}
            placeholder="Prix en FCFA"
          />
          <div className="modal-btn-row">
            <button
              className="modal-btn cancel"
              onClick={() => setShowPostModal(false)}
            >
              Annuler
            </button>
            <button
              className="modal-btn save"
              onClick={handleSavePost}
              disabled={isSaving}
            >
              {isSaving
                ? "Enregistrement..."
                : editingPost
                ? "Enregistrer"
                : "Créer"}
            </button>
          </div>
        </div>
      </Modal>,
      document.body
    );
  };

  // Create portal for page name modal
  const renderPageNameModal = () => {
    if (!showPageNameModal) return null;

    return ReactDOM.createPortal(
      <Modal
        isOpen={showPageNameModal}
        onClose={() => setShowPageNameModal(false)}
      >
        <div
          style={{
            maxWidth: 400,
            width: "90vw",
            padding: 24,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: MODAL_Z_INDEX,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 18,
              color: MAIN_BLUE,
            }}
          >
            Modifier le nom de la page
          </div>
          <div className="modal-form-label">Nom de la page</div>
          <input
            className="modal-form-input"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Entrez le nom de votre page"
          />
          <div className="modal-btn-row">
            <button
              className="modal-btn cancel"
              onClick={() => {
                setPageName(userData?.page?.pageName || "");
                setShowPageNameModal(false);
              }}
            >
              Annuler
            </button>
            <button className="modal-btn save" onClick={savePageName}>
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>,
      document.body
    );
  };

  // Create portal for location modal
  const renderLocationModal = () => {
    if (!showLocationModal) return null;

    return ReactDOM.createPortal(
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      >
        <div
          style={{
            maxWidth: 400,
            width: "90vw",
            padding: 24,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: MODAL_Z_INDEX,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 18,
              color: MAIN_BLUE,
            }}
          >
            Modifier l'adresse
          </div>
          <div className="modal-form-label">Adresse</div>
          <input
            className="modal-form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Entrez l'adresse de votre page"
          />
          <div className="modal-btn-row">
            <button
              className="modal-btn cancel"
              onClick={() => {
                setLocation(userData?.page?.address || "");
                setShowLocationModal(false);
              }}
            >
              Annuler
            </button>
            <button className="modal-btn save" onClick={saveLocation}>
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>,
      document.body
    );
  };

  // Create portal for delete confirmation modal
  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    return ReactDOM.createPortal(
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div
          style={{
            maxWidth: 400,
            width: "90vw",
            padding: 24,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: MODAL_Z_INDEX,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 18,
              color: "#FF4B4B",
            }}
          >
            Supprimer la publication
          </div>
          <div style={{ marginBottom: 24, color: "#666" }}>
            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action
            est irréversible.
          </div>
          <div className="modal-btn-row">
            <button
              className="modal-btn cancel"
              onClick={() => {
                setShowDeleteModal(false);
                setPostToDelete(null);
              }}
            >
              Annuler
            </button>
            <button className="modal-btn delete" onClick={confirmDeletePost}>
              Supprimer
            </button>
          </div>
        </div>
      </Modal>,
      document.body
    );
  };

  return (
    <>
      <style>{`
        .fade-in-page { 
          opacity: 0; 
          animation: fadeInPage 0.5s ease-in forwards;
          height: 100vh;
          overflow-y: auto;
          position: relative;
        }
        @keyframes fadeInPage { to { opacity: 1; } }
        .banner { 
          width: 100%; 
          height: 300px; 
          object-fit: cover; 
          position: relative; 
        }
        .banner-overlay { 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(1, 33, 46, 0.7); 
        }
        .banner-camera { 
          position: absolute; 
          bottom: 16px; 
          right: 16px; 
          width: 36px; 
          height: 36px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.12); 
          cursor: pointer; 
          z-index: 3; 
          background: #009cb7; 
          border-radius: 50%; 
        }
        .banner-camera img { width: 22px; height: 22px; }
        .edit-btn { 
          margin-left: 10px; 
          background: #009cb7; 
          border-radius: 50%; 
          width: 32px; 
          height: 32px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
        }
        .edit-btn img { width: 18px; height: 18px; }
        .banner-info { 
          position: absolute; 
          left: 24px; 
          bottom: 24px; 
          z-index: 4; 
          color: #fff; 
        }
        .banner-info-row { 
          display: flex; 
          align-items: center; 
          margin-bottom: 8px; 
        }
        .banner-info-row:last-child { margin-bottom: 0; }
        .banner-info-label { 
          font-size: 15px; 
          font-weight: 400; 
          opacity: 0.9; 
          margin-right: 8px; 
        }
        .banner-info-value { 
          font-size: 22px; 
          font-weight: 700; 
          color: #fff; 
        }
        .banner-info-edit { margin-left: 8px; }
        .publications-section { 
          padding: 0 0 0 0; 
          max-width: 600px;
          margin: 30px 18px 250px 18px;
        }
        .publications-title { 
          color: #000; 
          font-size: 18px; 
          font-weight: 700; 
          margin-bottom: 25px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 20px; 
        }
        .post-card-container {
          width: 100%;
          margin-bottom: 18px;
          position: relative;
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .post-card-container:nth-child(1) { animation-delay: 0.05s; }
        .post-card-container:nth-child(2) { animation-delay: 0.1s; }
        .post-card-container:nth-child(3) { animation-delay: 0.15s; }
        .post-card-container:nth-child(4) { animation-delay: 0.2s; }
        .post-card-container:nth-child(5) { animation-delay: 0.25s; }
        .post-card-container:nth-child(n + 6) { animation-delay: 0.3s; }
        .post-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .post-menu-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        .post-menu-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.05);
        }
        .post-menu-dot {
          width: 4px;
          height: 4px;
          background: #666;
          border-radius: 50%;
          margin: 0 1px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #009cb7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }
        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .empty-state-subtitle {
          font-size: 14px;
          color: #888;
        }
        .publications-add { 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: #009cb7; 
          color: #fff; 
          font-size: 26px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          font-weight: 700; 
        }
        .modal-form-label { font-weight: 600; margin-bottom: 6px; color: #222; }
        .modal-form-input, .modal-form-select, .modal-form-textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1.2px solid #e0e0e0; background: #fff; font-size: 16px; color: #222; margin-bottom: 16px; box-sizing: border-box; }
        .modal-form-textarea { min-height: 80px; resize: vertical; }
        .modal-form-img-preview { width: 100%; max-width: 220px; border-radius: 12px; margin-bottom: 16px; }
        .modal-btn-row { display: flex; justify-content: center; gap: 12px; margin-top: 8px; }
        .modal-btn { padding: 15px 26px; border-radius: 10px; border: none; font-weight: 600; font-size: 16px; cursor: pointer; width: 50%;}
        .modal-btn.save { background: #009cb7; color: #fff; }
        .modal-btn.cancel { background: #eee; color: #222; }
        .modal-btn.delete {
          background: #FF4B4B;
          color: #fff;
        }
        .modal-buttons { width : 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;}
      `}</style>
      <div className="fade-in-page" style={{ marginBottom: "500px" }}>
        <NavBar title="Aperçu de la page" onBack={onBack} />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 300,
            marginBottom: 0,
            background: "#000",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={banner}
            alt="banner"
            className="banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultBanner;
            }}
          />
          <div className="banner-overlay" style={{ height: "100%" }} />
          <div className="banner-camera" onClick={handleBannerClick}>
            <img src={cameraIcon} alt="upload cover" />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleBannerChange}
            />
          </div>
          <div className="banner-info">
            <div className="banner-info-row">
              <span className="banner-info-value">
                {userData?.page?.pageName}
              </span>
              <span
                className="edit-btn banner-info-edit"
                onClick={() => setShowPageNameModal(true)}
              >
                <img src={editIconWhite} alt="edit" />
              </span>
            </div>
            <div className="banner-info-row">
              <span className="banner-info-label">
                <img
                  src="/icons/Location.svg"
                  alt="location"
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 6,
                    opacity: 0.9,
                  }}
                />
                {userData?.page?.address}
              </span>
              <span
                className="edit-btn banner-info-edit"
                onClick={() => setShowLocationModal(true)}
              >
                <img src={editIconWhite} alt="edit" />
              </span>
            </div>
          </div>
        </div>
        <div className="publications-section">
          <div className="publications-title">
            Publications
            <span className="publications-add" onClick={openCreatePostModal}>
              +
            </span>
          </div>
          {isLoading ? (
            <div className="loading-spinner" />
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Aucune publication</div>
              <div className="empty-state-subtitle">
                Vous n'avez pas encore publié
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card-container">
                <PostCard
                  post={post}
                  isLiked={post.isLiked}
                  onLike={() => {}}
                  onComment={() => {}}
                  onProducerClick={() => {}}
                  hideContactButton={true}
                />
                <div className="post-actions">
                  <button
                    className="post-menu-btn"
                    onClick={() => openEditPostModal(post)}
                  >
                    <img
                      src={editIconBlack}
                      alt="edit"
                      style={{ width: 18, height: 18, opacity: 0.7 }}
                    />
                  </button>
                  <button
                    className="post-menu-btn"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <img
                      src="/icons/delete-icon.svg"
                      alt="delete"
                      style={{ width: 18, height: 18, opacity: 0.7 }}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {renderModal()}
        {renderPageNameModal()}
        {renderLocationModal()}
        {renderDeleteModal()}
      </div>
    </>
  );
};

export default MyPage;
