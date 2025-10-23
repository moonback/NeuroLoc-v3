import { useState, useEffect, useCallback } from 'react';
import { geolocationService } from '../services/geolocation.service';
import { LocationData, GeocodeResult } from '../types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

interface UseGeolocationReturn {
  location: LocationData | null;
  address: GeocodeResult | null;
  error: string | null;
  loading: boolean;
  getCurrentLocation: () => Promise<void>;
  geocodeAddress: (address: string) => Promise<GeocodeResult>;
  reverseGeocode: (lat: number, lng: number) => Promise<GeocodeResult>;
  searchAddresses: (query: string) => Promise<Array<{address: string, formatted_address: string}>>;
  clearLocation: () => void;
}

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<GeocodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    watch = false
  } = options;

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const position = await geolocationService.getCurrentPosition();
      setLocation(position);

      // Géocoder automatiquement l'adresse
      try {
        const geocodeResult = await geolocationService.reverseGeocode(
          position.latitude,
          position.longitude
        );
        setAddress(geocodeResult);
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        // Ne pas échouer si le géocodage échoue
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géolocalisation';
      setError(errorMessage);
      setLocation(null);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const geocodeAddress = useCallback(async (addressQuery: string): Promise<GeocodeResult> => {
    try {
      setLoading(true);
      setError(null);

      const result = await geolocationService.geocodeAddress(addressQuery);
      
      // Mettre à jour la localisation avec les coordonnées trouvées
      setLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        timestamp: Date.now()
      });
      
      setAddress(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géocodage';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodeResult> => {
    try {
      setLoading(true);
      setError(null);

      const result = await geolocationService.reverseGeocode(lat, lng);
      setAddress(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géocodage inverse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAddresses = useCallback(async (query: string): Promise<Array<{address: string, formatted_address: string}>> => {
    try {
      setError(null);
      return await geolocationService.searchAddresses(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche d\'adresses';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setAddress(null);
    setError(null);
  }, []);

  // Effet pour surveiller la position si watch est activé
  useEffect(() => {
    if (!watch) return;

    let watchId: number | null = null;

    const startWatching = () => {
      if (!navigator.geolocation) return;

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
          setError(null);
        },
        (error) => {
          let errorMessage = 'Erreur de géolocalisation';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission de géolocalisation refusée';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout de géolocalisation';
              break;
          }
          
          setError(errorMessage);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
    };

    startWatching();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge]);

  return {
    location,
    address,
    error,
    loading,
    getCurrentLocation,
    geocodeAddress,
    reverseGeocode,
    searchAddresses,
    clearLocation
  };
};
