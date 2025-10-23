import { GeocodeResult, LocationData, AddressComponents } from '../types';

// Interface pour les réponses de l'API de géocodage
interface GeocodeApiResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export const geolocationService = {
  // Obtenir la position actuelle de l'utilisateur
  async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
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
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  },

  // Géocoder des coordonnées en adresse (reverse geocoding)
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    try {
      // Utilisation de l'API Nominatim (OpenStreetMap) - gratuite
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage inverse');
      }

      const data = await response.json();

      if (!data || !data.address) {
        throw new Error('Adresse non trouvée');
      }

      const address = data.address;
      
      return {
        address: this.formatAddress(address),
        city: address.city || address.town || address.village || address.municipality || '',
        postal_code: address.postcode || '',
        country: address.country || '',
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
        formatted_address: data.display_name || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Impossible de récupérer l\'adresse à partir des coordonnées');
    }
  },

  // Géocoder une adresse en coordonnées (forward geocoding)
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1&accept-language=fr`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Adresse non trouvée');
      }

      const result = data[0];
      const addressDetails = result.address;

      return {
        address: this.formatAddress(addressDetails),
        city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.municipality || '',
        postal_code: addressDetails.postcode || '',
        country: addressDetails.country || '',
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formatted_address: result.display_name || ''
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Impossible de trouver les coordonnées de cette adresse');
    }
  },

  // Formater une adresse à partir des composants
  formatAddress(addressComponents: any): string {
    const parts = [];
    
    if (addressComponents.house_number) {
      parts.push(addressComponents.house_number);
    }
    
    if (addressComponents.road) {
      parts.push(addressComponents.road);
    }
    
    if (addressComponents.pedestrian) {
      parts.push(addressComponents.pedestrian);
    }
    
    return parts.join(' ');
  },

  // Calculer la distance entre deux points (en kilomètres)
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  },

  // Convertir les degrés en radians
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Valider des coordonnées
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  },

  // Obtenir la position et géocoder automatiquement
  async getCurrentLocationWithAddress(): Promise<GeocodeResult> {
    try {
      const position = await this.getCurrentPosition();
      const geocodeResult = await this.reverseGeocode(position.latitude, position.longitude);
      
      return {
        ...geocodeResult,
        latitude: position.latitude,
        longitude: position.longitude
      };
    } catch (error) {
      console.error('Error getting current location with address:', error);
      throw error;
    }
  },

  // Rechercher des adresses avec autocomplétion
  async searchAddresses(query: string, limit: number = 5): Promise<Array<{address: string, formatted_address: string}>> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=${limit}&accept-language=fr`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche d\'adresses');
      }

      const data = await response.json();

      return data.map((result: any) => ({
        address: this.formatAddress(result.address),
        formatted_address: result.display_name
      }));
    } catch (error) {
      console.error('Address search error:', error);
      throw new Error('Impossible de rechercher des adresses');
    }
  }
};
