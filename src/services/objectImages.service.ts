import { supabase } from './supabase';

export const objectImagesService = {
  // Upload une image pour un objet
  async uploadObjectImage(objectId: string, file: File): Promise<string> {
    // Validation du fichier
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Vérifier la taille du fichier (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux. Taille maximale: 10MB');
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Types acceptés: JPEG, PNG, WebP, GIF');
    }

    // Générer un nom de fichier sécurisé
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${objectId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    try {
      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from('objects')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erreur lors du téléchargement: ${uploadError.message}`);
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('objects')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Impossible de générer l\'URL publique');
      }

      return publicUrl;
    } catch (error) {
      console.error('Object image upload error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur inconnue lors du téléchargement de l\'image');
    }
  },

  // Upload plusieurs images pour un objet
  async uploadMultipleImages(objectId: string, files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('Aucun fichier fourni');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images par objet');
    }

    const uploadPromises = files.map(file => 
      this.uploadObjectImage(objectId, file)
    );

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Multiple images upload error:', error);
      throw error;
    }
  },

  // Supprimer une image d'objet
  async deleteObjectImage(imageUrl: string): Promise<void> {
    try {
      // Extraire le chemin du fichier de l'URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      
      if (!filePath) {
        throw new Error('URL d\'image invalide');
      }

      const { error } = await supabase.storage
        .from('objects')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }
    } catch (error) {
      console.error('Object image delete error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur inconnue lors de la suppression de l\'image');
    }
  },

  // Supprimer plusieurs images d'objet
  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const deletePromises = imageUrls.map(url => 
      this.deleteObjectImage(url)
    );

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Multiple images delete error:', error);
      throw error;
    }
  },

  // Extraire le chemin du fichier à partir de l'URL
  extractFilePathFromUrl(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      
      // Chercher l'index de 'objects' dans le chemin
      const objectsIndex = pathParts.findIndex(part => part === 'objects');
      
      if (objectsIndex === -1 || objectsIndex + 1 >= pathParts.length) {
        return null;
      }

      // Reconstruire le chemin à partir de 'images/'
      const filePath = pathParts.slice(objectsIndex + 1).join('/');
      return filePath;
    } catch (error) {
      console.error('Error extracting file path:', error);
      return null;
    }
  },

  // Valider les images avant upload
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!files || files.length === 0) {
      errors.push('Aucun fichier sélectionné');
      return { valid: false, errors };
    }

    if (files.length > 10) {
      errors.push('Maximum 10 images par objet');
    }

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`Image ${index + 1}: Taille trop importante (max 10MB)`);
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`Image ${index + 1}: Type non supporté (JPEG, PNG, WebP, GIF uniquement)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Obtenir l'URL publique d'une image
  getPublicUrl(filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from('objects')
      .getPublicUrl(filePath);
    
    return publicUrl;
  },

  // Lister les images d'un objet
  async listObjectImages(objectId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from('objects')
        .list(`images/${objectId}`, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('List images error:', error);
        throw new Error(`Erreur lors de la récupération des images: ${error.message}`);
      }

      return data.map(file => this.getPublicUrl(`images/${objectId}/${file.name}`));
    } catch (error) {
      console.error('List object images error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur inconnue lors de la récupération des images');
    }
  }
};
