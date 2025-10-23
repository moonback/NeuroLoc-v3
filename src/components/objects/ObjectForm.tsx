import { useState, FormEvent, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CreateObjectInput, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { AddressAutocomplete } from '../common/AddressAutocomplete';
import { GeolocationButton, LocationDisplay } from '../common/GeolocationButton';
import { ProfileLocationInfo } from '../common/ProfileLocationInfo';
import { ImageUpload } from './ImageUpload';
import { geolocationService } from '../../services/geolocation.service';
import { MapPin, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES: Category[] = [
  'Bricolage',
  'Jardinage',
  'Sport',
  'Électronique',
  'Véhicules',
  'Maison',
  'Événements',
  'Autre'
];

interface ObjectFormProps {
  initialData?: Partial<CreateObjectInput>;
  onSubmit: (data: CreateObjectInput) => Promise<void>;
  submitLabel?: string;
}

export const ObjectForm = ({ initialData, onSubmit, submitLabel = 'Publier' }: ObjectFormProps) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<CreateObjectInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Autre',
    price_per_day: initialData?.price_per_day || 0,
    location: initialData?.location || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    images: initialData?.images || []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialiser avec l'adresse du profil utilisateur
  useEffect(() => {
    if (profile && !initialData?.location) {
      const userAddress = [
        profile.address,
        profile.city,
        profile.postal_code,
        profile.country
      ].filter(Boolean).join(', ');

      if (userAddress) {
        setFormData(prev => ({
          ...prev,
          location: userAddress,
          latitude: profile.latitude || undefined,
          longitude: profile.longitude || undefined
        }));
      }
    }
  }, [profile, initialData]);

  const handleAddressSelect = async (address: string, formattedAddress: string) => {
    try {
      setIsGeocoding(true);
      const geocodeResult = await geolocationService.geocodeAddress(formattedAddress);
      
      setFormData(prev => ({
        ...prev,
        location: geocodeResult.formatted_address,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude
      }));
      
      toast.success('Adresse géocodée avec succès');
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Erreur lors du géocodage de l\'adresse');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationDetected = (address: string, city: string, postalCode: string, country: string, lat: number, lng: number) => {
    const fullAddress = [address, city, postalCode, country].filter(Boolean).join(', ');
    setFormData(prev => ({
      ...prev,
      location: fullAddress,
      latitude: lat,
      longitude: lng
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.price_per_day <= 0) {
      newErrors.price_per_day = 'Le prix doit être supérieur à 0';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Titre de l'objet"
        type="text"
        placeholder="Ex: Perceuse sans fil Bosch"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={5}
          placeholder="Décrivez votre objet en détail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Prix par jour (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="25.00"
        value={formData.price_per_day}
        onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
        error={errors.price_per_day}
        required
      />

      {/* Section Images */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <Camera className="h-5 w-5 mr-2" />
          Images de l'objet
        </h3>
        
        <ImageUpload
          onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
          existingImages={formData.images || []}
          maxImages={10}
          disabled={isLoading}
        />
        
        <p className="mt-2 text-xs text-gray-500">
          Ajoutez jusqu'à 10 images pour mieux présenter votre objet. La première image sera utilisée comme image principale.
        </p>
      </div>

      {/* Section Localisation */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Localisation de l'objet
          </h3>
          <GeolocationButton
            onLocationFound={handleLocationDetected}
            disabled={isLoading || isGeocoding}
          />
        </div>

        {/* Information sur l'adresse du profil */}
        <ProfileLocationInfo 
          profileAddress={profile ? [profile.address, profile.city, profile.postal_code, profile.country].filter(Boolean).join(', ') : undefined}
          className="mb-4"
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse de récupération *
            </label>
            <AddressAutocomplete
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              onSelect={handleAddressSelect}
              placeholder="Où peut-on récupérer cet objet ?"
              disabled={isLoading || isGeocoding}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Par défaut, l'adresse de votre profil est utilisée. Vous pouvez la modifier si nécessaire.
            </p>
          </div>

          {/* Affichage des coordonnées */}
          {formData.latitude && formData.longitude && (
            <LocationDisplay
              address={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
            />
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading || isGeocoding}>
        {submitLabel}
      </Button>
    </form>
  );
};
