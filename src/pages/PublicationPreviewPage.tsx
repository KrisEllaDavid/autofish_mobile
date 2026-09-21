import React, { useEffect, useState } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import CommentsBottomSheet from "../components/CommentsBottomSheet";
import { useAuth } from "../context/AuthContext";
import { useApiWithLoading } from "../services/apiWithLoading";
import { Publication } from "../services/api";
import { normalizeImageUrl } from "../utils/imageUtils";
import { toast } from "react-toastify";
import { Avatar, Button, Chip, EmptyState, Skeleton } from "../components/ui";
import { formatPrice } from "../utils/formatPrice";
import "./PublicationPreviewPage.css";

const locationIcon = "/icons/Location.svg";
const heartIcon = "/icons/dark_heart_outline_like.svg";
const heartFilledIcon = "/icons/red_heart_like.svg";
const commentIcon = "/icons/messages-bottom-nav.svg";

type NavTab = "home" | "messages" | "producers" | "profile" | "favorites";

interface PublicationPreviewPageProps {
  publicationId: number;
  onBack: () => void;
  onNotificationClick?: () => void;
  onMyPageClick?: () => void;
  onTabChange: (tab: NavTab) => void;
  activeTab?: string;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const BackIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

const MessageIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.4 9.4 0 0 1-2.8-.4L4 21l1.4-3.9A8.2 8.2 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const PublicationPreviewPage: React.FC<PublicationPreviewPageProps> = ({
  publicationId,
  onBack,
  onNotificationClick,
  onMyPageClick,
  onTabChange,
  activeTab,
  userAvatar,
  userName,
  userEmail,
  userRole,
}) => {
  const { userData } = useAuth();
  const api = useApiWithLoading();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    fetchPublication();
  }, [publicationId]);

  const fetchPublication = async () => {
    setIsLoading(true);
    try {
      setPublication(await api.getPublicationById(publicationId));
    } catch {
      toast.error("Cette publication n'a pas pu être chargée.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!api.isAuthenticated()) {
      toast.info("Connectez-vous pour aimer une publication.");
      return;
    }
    if (!publication) return;

    const wasLiked = publication.is_liked;
    const previousCount = publication.likes_count || 0;

    setPublication({
      ...publication,
      is_liked: !wasLiked,
      likes_count: wasLiked ? previousCount - 1 : previousCount + 1,
    });

    try {
      await api.likePublication(publication.id);
    } catch {
      toast.error("Le like n'a pas pu être enregistré.");
      setPublication({
        ...publication,
        is_liked: wasLiked,
        likes_count: previousCount,
      });
    }
  };

  const handleWhatsAppContact = () => {
    if (!publication?.producer_phone) {
      toast.error("Ce producteur n'a pas renseigné de numéro.");
      return;
    }

    const cleanPhone = publication.producer_phone.replace(/[\s-()]/g, "");
    const message = publication.title
      ? `Bonjour, je suis intéressé par "${publication.title}" sur AutoFish`
      : "Bonjour, je suis intéressé par votre publication sur AutoFish";

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleChatContact = async () => {
    if (!api.isAuthenticated()) {
      toast.info("Connectez-vous pour envoyer un message.");
      return;
    }

    if (publication && userData && publication.producer === userData.id) {
      toast.info("Cette publication est la vôtre.");
      return;
    }

    try {
      const chat = await api.createChat(publicationId);
      onTabChange("messages");
      sessionStorage.setItem("selectedChatId", chat.id.toString());
    } catch (error: any) {
      // The backend answers an existing conversation with its id.
      if (error?.response?.data?.chat_id) {
        onTabChange("messages");
        sessionStorage.setItem(
          "selectedChatId",
          error.response.data.chat_id.toString()
        );
      } else {
        toast.error("La conversation n'a pas pu être ouverte.");
      }
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const header = (
    <TopNavBar
      title="Publication"
      userAvatar={userAvatar || userData?.avatar}
      userName={userName || userData?.name}
      userEmail={userEmail || userData?.email}
      userRole={userRole || userData?.userRole}
      onNotificationClick={onNotificationClick}
      onMyPageClick={onMyPageClick}
      activeTab={activeTab}
    />
  );

  if (isLoading) {
    return (
      <div className="pub-page">
        {header}
        <div className="pub-scroll">
          <article className="pub-article" aria-busy="true">
            <Skeleton height={280} radius="0" />
            <div className="pub-body">
              <Skeleton width="80%" height={24} />
              <Skeleton
                width="45%"
                height={28}
                style={{ marginTop: "var(--space-6)" }}
              />
              <Skeleton
                height={72}
                radius="var(--radius-md)"
                style={{ marginTop: "var(--space-7)" }}
              />
              <Skeleton
                height={120}
                radius="var(--radius-md)"
                style={{ marginTop: "var(--space-8)" }}
              />
            </div>
          </article>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="pub-page">
        {header}
        <div className="pub-scroll">
          <div className="pub-state">
            <EmptyState
              icon={<img src="/icons/autofish_blue_logo.svg" alt="" />}
              title="Publication introuvable"
              description="Elle a peut-être été retirée par son producteur."
              actionLabel="Retour au fil"
              onAction={onBack}
            />
          </div>
        </div>
      </div>
    );
  }

  const image = publication.picture_url || publication.picture;
  const producerName =
    publication.producer_name || publication.page_name || "Producteur";
  const hasWhatsApp = Boolean(publication.producer_phone);

  return (
    <div className="pub-page">
      {header}

      <div className="pub-scroll">
        <article className="pub-article">
          {image && (
            <div className="pub-media">
              <img
                src={normalizeImageUrl(image)}
                alt={publication.title}
                decoding="async"
              />

              <button
                type="button"
                className="pub-back"
                onClick={onBack}
                aria-label="Retour"
              >
                <BackIcon />
              </button>

              {publication.category_name && (
                <Chip as="span" tone="onimage" className="pub-category">
                  {publication.category_name}
                </Chip>
              )}
            </div>
          )}

          <div className="pub-body">
            <h1 className="pub-title">{publication.title}</h1>

            <p className="pub-price">
              {formatPrice(publication.price)}
              <small>FCFA</small>
            </p>

            <div className="pub-producer">
              <Avatar
                src={publication.producer_picture}
                name={producerName}
                alt=""
              />
              <div className="pub-producer__body">
                <p className="pub-producer__name">{producerName}</p>
                <p className="pub-producer__date">
                  Publié le {formatDate(publication.date_posted)}
                </p>
              </div>
            </div>

            {/* Contact first: it is what the page is for. */}
            <div
              className={`pub-actions${hasWhatsApp ? "" : " pub-actions--single"}`}
            >
              <Button
                size="lg"
                onClick={handleChatContact}
                iconStart={<MessageIcon />}
              >
                Message
              </Button>

              {hasWhatsApp && (
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleWhatsAppContact}
                  iconStart={<WhatsAppIcon />}
                >
                  WhatsApp
                </Button>
              )}
            </div>

            <div className="pub-reactions">
              <button
                type="button"
                onClick={handleLike}
                aria-pressed={Boolean(publication.is_liked)}
                className={`pub-reaction${
                  publication.is_liked ? " pub-reaction--liked" : ""
                }`}
              >
                <img
                  src={publication.is_liked ? heartFilledIcon : heartIcon}
                  alt=""
                  aria-hidden="true"
                />
                {publication.likes_count || publication.likes || 0}
                <span className="visually-hidden">
                  {publication.is_liked ? "Retirer le like" : "Aimer"}
                </span>
              </button>

              <button
                type="button"
                className="pub-reaction"
                onClick={() => setIsCommentsOpen(true)}
              >
                <img src={commentIcon} alt="" aria-hidden="true" />
                {publication.comments_count || 0}
                <span className="visually-hidden">Commentaires</span>
              </button>
            </div>

            <section className="pub-section">
              <h2 className="pub-section__title">Description</h2>
              <p className="pub-description">{publication.description}</p>
            </section>

            <dl className="pub-facts">
              <div className="pub-fact">
                <dt className="pub-fact__label">Localisation</dt>
                <dd className="pub-fact__value">
                  <img src={locationIcon} alt="" aria-hidden="true" />
                  {publication.location}
                </dd>
              </div>

              {publication.category_name && (
                <div className="pub-fact">
                  <dt className="pub-fact__label">Catégorie</dt>
                  <dd className="pub-fact__value">
                    {publication.category_name}
                  </dd>
                </div>
              )}

              <div className="pub-fact">
                <dt className="pub-fact__label">Publié le</dt>
                <dd className="pub-fact__value">
                  {formatDate(publication.date_posted)}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </div>

      <BottomNavBar
        activeTab={(activeTab as NavTab) || "home"}
        onTabChange={onTabChange}
      />

      <CommentsBottomSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        publicationId={publication.id}
        publicationTitle={publication.title}
      />
    </div>
  );
};

export default PublicationPreviewPage;
