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
  pageIsValidated?: boolean;
  willAppearInFeed?: boolean;
}

// Constants
const MAIN_BLUE = "#00B2D6";
const cameraIcon = "/icons/camera_icon_white.svg";
const editIconWhite = "/icons/edit-white.svg";
const editIconBlack = "/icons/edit-black.svg";

interface MyPageProps {
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (
    tab: "home" | "messages" | "producers" | "profile" | "favorites"
  ) => void;
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
  userRole,
}) => {
  const { userData, updateUserData } = useAuth();
  const api = useApiWithLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedPageData = useRef(false);
  const [producerPageData, setProducerPageData] = useState<ProducerPage | null>(
    null
  );
  const [fetchingPageData, setFetchingPageData] = useState(false);
  const [banner, setBanner] = useState<string>(
    userData?.page?.banner || ""
  );
  const [showPageNameModal, setShowPageNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pageName, setPageName] = useState(
    userData?.page?.pageName ||
      userData?.name ||
      "Ma Page"
  );
  const [location, setLocation] = useState(
    userData?.page?.address ||
      userData?.address ||
      ""
  );
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<MyPost | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Categories from API
  const [categories, setCategories] = useState<string[]>([
    "Sélectionner une catégorie",
  ]);

  // Post modal state
  const [postImage, setPostImage] = useState<string>("");
  const [postDescription, setPostDescription] = useState("");
  const [postCategory, setPostCategory] = useState(
    "Sélectionner une catégorie"
  );
  const [postPrice, setPostPrice] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Fetch producer page data from API
  const fetchProducerPageData = async () => {
    if (userData?.userRole !== "producteur" || !api.isAuthenticated()) {
      return;
    }

    // Prevent duplicate fetches
    if (hasFetchedPageData.current || fetchingPageData) {
      return;
    }

    try {
      setFetchingPageData(true);
      hasFetchedPageData.current = true;
      const pageData = await api.getMyProducerPage();
      setProducerPageData(pageData);

      // Update local state with API data
      // Use background_image_url if available, fallback to background_image
      const bannerUrl = pageData.background_image_url || pageData.background_image || "";
      console.log("🖼️ Banner URL from API:", {
        background_image_url: pageData.background_image_url,
        background_image: pageData.background_image,
        finalBannerUrl: bannerUrl
      });
      setBanner(bannerUrl);
      setPageName(pageData.name || userData?.name || "Ma Page");
      setLocation(pageData.address || "");

      // Also update the context with fetched data for consistency
      updateUserData({
        page: {
          ...userData?.page,
          pageName: pageData.name,
          banner: bannerUrl,
          address: pageData.address,
          phone: pageData.telephone,
          country: pageData.country,
        },
      });

      if (import.meta.env.DEV) {
        console.log("✅ Fetched producer page data:", pageData);
      }
    } catch (error) {
      console.error("❌ Failed to fetch producer page data:", error);

      // If page doesn't exist, show clear error message
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as any).status === 404
      ) {
        toast.error(
          "Page producteur non trouvée. Veuillez contacter le support."
        );
      } else {
        toast.error("Erreur lors du chargement des informations de la page");
      }
    } finally {
      setFetchingPageData(false);
    }
  };

  // Load posts from API
  const fetchPublications = async () => {
    if (userData?.userRole !== "producteur" || !api.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const publications = await api.getMyPublications();

      // Convert API publications to MyPost format
      const convertedPosts: MyPost[] = publications.map((pub) => ({
        id: pub.id.toString(),
        postImage: pub.picture_url || pub.picture || "",
        description: pub.description,
        category: pub.category_name || pub.category.name,
        price: pub.price,
        producerName: pub.page_name || userData?.page?.pageName || "",
        producerAvatar: userData?.avatar || "",
        location: pub.location,
        date: pub.date_posted,
        lastModified: pub.date_posted,
        likes: pub.likes_count || pub.likes || 0,
        comments: 0, // TODO: Add comments when backend supports it
        isLiked: pub.is_liked || false,
        pageIsValidated: pub.page_is_validated,
        willAppearInFeed: pub.will_appear_in_feed,
      }));

      setPosts(convertedPosts);

      if (import.meta.env.DEV) {
        console.log("✅ Fetched publications:", publications);
      }
    } catch (error) {
      console.error("❌ Failed to fetch publications:", error);
      toast.error("Erreur lors du chargement des publications");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const apiCategories = await api.getCategories();
      const categoryNames = [
        "Sélectionner une catégorie",
        ...apiCategories.map((cat) => cat.name),
      ];
      setCategories(categoryNames);
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      // Keep default category if fetch fails
    }
  };

  // Load posts from API on mount
  useEffect(() => {
    fetchPublications();
    fetchCategories();
  }, []);

  // Fetch producer page data on component mount (only once)
  useEffect(() => {
    if (userData?.userRole === "producteur" && !hasFetchedPageData.current) {
      fetchProducerPageData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
        if (userData?.userRole === "producteur" && producerPageData) {
          try {
            console.log("🔄 Uploading banner to backend...");
            const updatedPageData = await api.updateProducerPage(
              producerPageData.slug,
              {
                background_image: compressedFile,
              }
            );

            console.log("✅ Banner upload response:", updatedPageData);
            console.log("📸 background_image:", updatedPageData.background_image);
            console.log("🌐 background_image_url:", updatedPageData.background_image_url);

            setProducerPageData(updatedPageData);
            // Use background_image_url if available, fallback to background_image
            const updatedBanner = updatedPageData.background_image_url || updatedPageData.background_image || "";
            console.log("🖼️ Setting banner to:", updatedBanner);
            setBanner(updatedBanner);

            // Update context
            updateUserData({
              page: {
                ...userData?.page,
                banner: updatedBanner,
              },
            });

            toast.success("Bannière mise à jour avec succès");
          } catch (error) {
            console.error("❌ Failed to update banner:", error);
            toast.error("Erreur lors de la mise à jour de la bannière");
            // Revert banner on error
            const revertBanner = producerPageData?.background_image_url || producerPageData?.background_image || "";
            setBanner(revertBanner);
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
    if (userData?.userRole === "producteur" && producerPageData) {
      try {
        const updatedPageData = await api.updateProducerPage(
          producerPageData.slug,
          {
            name: pageName.trim(),
          }
        );

        setProducerPageData(updatedPageData);
        setPageName(updatedPageData.name);

        // Update context
        updateUserData({
          page: {
            ...userData?.page,
            pageName: updatedPageData.name,
          },
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
    if (userData?.userRole === "producteur" && producerPageData) {
      try {
        const updatedPageData = await api.updateProducerPage(
          producerPageData.slug,
          {
            address: location.trim(),
          }
        );

        setProducerPageData(updatedPageData);
        setLocation(updatedPageData.address);

        // Update context
        updateUserData({
          page: {
            ...userData?.page,
            address: updatedPageData.address,
          },
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
      toast.error(
        "Votre compte doit être vérifié par l'administrateur pour publier"
      );
      return;
    }

    setEditingPost(null);
    setPostImage("");
    setPostDescription("");
    setPostCategory(categories[0]);
    setPostPrice("");
    setShowPostModal(true);
  };
  const openEditPostModal = (post: MyPost) => {
    setEditingPost(post);
    setPostImage(post.postImage || "");
    setPostDescription(post.description || "");
    setPostCategory(post.category || categories[0]);
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
      // Delete from backend API
      await api.deletePublication(parseInt(postToDelete));

      // Update local state after successful API call
      const updatedPosts = posts.filter((p) => p.id !== postToDelete);
      setPosts(updatedPosts);

      toast.success("Publication supprimée avec succès");
    } catch (error) {
      console.error("❌ Failed to delete publication:", error);
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
    if (!postCategory || postCategory === "Sélectionner une catégorie") {
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
    if (userData?.userRole === "producteur" && !userData?.is_verified) {
      toast.error(
        "Votre compte doit être vérifié par l'administrateur pour publier"
      );
      return;
    }

    if (!producerPageData?.id) {
      toast.error(
        "Votre page producteur n'a pas été trouvée. Veuillez contacter le support.",
        {
          autoClose: 5000,
        }
      );
      return;
    }

    setIsSaving(true);
    try {
      // Fetch categories to get category ID
      const categories = await api.getCategories();
      const categoryObj = categories.find((cat) => cat.name === postCategory);

      if (!categoryObj) {
        toast.error("Catégorie invalide");
        return;
      }

      // Prepare image file if it's a new upload (data URL)
      let imageFile: File | undefined;
      if (postImage.startsWith("data:")) {
        // Convert data URL to File
        const response = await fetch(postImage);
        const blob = await response.blob();
        imageFile = new File([blob], "publication.jpg", { type: "image/jpeg" });
      }

      if (editingPost) {
        // Update existing publication
        const updateData: any = {
          description: postDescription.trim(),
          price: parseFloat(postPrice),
          category: categoryObj.id,
          location: producerPageData.address || "",
        };

        // Only include image if it's a new upload
        if (imageFile) {
          updateData.picture = imageFile;
        }

        const updatedPub = await api.updatePublication(
          parseInt(editingPost.id),
          updateData
        );

        // Update local state
        const updatedPosts = posts.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                postImage: updatedPub.picture_url || p.postImage,
                description: updatedPub.description,
                category: updatedPub.category_name || updatedPub.category.name,
                price: updatedPub.price,
                lastModified: updatedPub.date_posted,
              }
            : p
        );
        setPosts(updatedPosts);
        toast.success("Publication modifiée avec succès");
      } else {
        // Create new publication
        const publicationData = {
          page: producerPageData.id,
          description: postDescription.trim(),
          price: parseFloat(postPrice),
          category: categoryObj.id,
          location: producerPageData.address || "",
          picture: imageFile,
        };

        const newPub = await api.createPublication(publicationData);

        // Add to local state
        const newPost: MyPost = {
          id: newPub.id.toString(),
          postImage: newPub.picture_url || postImage,
          description: newPub.description,
          category: newPub.category_name || newPub.category.name,
          price: newPub.price,
          producerName: userData?.page?.pageName || "",
          producerAvatar: userData?.avatar || "",
          location: newPub.location,
          date: newPub.date_posted,
          lastModified: newPub.date_posted,
          likes: 0,
          comments: 0,
          isLiked: false,
        };

        setPosts([newPost, ...posts]);
        toast.success("Publication créée avec succès");
      }

      setShowPostModal(false);
    } catch (error) {
      console.error("❌ Failed to save publication:", error);
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
            maxWidth: "min(400px, 90vw)",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16,
              color: MAIN_BLUE,
              margin: "0 0 16px 0",
            }}
          >
            {editingPost ? "Modifier la publication" : "Nouvelle publication"}
          </h2>
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
            {categories.map((cat) => (
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
            maxWidth: "min(400px, 90vw)",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16,
              color: MAIN_BLUE,
              margin: "0 0 16px 0",
            }}
          >
            Modifier le nom de la page
          </h2>
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
            maxWidth: "min(400px, 90vw)",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16,
              color: MAIN_BLUE,
              margin: "0 0 16px 0",
            }}
          >
            Modifier l'adresse
          </h2>
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
            maxWidth: "min(400px, 90vw)",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 12,
              color: "#FF4B4B",
              margin: "0 0 12px 0",
            }}
          >
            Supprimer la publication
          </h2>
          <p
            style={{
              marginBottom: 20,
              color: "#666",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action
            est irréversible.
          </p>
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
          height: 350px;
          background: linear-gradient(135deg, #009cb7 0%, #007a8f 100%);
          overflow: hidden;
          border-radius: 0 0 0 0;
          box-shadow: 0 4px 16px rgba(0, 156, 183, 0.15);
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
          bottom: 30px;
          right: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(20, 20, 20, 1);
          border-radius: 50%;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }
        .banner-camera:active {
          transform: scale(0.95);
        }
        .banner-camera img { width: 20px; height: 20px; opacity: 1; }

        /* Profile Info */
        .profile-info {
          position: absolute;
          left: 16px;
          bottom: 30px;
          z-index: 4;
          color: #fff;
          max-width: calc(100% - 80px);
        }
        .profile-name {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .profile-name-text {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          margin-right: 8px;
          line-height: 1.2;
        }
        .edit-btn {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        .edit-btn:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.35);
        }
        .edit-btn img { width: 16px; height: 16px; }
        .profile-location {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
        }
        .profile-location-text {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.95;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          margin-right: 8px;
          display: flex;
          align-items: center;
          line-height: 1.3;
        }
        .profile-location-text img {
          margin-right: 6px;
        }
        .verification-status {
          margin-top: 6px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
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
          padding: 24px 16px 0;
          max-width: 100%;
          margin: 0 auto;
          width: 100%;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0;
        }
        .section-title {
          color: #1a1a1a;
          font-size: 18px;
          font-weight: 700;
        }
        .add-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-height: 48px;
          min-width: 48px;
        }
        .warning-text {
          font-size: 10px;
          color: #FF6B35;
          font-weight: 600;
          text-align: center;
          max-width: 110px;
          line-height: 1.3;
        }
        .publications-add {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #009cb7 0%, #007a8f 100%);
          color: #fff;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 400;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 156, 183, 0.3);
          border: none;
          padding : 0;
        }
        .publications-add.disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.6;
        }
        .publications-add:active:not(.disabled) {
          transform: scale(0.95);
        }

        /* Posts Grid */
        .posts-grid {
          display: grid;
          gap: 16px;
        }
        .post-card-container {
          position: relative;
          animation: fadeIn 0.3s ease-out forwards;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .post-card-container:active {
          transform: scale(0.98);
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
          top: 10px;
          right: 10px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .post-menu-btn {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }
        .post-menu-btn:active {
          transform: scale(0.92);
          background: #fff;
        }

        /* Loading and Empty States */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 16px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #009cb7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 48px 20px;
          background: #fff;
          border-radius: 12px;
          margin-top: 8px;
        }
        .empty-state-icon {
          font-size: 56px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .empty-state-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #333;
        }
        .empty-state-subtitle {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        .modal-form-label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #222;
          font-size: 14px;
        }
        .modal-form-input, .modal-form-select, .modal-form-textarea {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          font-size: 16px;
          color: #222;
          margin-bottom: 16px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .modal-form-input:focus, .modal-form-select:focus, .modal-form-textarea:focus {
          outline: none;
          border-color: #009cb7;
        }
        .modal-form-textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }
        .modal-form-img-preview {
          width: 100%;
          max-width: 100%;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .modal-btn-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
        }
        .modal-btn {
          padding: 16px 24px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          width: 50%;
          transition: all 0.2s;
        }
        .modal-btn:active {
          transform: scale(0.97);
        }
        .modal-btn.save {
          background: #009cb7;
          color: #fff;
        }
        .modal-btn.cancel {
          background: #f5f5f5;
          color: #666;
        }
        .modal-btn.delete {
          background: #FF4B4B;
          color: #fff;
        }
        .modal-buttons {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
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
          <div
            className="banner-container"
            style={{
              background: banner
                ? `url(${normalizeImageUrl(banner)}) center/cover no-repeat`
                : 'linear-gradient(135deg, #00B2D6 0%, #009CB7 100%)'
            }}
            onLoad={() => console.log("🎨 Banner rendered:", { originalBanner: banner, normalizedBanner: normalizeImageUrl(banner) })}
          >
            <div className="banner-overlay" />

            {fetchingPageData && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #e0e0e0",
                    borderTop: "2px solid #00B2D6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span style={{ fontSize: "14px", color: "#666" }}>
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
                  {producerPageData?.name ||
                    userData?.page?.pageName ||
                    userData?.name ||
                    "Ma Page"}
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
                      width: 14,
                      height: 14,
                      opacity: 0.9,
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                  {producerPageData?.address ||
                    userData?.page?.address ||
                    "Aucune adresse"}
                </span>
                <div
                  className="edit-btn"
                  onClick={() => setShowLocationModal(true)}
                >
                  <img src={editIconWhite} alt="edit" />
                </div>
              </div>

              {userData?.userRole === "producteur" && (
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

          {/* Page Validation Warning */}
          {userData?.userRole === "producteur" && producerPageData && !producerPageData.is_validated && (
            <div
              style={{
                backgroundColor: "#FFF3CD",
                border: "1px solid #FFC107",
                borderRadius: 12,
                padding: "16px",
                margin: "16px 16px 0 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#856404",
                }}
              >
                <span>⚠️</span>
                <span>Page en attente de validation</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#856404",
                  lineHeight: 1.5,
                }}
              >
                Les administrateurs d'Autofish vont vérifier que toutes vos informations sont correctes avant que vos publications soient disponibles pour les consommateurs.
              </p>
            </div>
          )}

          {/* Content Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Mes Publications</h2>
              {userData?.userRole === "producteur" && (
                <div className="add-button-container">
                  {!userData?.is_verified && (
                    <div className="warning-text">
                      ⚠️ Compte en attente de vérification
                    </div>
                  )}
                  <button
                    className={`publications-add ${
                      !userData?.is_verified ? "disabled" : ""
                    }`}
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
                  Vous n'avez pas encore publié de contenu.
                  <br />
                  Créez votre première publication pour commencer!
                </div>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-card-container">
                    {!post.willAppearInFeed && (
                      <div
                        style={{
                          backgroundColor: "#FFF3CD",
                          border: "1px solid #FFC107",
                          borderRadius: "8px 8px 0 0",
                          padding: "8px 12px",
                          fontSize: 12,
                          color: "#856404",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>⚠️</span>
                        <span>Page non validée - Publication non visible publiquement</span>
                      </div>
                    )}
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
