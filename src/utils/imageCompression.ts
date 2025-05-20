import { toast } from 'react-toastify';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: string;
}

/**
 * Compresses an image file using the browser's built-in compression capabilities
 * @param file The image file to compress
 * @param options Compression options
 * @returns Promise<File> The compressed image file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    type = file.type,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast.error('Une erreur est survenue lors du traitement de l\'image');
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              toast.error('Une erreur est survenue lors de la compression de l\'image');
              reject(new Error('Could not compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: type,
              lastModified: Date.now(),
            });
            
            // Calculate compression ratio
            //const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
            toast.success(`image importée avec succès)`);
            
            resolve(compressedFile);
          },
          type,
          quality
        );
      };
      img.onerror = () => {
        toast.error('Impossible de charger l\'image');
        reject(new Error('Could not load image'));
      };
    };
    reader.onerror = () => {
      toast.error('Impossible de lire le fichier');
      reject(new Error('Could not read file'));
    };
  });
};

/**
 * Validates if a file is an image and checks its size
 * @param file The file to validate
 * @param maxSizeInMB Maximum allowed size in MB
 * @returns boolean Whether the file is valid
 */
export const validateImage = (file: File, maxSizeInMB: number = 10): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    toast.error('Format de fichier invalide. Veuillez télécharger une image JPEG, PNG ou WebP.');
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  if (file.size > maxSizeInBytes) {
    toast.error(`La taille du fichier doit être inférieure à ${maxSizeInMB}MB`);
    throw new Error(`File size must be less than ${maxSizeInMB}MB`);
  }

  return true;
}; 