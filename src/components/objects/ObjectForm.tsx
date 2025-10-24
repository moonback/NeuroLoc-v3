import { useState, FormEvent, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader } from '../common/Card';
import { CreateObjectInput, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { AddressAutocomplete } from '../common/AddressAutocomplete';
import { GeolocationButton, LocationDisplay } from '../common/GeolocationButton';
import { ProfileLocationInfo } from '../common/ProfileLocationInfo';
import { ImageUpload } from './ImageUpload';
import { geolocationService } from '../../services/geolocation.service';
import { MapPin, Camera, Package, Euro } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-brand-600" />
            </div>
            <h3 className="text-heading text-lg font-semibold">Informations de base</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              className={`input resize-none ${errors.description ? 'border-accent-500 focus:ring-accent-500' : ''}`}
              rows={5}
              placeholder="Décrivez votre objet en détail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {errors.description && (
              <p className="mt-2 text-sm text-accent-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Catégorie
            </label>
            <select
              className="input"
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
            leftIcon={Euro}
            required
          />
        </CardContent>
      </Card>

      {/* Section Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <Camera className="h-4 w-4 text-brand-600" />
            </div>
            <h3 className="text-heading text-lg font-semibold">Images de l'objet</h3>
          </div>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
            existingImages={formData.images || []}
            maxImages={10}
            disabled={isLoading}
          />
          <p className="mt-3 text-sm text-neutral-500">
            Ajoutez jusqu'à 10 images pour mieux présenter votre objet. La première image sera utilisée comme image principale.
          </p>
        </CardContent>
      </Card>

      {/* Section Localisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-brand-600" />
              </div>
              <h3 className="text-heading text-lg font-semibold">Localisation de l'objet</h3>
            </div>
            <GeolocationButton
              onLocationFound={handleLocationDetected}
              disabled={isLoading || isGeocoding}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Information sur l'adresse du profil */}
          <ProfileLocationInfo 
            profileAddress={profile ? [profile.address, profile.city, profile.postal_code, profile.country].filter(Boolean).join(', ') : undefined}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
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
              <p className="mt-2 text-sm text-accent-600">{errors.location}</p>
            )}
            <p className="mt-2 text-sm text-neutral-500">
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
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Button type="submit" className="w-full" isLoading={isLoading || isGeocoding}>
          {submitLabel}
        </Button>
      </form>
    </div>
  );
};
