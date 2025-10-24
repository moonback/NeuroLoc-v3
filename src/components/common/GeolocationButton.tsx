import { useState, useEffect } from 'react';
import { Button } from './Button';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './Card';
import toast from 'react-hot-toast';

interface GeolocationButtonProps {
  onLocationFound: (address: string, city: string, postalCode: string, country: string, lat: number, lng: number) => void;
  disabled?: boolean;
  className?: string;
}

export const GeolocationButton = ({
  onLocationFound,
  disabled = false,
  className = ''
}: GeolocationButtonProps) => {
  const { getCurrentLocation, loading, error, location, address } = useGeolocation();
  const [isLocating, setIsLocating] = useState(false);

  // Effet pour détecter quand la géolocalisation est terminée
  useEffect(() => {
    if (location && address && isLocating) {
      onLocationFound(
        address.address,
        address.city,
        address.postal_code,
        address.country,
        location.latitude,
        location.longitude
      );
      toast.success('Position détectée avec succès');
      setIsLocating(false);
    }
  }, [location, address, isLocating, onLocationFound]);

  const handleGetLocation = async () => {
    try {
      setIsLocating(true);
      await getCurrentLocation();
    } catch (err) {
      console.error('Geolocation error:', err);
      toast.error('Impossible de détecter votre position');
      setIsLocating(false);
    }
  };

  const getButtonIcon = () => {
    if (loading || isLocating) {
      return <Navigation className="h-4 w-4 animate-spin" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (loading || isLocating) {
      return 'Détection...';
    }
    if (error) {
      return 'Erreur';
    }
    return 'Détecter ma position';
  };

  const getButtonVariant = () => {
    if (error) {
      return 'danger' as const;
    }
    return 'secondary' as const;
  };

  return (
    <Button
      onClick={handleGetLocation}
      disabled={disabled || loading || isLocating}
      variant={getButtonVariant()}
      size="sm"
      className={`flex items-center space-x-2 ${className}`}
    >
      {getButtonIcon()}
      <span>{getButtonText()}</span>
    </Button>
  );
};

interface LocationDisplayProps {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export const LocationDisplay = ({
  address,
  city,
  postalCode,
  country,
  latitude,
  longitude,
  className = ''
}: LocationDisplayProps) => {
  const formatAddress = () => {
    const parts = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (postalCode) parts.push(postalCode);
    if (country) parts.push(country);
    
    return parts.join(', ');
  };

  const formatCoordinates = () => {
    if (latitude && longitude) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    return null;
  };

  if (!address && !city && !latitude && !longitude) {
    return null;
  }

  return (
    <Card className={`bg-neutral-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">
              Localisation détectée
            </h4>
            
            {formatAddress() && (
              <p className="text-sm text-neutral-700 mb-1">
                <span className="font-medium">Adresse :</span> {formatAddress()}
              </p>
            )}
            
            {formatCoordinates() && (
              <p className="text-xs text-neutral-500">
                <span className="font-medium">Coordonnées :</span> {formatCoordinates()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
