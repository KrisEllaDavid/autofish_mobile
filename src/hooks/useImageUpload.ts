// Custom hook for handling image uploads with the AutoFish Image Server
import { useState } from 'react';
import { imageService, ImageCategory, ImageUploadResponse } from '../services/imageService';
import { toast } from 'react-toastify';

interface UseImageUploadResult {
  uploading: boolean;
  uploadImage: (file: File, category: ImageCategory) => Promise<string | null>;
  uploadError: string | null;
  uploadProgress: number;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File, category: ImageCategory): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Validate file before upload
      const validation = imageService.validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file');
        toast.error(validation.error);
        return null;
      }

      // Simulate progress for better UX
      setUploadProgress(25);

      // Check if image server is healthy
      const isHealthy = await imageService.healthCheck();
      if (!isHealthy) {
        throw new Error('Image server is not available');
      }

      setUploadProgress(50);

      // Upload the image
      const result: ImageUploadResponse = await imageService.uploadImage(file, category);
      
      setUploadProgress(100);

      if (import.meta.env.DEV) {
        console.log('✅ Image uploaded successfully:', result);
      }

      toast.success('Image téléchargée avec succès!');
      return result.url;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
      toast.error(`Erreur de téléchargement: ${errorMessage}`);
      
      if (import.meta.env.DEV) {
        console.error('❌ Image upload failed:', error);
      }
      
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploading,
    uploadImage,
    uploadError,
    uploadProgress,
  };
};

// Specific hooks for different image types
export const useProfilePictureUpload = () => {
  const { uploading, uploadImage, uploadError, uploadProgress } = useImageUpload();
  
  const uploadProfilePicture = async (file: File) => {
    return uploadImage(file, 'profiles');
  };

  return {
    uploading,
    uploadProfilePicture,
    uploadError,
    uploadProgress,
  };
};

export const useProductImageUpload = () => {
  const { uploading, uploadImage, uploadError, uploadProgress } = useImageUpload();
  
  const uploadProductImage = async (file: File) => {
    return uploadImage(file, 'publications');
  };

  return {
    uploading,
    uploadProductImage,
    uploadError,
    uploadProgress,
  };
};

export const useProducerLogoUpload = () => {
  const { uploading, uploadImage, uploadError, uploadProgress } = useImageUpload();
  
  const uploadProducerLogo = async (file: File) => {
    return uploadImage(file, 'logos');
  };

  return {
    uploading,
    uploadProducerLogo,
    uploadError,
    uploadProgress,
  };
};


