import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import { compressImage, validateImage } from "../utils/imageCompression";
import { useAuth } from "../context/AuthContext";
import { normalizeImageUrl } from "../utils/imageUtils";
import Modal from "../components/Modal";
import PostCard from "../components/PostCard";
import { Post } from "../mock/posts";
import { toast } from "react-toastify";
import { useApiWithLoading } from "../services/apiWithLoading";
import { ProducerPage } from "../services/api";
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

interface MyPageProps {
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (tab: "home" | "messages" | "producers" | "profile" | "favorites") => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const MyPage: React.FC<MyPageProps> = ({ 
  onBack: _onBack, 
  onNotificationClick, 
  onMyPageClick, 
  onTabChange,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole
}) => {
  const { userData, updateUserData } = useAuth();
  const api = useApiWithLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [producerPageData, setProducerPageData] = useState<ProducerPage | null>(null);
  const [fetchingPageData, setFetchingPageData] = useState(false);
  const [banner, setBanner] = useState<string>(
    producerPageData?.background_image || userData?.page?.banner || defaultBanner
  );
  const [showPageNameModal, setShowPageNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pageName, setPageName] = useState(
    producerPageData?.name ||
    userData?.page?.pageName ||
    userData?.name ||
    "Ma Page"
  );
  const [location, setLocation] = useState(
    producerPageData?.address ||
    userData?.page?.address ||
    userData?.address ||
    ""
  );
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

  // Fetch producer page data from API
  const fetchProducerPageData = async () => {
    if (userData?.userRole !== 'producteur' || !api.isAuthenticated()) {
      return;
    }

    try {
      setFetchingPageData(true);
      const pageData = await api.getMyProducerPage();
      setProducerPageData(pageData);

      // Update local state with API data
      setBanner(pageData.background_image || defaultBanner);
      setPageName(pageData.name || userData?.name || "Ma Page");
      setLocation(pageData.address || "");

      // Also update the context with fetched data for consistency
      updateUserData({
        page: {
          ...userData?.page,
          pageName: pageData.name,
          banner: pageData.background_image,
          address: pageData.address,
          phone: pageData.telephone,
          country: pageData.country,
        }
      });

      if (import.meta.env.DEV) {
        console.log('✅ Fetched producer page data:', pageData);
      }
    } catch (error) {
      console.error('❌ Failed to fetch producer page data:', error);
      // Don't show error toast if the page doesn't exist yet - user might need to create it
      if (error && typeof error === 'object' && 'status' in error && error.status !== 404) {
        toast.error("Erreur lors du chargement des informations de la page");
      }
    } finally {
      setFetchingPageData(false);
    }
  };

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

  // Fetch producer page data on component mount
  useEffect(() => {
    fetchProducerPageData();
  }, [userData?.userRole]); // Re-fetch if user role changes

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

        // Update banner locally for immediate feedback
        const reader = new FileReader();
        reader.onload = (ev) => {
          const newBanner = ev.target?.result as string;
          setBanner(newBanner);
        };
        reader.readAsDataURL(compressedFile);

        // Update backend if producer page exists
        if (userData?.userRole === 'producteur' && producerPageData) {
          try {
            const updatedPageData = await api.updateProducerPage(producerPageData.slug, {
              background_image: compressedFile
            });

            setProducerPageData(updatedPageData);
            setBanner(updatedPageData.background_image || defaultBanner);

            // Update context
            updateUserData({
              page: {
                ...userData?.page,
                banner: updatedPageData.background_image
              }
            });

            toast.success("Bannière mise à jour avec succès");
          } catch (error) {
            console.error("Failed to update banner:", error);
            toast.error("Erreur lors de la mise à jour de la bannière");
            // Revert banner on error
            setBanner(producerPageData?.background_image || defaultBanner);
          }
        } else {
          // Fallback to local storage for non-producers or if page doesn't exist
          const reader = new FileReader();
          reader.onload = (ev) => {
            const newBanner = ev.target?.result as string;
            updateUserData({ page: { ...userData?.page, banner: newBanner } });
          };
          reader.readAsDataURL(compressedFile);
        }
      } catch {
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };

  // Edit page name/location
  const savePageName = async () => {
    if (userData?.userRole === 'producteur' && producerPageData) {
      try {
        const updatedPageData = await api.updateProducerPage(producerPageData.slug, {
          name: pageName.trim()
        });

        setProducerPageData(updatedPageData);
        setPageName(updatedPageData.name);

        // Update context
        updateUserData({
          page: {
            ...userData?.page,
            pageName: updatedPageData.name
          }
        });

        setShowPageNameModal(false);
        toast.success("Nom de la page modifié avec succès");
      } catch (error) {
        console.error("Failed to update page name:", error);
        toast.error("Erreur lors de la mise à jour du nom de la page");
      }
    } else {
      // Fallback to local storage
      updateUserData({ page: { ...userData?.page, pageName } });
      setShowPageNameModal(false);
      toast.success("Nom de la page modifié avec succès");
    }
  };

