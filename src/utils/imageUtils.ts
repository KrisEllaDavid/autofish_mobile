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
    // Convert direct image server URLs to use Django proxy
    if (url.startsWith('http://31.97.178.131:3001/images/')) {
      // Extract the path part (category/filename) - with port
      const imagePath = url.replace('http://31.97.178.131:3001/images/', '');
      // Use Django HTTPS image proxy (avoiding nginx /media/ conflicts)
      return `https://api.autofish.store/api/image-proxy/${imagePath}`;
    } else if (url.startsWith('http://31.97.178.131/images/')) {
      // Extract the path part (category/filename) - without port
      const imagePath = url.replace('http://31.97.178.131/images/', '');
      // Use Django HTTPS image proxy (avoiding nginx /media/ conflicts)
      return `https://api.autofish.store/api/image-proxy/${imagePath}`;
    }

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