import { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { objectImagesService } from '../../services/objectImages.service';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({
  onImagesUploaded,
  existingImages = [],
  maxImages = 10,
  disabled = false,
  className = ''
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalImages = existingImages.length + fileArray.length;

    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    // Validation des fichiers
    const validation = objectImagesService.validateImages(fileArray);
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsUploading(true);

    try {
      // Générer un ID temporaire pour l'objet (sera remplacé par l'ID réel lors de la sauvegarde)
      const tempObjectId = `temp-${Date.now()}`;
      const urls = await objectImagesService.uploadMultipleImages(tempObjectId, fileArray);
      
      onImagesUploaded([...existingImages, ...urls]);
      toast.success(`${fileArray.length} image(s) téléchargée(s) avec succès`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erreur lors du téléchargement des images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeImage = async (index: number) => {
    const imageToRemove = existingImages[index];
    
    try {
      await objectImagesService.deleteObjectImage(imageToRemove);
      const newImages = existingImages.filter((_, i) => i !== index);
      onImagesUploaded(newImages);
      toast.success('Image supprimée');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <Camera className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Téléchargement en cours...' : 'Glissez vos images ici'}
            </p>
            <p className="text-sm text-gray-500">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p>Formats acceptés: JPEG, PNG, WebP, GIF</p>
            <p>Taille maximale: 10MB par image</p>
            <p>Maximum: {maxImages} images</p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Téléchargement...</span>
            </div>
          </div>
        )}
      </div>

      {/* Images existantes */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Images ({existingImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                {!disabled && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton d'upload alternatif */}
      {existingImages.length < maxImages && !disabled && (
        <Button
          onClick={openFileDialog}
          variant="secondary"
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Téléchargement...' : 'Ajouter des images'}
        </Button>
      )}
    </div>
  );
};
