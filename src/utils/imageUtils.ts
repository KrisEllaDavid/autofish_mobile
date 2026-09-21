/**
 * Image URL normalisation.
 *
 * The API hands back image URLs pointing at plain-HTTP image servers by IP
 * (currently 169.58.128.180:3001; older records still reference the retired
 * 31.97.178.131:3001). Neither can be loaded directly from an HTTPS page:
 * http:// is blocked as mixed content, and https:// fails the TLS handshake
 * because those hosts serve no certificate.
 *
 * Every one of them is reachable through the API's own HTTPS image proxy, so
 * this matches on the /images/<path> shape rather than on a hostname — a new
 * image host appearing in API responses keeps working without a code change.
 */

const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || "https://api.autofish.online";

const IMAGE_PROXY = `${API_ORIGIN}/api/image-proxy`;

export const normalizeImageUrl = (url?: string): string => {
  if (!url) return "";

  try {
    // Already proxied, or a local/bundled asset — leave it alone.
    if (url.startsWith(IMAGE_PROXY) || url.startsWith("/") || url.startsWith("data:")) {
      return url;
    }

    // Anything served from an image server, whichever host it names.
    const match = url.match(/\/images\/(.+)$/);
    if (match) {
      return `${IMAGE_PROXY}/${match[1]}`;
    }

    return url;
  } catch {
    return url;
  }
};

/** Hook-shaped wrapper kept for existing call sites. */
export const useNormalizedImageUrl = (url?: string): string =>
  normalizeImageUrl(url);
