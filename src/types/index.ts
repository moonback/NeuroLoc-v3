export type ObjectStatus = 'available' | 'rented' | 'unavailable';

export type ReservationStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'rejected';

export type HandoverStatus = 'pending' | 'picked_up' | 'returned' | 'cancelled';

export type HandoverType = 'pickup' | 'return';

export type Category =
  | 'Bricolage'
  | 'Jardinage'
  | 'Sport'
  | 'Électronique'
  | 'Véhicules'
  | 'Maison'
  | 'Événements'
  | 'Autre';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface RentalObject {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  images: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: ObjectStatus;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Reservation {
  id: string;
  object_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: ReservationStatus;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
  object?: RentalObject;
  renter?: Profile;
  owner?: Profile;
  handovers?: Handover[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  object_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  object?: RentalObject;
}

export interface Review {
  id: string;
  reservation_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
  reviewed?: Profile;
  reservation?: Reservation;
}

export interface Conversation {
  conversation_id: string;
  other_user: Profile;
  last_message: Message;
  unread_count: number;
  object?: RentalObject;
}

export interface CreateObjectInput {
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface UpdateObjectInput extends Partial<CreateObjectInput> {
  status?: ObjectStatus;
}

export interface CreateReservationInput {
  object_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}

export interface CreateMessageInput {
  conversation_id: string;
  receiver_id: string;
  object_id?: string;
  content: string;
}

export interface CreateReviewInput {
  reservation_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  status?: ObjectStatus;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends AuthCredentials {
  full_name: string;
}

export interface GeocodeResult {
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  postal_code?: string;
}

export interface Handover {
  id: string;
  reservation_id: string;
  type: HandoverType;
  status: HandoverStatus;
  qr_code: string;
  pickup_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  scheduled_date: string;
  actual_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  reservation?: Reservation;
}

export interface CreateHandoverInput {
  reservation_id: string;
  type: HandoverType;
  pickup_address: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  scheduled_date: string;
  notes?: string;
}
