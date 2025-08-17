// AutoFish Image Service
// Handles image uploads, retrieval, and management with the dedicated image server

const IMAGE_SERVER_URL = 'http://31.97.178.131:3001';
const isDev = import.meta.env.DEV;
const isMobile = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';

// Use proxy for web development, direct URL for mobile and production
const getImageServerBaseUrl = () => {
  return (isDev && !isMobile) ? '/image-server' : IMAGE_SERVER_URL;
};

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  filename: string;
  category: string;
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  timestamp: string;
}

export interface ImageUploadError {
  error: string;
  details?: string;
}

export type ImageCategory = 'profiles' | 'banners' | 'publications' | 'products' | 'ids' | 'logos';

class ImageService {
  private baseURL: string;

  constructor() {
    this.baseURL = getImageServerBaseUrl();
  }

  /**
   * Upload an image to the image server
   */
  async uploadImage(file: File, category: ImageCategory): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseURL}/upload/${category}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ImageUploadError = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result: ImageUploadResponse = await response.json();
      
      if (import.meta.env.DEV) {
        console.log('✅ Image uploaded successfully:', result);
      }
      
      return result;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Image upload failed:', error);
      }
      throw error;
    }
  }

  /**
   * Get image URL for serving
   */
  getImageUrl(category: ImageCategory, filename: string): string {
    return `${this.baseURL}/images/${category}/${filename}`;
  }

  /**
   * Delete an image from the server
   */
  async deleteImage(category: ImageCategory, filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/images/${category}/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Image deletion failed:', error);
      }
      throw error;
    }
  }

  /**
   * Check if image server is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // For development, try to bypass SSL issues
      const response = await fetch(`${this.baseURL}/health`, {
        // Note: fetch doesn't support verify: false like requests
        // We'll handle SSL errors gracefully
      });
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Image server health check failed:', error);
        // If it's an SSL error, log it specifically
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('⚠️  SSL certificate issue detected. This is normal for self-signed certificates.');
        }
      }
      return false;
    }
  }

  /**
   * Get server information
   */
  async getServerInfo() {
    try {
      const response = await fetch(`${this.baseURL}/info`);
      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Failed to get server info:', error);
      }
      throw error;
    }
  }

  /**
   * List images in a category (for debugging)
   */
  async listImages(category: ImageCategory) {
    try {
      const response = await fetch(`${this.baseURL}/list/${category}`);
      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Failed to list images:', error);
      }
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou TIFF.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Fichier trop volumineux. Taille maximale: 10MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Create a fallback image URL for broken images
   */
  getFallbackImageUrl(category: ImageCategory): string {
    const fallbacks = {
      profiles: '/icons/account_icon.svg',
      banners: '/icons/autofish_blue_logo.svg',
      publications: '/icons/autofish_blue_logo.svg',
      products: '/icons/autofish_blue_logo.svg',
      ids: '/icons/account_icon.svg',
      logos: '/icons/autofish_blue_logo.svg'
    };
    
    return fallbacks[category] || '/icons/autofish_blue_logo.svg';
  }
}

// Export singleton instance
export const imageService = new ImageService();

// Export utility functions
export const uploadProfilePicture = (file: File) => imageService.uploadImage(file, 'profiles');
export const uploadProductImage = (file: File) => imageService.uploadImage(file, 'publications');
export const uploadProducerLogo = (file: File) => imageService.uploadImage(file, 'logos');
export const uploadProducerBanner = (file: File) => imageService.uploadImage(file, 'banners');
export const uploadIdCard = (file: File) => imageService.uploadImage(file, 'ids');
