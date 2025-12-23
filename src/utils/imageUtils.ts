/**
 * Image utility functions for handling HTTP to HTTPS conversion
 * to bypass mixed content policies while keeping image server on HTTP
 */

/**
 * Converts HTTP image server URLs to use Django HTTPS proxy
 * This allows HTTPS frontend to load images from HTTP image server
 * without triggering mixed content blocking
 */
export const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';

  try {
    // Convert any HTTP URL from the image server to HTTPS proxy
    // Handle multiple formats that might come from the backend
    if (url.includes('31.97.178.131') && url.includes('/images/')) {
      // Extract just the path after /images/
      const match = url.match(/\/images\/(.+)$/);
      if (match) {
        const imagePath = match[1];
        const proxyUrl = `https://api.autofish.store/api/image-proxy/${imagePath}`;
        if (import.meta.env.DEV) {
          console.log('[ImageUtils] Converting URL:', url, '→', proxyUrl);
        }
        return proxyUrl;
      }
    }

    // If already HTTPS or not from our image server, return as-is
    return url;
  } catch (error) {
    console.warn('Error normalizing image URL:', error);
    return url;
  }
};

/**
 * Hook for getting normalized image URLs
 */
export const useNormalizedImageUrl = (url?: string): string => {
  return normalizeImageUrl(url);
};