  const saveLocation = async () => {
    if (userData?.userRole === 'producteur' && producerPageData) {
      try {
        const updatedPageData = await api.updateProducerPage(producerPageData.slug, {
          address: location.trim()
        });

        setProducerPageData(updatedPageData);
        setLocation(updatedPageData.address);

        // Update context
        updateUserData({
          page: {
            ...userData?.page,
            address: updatedPageData.address
          }
        });

        setShowLocationModal(false);
        toast.success("Adresse modifiée avec succès");
      } catch (error) {
        console.error("Failed to update location:", error);
        toast.error("Erreur lors de la mise à jour de l'adresse");
      }
    } else {
      // Fallback to local storage
      updateUserData({ page: { ...userData?.page, address: location } });
      setShowLocationModal(false);
      toast.success("Adresse modifiée avec succès");
    }
  };

  // Post modal logic
  const openCreatePostModal = () => {
    // Check if user is verified before allowing publication creation
    if (!userData?.is_verified) {
      toast.error("Votre compte doit être vérifié par l'administrateur pour publier");
      return;
    }
    
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

    // Additional verification check for producers
    if (userData?.userRole === 'producteur' && !userData?.is_verified) {
      toast.error("Votre compte doit être vérifié par l'administrateur pour publier");
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
                src={normalizeImageUrl(postImage)}
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
        .my-page-container {
          min-height: 100vh;
          background-color: #f8f9fa;
          display: flex;
          flex-direction: column;
        }
        .fade-in-page {
          opacity: 0;
          animation: fadeInPage 0.5s ease-in forwards;
          flex: 1;
          overflow-y: auto;
          position: relative;
          padding-bottom: 100px;
        }
        @keyframes fadeInPage { to { opacity: 1; } }

        /* Banner Section */
        .banner-container {
          position: relative;
          width: 100%;
          height: 280px;
          background: linear-gradient(135deg, #009cb7 0%, #007a8f 100%);
          overflow: hidden;
          border-radius: 0 0 24px 24px;
          box-shadow: 0 8px 32px rgba(0, 156, 183, 0.15);
        }
        .banner {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 156, 183, 0.8) 0%, rgba(0, 122, 143, 0.9) 100%);
        }
        .banner-camera {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .banner-camera:hover {
          background: #fff;
          transform: scale(1.05);
        }
        .banner-camera img { width: 24px; height: 24px; opacity: 0.8; }

        /* Profile Info */
        .profile-info {
          position: absolute;
          left: 24px;
          bottom: 24px;
          z-index: 4;
          color: #fff;
          max-width: calc(100% - 120px);
        }
        .profile-name {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .profile-name-text {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          margin-right: 12px;
        }
        .edit-btn {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .edit-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
        .edit-btn img { width: 18px; height: 18px; }
        .profile-location {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .profile-location-text {
          font-size: 16px;
          font-weight: 500;
          opacity: 0.95;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          margin-right: 12px;
          display: flex;
          align-items: center;
        }
        .profile-location-text img {
          margin-right: 8px;
        }
        .verification-status {
          margin-top: 8px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-shadow: none;
        }
        .status-verified {
          background: rgba(76, 175, 80, 0.9);
          color: #fff;
        }
        .status-pending {
          background: rgba(255, 107, 53, 0.9);
          color: #fff;
        }

        /* Content Section */
        .content-section {
          padding: 32px 20px 0;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 0 4px;
        }
        .section-title {
          color: #1a1a1a;
          font-size: 20px;
          font-weight: 700;
        }
        .add-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .warning-text {
          font-size: 11px;
          color: #FF6B35;
          font-weight: 500;
          text-align: center;
          max-width: 120px;
          line-height: 1.2;
        }
        .publications-add {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #009cb7 0%, #007a8f 100%);
          color: #fff;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 156, 183, 0.3);
          border: none;
        }
        .publications-add.disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }
        .publications-add:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 156, 183, 0.4);
        }

        /* Posts Grid */
        .posts-grid {
          display: grid;
          gap: 20px;
        }
        .post-card-container {
          position: relative;
          animation: fadeIn 0.4s ease-out forwards;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        .post-card-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .post-card-container:nth-child(1) { animation-delay: 0.1s; }
        .post-card-container:nth-child(2) { animation-delay: 0.2s; }
        .post-card-container:nth-child(3) { animation-delay: 0.3s; }
        .post-card-container:nth-child(4) { animation-delay: 0.4s; }
        .post-card-container:nth-child(5) { animation-delay: 0.5s; }
        .post-card-container:nth-child(n + 6) { animation-delay: 0.6s; }

        .post-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .post-menu-btn {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .post-menu-btn:hover {
          background: #fff;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Loading and Empty States */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #009cb7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 16px;
          margin-top: 12px;
        }
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .empty-state-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        .empty-state-subtitle {
          font-size: 15px;
          color: #666;
          line-height: 1.4;
        }
        .modal-form-label { font-weight: 600; margin-bottom: 6px; color: #222; }
        .modal-form-input, .modal-form-select, .modal-form-textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1.2px solid #e0e0e0; background: #fff; font-size: 16px; color: #222; margin-bottom: 16px; box-sizing: border-box; }
        .modal-form-textarea { min-height: 80px; resize: vertical; }
        .modal-form-img-preview { width: 100%; max-width: 220px; border-radius: 12px; margin-bottom: 16px; }
        .modal-btn-row { display: flex; justify-content: center; gap: 12px; margin-top: 8px; }
        .modal-btn { padding: 15px 26px; border-radius: 10px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; width: 50%;}
        .modal-btn.save { background: #009cb7; color: #fff; }
        .modal-btn.cancel { background: #eee; color: #222; }
        .modal-btn.delete {
          background: #FF4B4B;
          color: #fff;
        }
        .modal-buttons { width : 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;}
      `}</style>
      <div className="my-page-container">
        <TopNavBar
          title="Ma page"
          userAvatar={userAvatar}
          userName={userName}
          userEmail={userEmail}
          onNotificationClick={onNotificationClick}
          userRole={userRole}
          onMyPageClick={onMyPageClick}
          activeTab={activeTab}
        />
        <div className="fade-in-page">
          {/* Banner Section */}
          <div className="banner-container">
            <img
              src={normalizeImageUrl(banner)}
              alt="banner"
              className="banner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultBanner;
              }}
            />
            <div className="banner-overlay" />

            {fetchingPageData && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 5
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e0e0e0',
                  borderTop: '2px solid #00B2D6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Chargement des informations...
                </span>
              </div>
            )}

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

            <div className="profile-info">
              <div className="profile-name">
                <span className="profile-name-text">
                  {producerPageData?.name || userData?.page?.pageName || userData?.name || 'Ma Page'}
                </span>
                <div
                  className="edit-btn"
                  onClick={() => setShowPageNameModal(true)}
                >
                  <img src={editIconWhite} alt="edit" />
                </div>
              </div>

              <div className="profile-location">
                <span className="profile-location-text">
                  <img
                    src="/icons/Location.svg"
                    alt="location"
                    style={{
                      width: 16,
                      height: 16,
                      opacity: 0.9,
                      filter: 'brightness(0) invert(1)'
                    }}
                  />
                  {producerPageData?.address || userData?.page?.address || 'Aucune adresse'}
                </span>
                <div
                  className="edit-btn"
                  onClick={() => setShowLocationModal(true)}
                >
                  <img src={editIconWhite} alt="edit" />
                </div>
              </div>

              {userData?.userRole === 'producteur' && (
                <div className="verification-status">
                  {userData?.is_verified ? (
                    <span className="status-badge status-verified">
                      ✅ Compte vérifié
                    </span>
                  ) : (
                    <span className="status-badge status-pending">
                      ⏳ En attente de vérification
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Mes Publications</h2>
              {userData?.userRole === 'producteur' && (
                <div className="add-button-container">
                  {!userData?.is_verified && (
                    <div className="warning-text">
                      ⚠️ Compte en attente de vérification
                    </div>
                  )}
                  <button
                    className={`publications-add ${!userData?.is_verified ? 'disabled' : ''}`}
                    onClick={openCreatePostModal}
                    disabled={!userData?.is_verified}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">Aucune publication</div>
                <div className="empty-state-subtitle">
                  Vous n'avez pas encore publié de contenu.<br />
                  Créez votre première publication pour commencer!
                </div>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-card-container">
                    <PostCard
                      id={post.id}
                      producerName={post.producerName}
                      producerAvatar={post.producerAvatar}
                      postImage={post.postImage}
                      description={post.description}
                      date={post.date}
                      likes={post.likes}
                      comments={post.comments}
                      category={post.category}
                      location={post.location}
                      price={post.price}
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
                        title="Modifier"
                      >
                        <img
                          src={editIconBlack}
                          alt="edit"
                          style={{ width: 20, height: 20, opacity: 0.7 }}
                        />
                      </button>
                      <button
                        className="post-menu-btn"
                        onClick={() => handleDeletePost(post.id)}
                        title="Supprimer"
                      >
                        <img
                          src="/icons/delete-icon.svg"
                          alt="delete"
                          style={{ width: 20, height: 20, opacity: 0.7 }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        {renderModal()}
        {renderPageNameModal()}
        {renderLocationModal()}
        {renderDeleteModal()}
        </div>
        <BottomNavBar activeTab="profile" onTabChange={onTabChange} />
      </div>
    </>
  );
};

export default MyPage;
