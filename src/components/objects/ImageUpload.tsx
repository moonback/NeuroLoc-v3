import { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Loader } from '../common/Loader';
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
    <div className={`space-y-6 ${className}`}>
      {/* Zone de drop */}
      <Card className={`transition-all duration-200 ${
        dragActive ? 'border-brand-500 bg-brand-50' : 'border-neutral-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-400'}`}>
        <CardContent 
          className="p-8 text-center"
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

          <div className="space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto">
              <Camera className="h-8 w-8 text-neutral-400" />
            </div>
            <div>
              <p className="text-heading text-lg font-semibold">
                {isUploading ? 'Téléchargement en cours...' : 'Glissez vos images ici'}
              </p>
              <p className="text-body text-sm mt-1">
                ou cliquez pour sélectionner des fichiers
              </p>
            </div>
            <div className="text-xs text-neutral-500 space-y-1">
              <p>Formats acceptés: JPEG, PNG, WebP, GIF</p>
              <p>Taille maximale: 10MB par image</p>
              <p>Maximum: {maxImages} images</p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
              <Card className="p-4">
                <CardContent className="flex items-center gap-3">
                  <Loader size="md" />
                  <span className="text-sm text-neutral-600">Téléchargement...</span>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images existantes */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-700">
            Images ({existingImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  {!disabled && (
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </CardContent>
              </Card>
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
          leftIcon={<Upload className="h-4 w-4" />}
        >
          {isUploading ? 'Téléchargement...' : 'Ajouter des images'}
        </Button>
      )}
    </div>
  );
};
