import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import { compressImage, validateImage } from "../utils/imageCompression";
import { useAuth } from "../context/AuthContext";
import "./MyPage.css";
import { normalizeImageUrl } from "../utils/imageUtils";
import Modal from "../components/Modal";
import PostCard from "../components/PostCard";
import { Post } from "../mock/posts";
import { toast } from "react-toastify";
import { useApiWithLoading } from "../services/apiWithLoading";
import { ProducerPage } from "../services/api";
import { Banner } from "../components/ui";
import "react-toastify/dist/ReactToastify.css";

// Extended Post interface for MyPage with additional properties
interface MyPost extends Post {
  lastModified?: string;
  isLiked?: boolean;
  pageIsValidated?: boolean;
  willAppearInFeed?: boolean;
}

// Constants

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
        <div>
          <h2 className="modal-title-accent">
            {editingPost ? "Modifier la publication" : "Nouvelle publication"}
          </h2>
          <div className="modal-form-label">Image</div>
          {postImage && (
            <div className="modal-preview">
              <img
                src={normalizeImageUrl(postImage)}
                alt="Aperçu de la publication"
                className="modal-form-img-preview"
              />
              {editingPost && (
                <p className="modal-note">
                  Choisissez une nouvelle image pour remplacer celle-ci.
                </p>
              )}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePostImageChange}
            className="modal-form-file"
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
        <div>
          <h2 className="modal-title-accent">
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
        <div>
          <h2 className="modal-title-accent">
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
        <div>
          <h2 className="modal-title-accent">Supprimer la publication ?</h2>
          <p className="modal-note">
            Cette publication et ses commentaires seront définitivement
            effacés. Cette action est irréversible.
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
            style={
              banner
                ? { backgroundImage: `url(${normalizeImageUrl(banner)})` }
                : undefined
            }
          >
            <div className="banner-overlay" />

            {fetchingPageData && (
              <div className="banner-loading">
                <span className="af-spinner" aria-hidden="true" />
                Chargement des informations…
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
                    alt=""
                    aria-hidden="true"
                    className="profile-location-pin"
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
                      Compte vérifié
                    </span>
                  ) : (
                    <span className="status-badge status-pending">
                      En attente de vérification
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {userData?.userRole === "producteur" &&
            producerPageData &&
            !producerPageData.is_validated && (
              <div className="my-page-notice">
                <Banner tone="warning" title="Page en attente de validation">
                  Nos équipes vérifient vos informations. Vos publications
                  deviendront visibles par les clients dès la validation.
                </Banner>
              </div>
            )}

          {/* Content Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Mes Publications</h2>
              {userData?.userRole === "producteur" && (
                <div className="add-button-container">
                  {!userData?.is_verified && (
                    <span className="warning-text">
                      Compte en attente de vérification
                    </span>
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
                <div className="empty-state-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--brand-700)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 4.8h9l5 5v9.4a.8.8 0 0 1-.8.8H5a.8.8 0 0 1-.8-.8V5.6A.8.8 0 0 1 5 4.8z" />
                    <path d="M13.6 4.9v5h5M8.4 13.4h7.2M8.4 16.6h4.6" />
                  </svg>
                </div>
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
                      <p className="post-card-flag">
                        Page non validée — cette publication reste privée.
                      </p>
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
                          className="post-menu-btn__icon"
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
                          className="post-menu-btn__icon"
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
