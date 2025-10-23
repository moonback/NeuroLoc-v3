export const CATEGORIES = [
  'Bricolage',
  'Jardinage',
  'Sport',
  'Électronique',
  'Véhicules',
  'Maison',
  'Événements',
  'Autre'
] as const;

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const OBJECT_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  UNAVAILABLE: 'unavailable'
} as const;
