# Documentation API NeuroLoc

## Vue d'ensemble

NeuroLoc utilise Supabase comme Backend-as-a-Service, ce qui signifie que la plupart des opérations API sont gérées directement par le client Supabase. Cette documentation décrit les services personnalisés et les Edge Functions utilisées dans l'application.

## Configuration

### Client Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

## Services d'authentification

### `authService`

#### `signup(credentials: SignupCredentials)`
Inscription d'un nouvel utilisateur.

**Paramètres :**
```typescript
interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
}
```

**Réponse :**
```typescript
{
  user: User | null;
  session: Session | null;
}
```

#### `login(credentials: AuthCredentials)`
Connexion d'un utilisateur existant.

**Paramètres :**
```typescript
interface AuthCredentials {
  email: string;
  password: string;
}
```

#### `logout()`
Déconnexion de l'utilisateur actuel.

#### `getProfile(userId: string): Promise<Profile>`
Récupération du profil utilisateur.

**Réponse :**
```typescript
interface Profile {
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
```

#### `updateProfile(userId: string, updates: Partial<Profile>)`
Mise à jour du profil utilisateur.

#### `uploadAvatar(userId: string, file: File): Promise<string>`
Upload d'un avatar utilisateur.

**Paramètres :**
- `userId`: ID de l'utilisateur
- `file`: Fichier image (max 5MB, formats: JPEG, PNG, WebP, GIF)

**Réponse :** URL publique de l'avatar

## Services d'objets

### `objectsService`

#### `getObjects(filters?: SearchFilters): Promise<RentalObject[]>`
Récupération de la liste des objets avec filtres optionnels.

**Paramètres :**
```typescript
interface SearchFilters {
  query?: string;           // Recherche textuelle
  category?: string;        // Catégorie d'objet
  min_price?: number;       // Prix minimum
  max_price?: number;       // Prix maximum
  location?: string;        // Localisation
  status?: ObjectStatus;     // Statut de disponibilité
}
```

**Réponse :**
```typescript
interface RentalObject {
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
```

#### `getObjectById(id: string): Promise<RentalObject | null>`
Récupération d'un objet par son ID.

#### `getObjectsByOwner(ownerId: string): Promise<RentalObject[]>`
Récupération des objets d'un propriétaire.

#### `createObject(input: CreateObjectInput): Promise<RentalObject>`
Création d'un nouvel objet.

**Paramètres :**
```typescript
interface CreateObjectInput {
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}
```

#### `updateObject(id: string, updates: UpdateObjectInput): Promise<RentalObject>`
Mise à jour d'un objet existant.

#### `deleteObject(id: string): Promise<void>`
Suppression d'un objet.

#### `uploadObjectImages(objectId: string, files: File[]): Promise<string[]>`
Upload d'images pour un objet.

#### `checkAvailability(objectId: string, startDate: string, endDate: string): Promise<boolean>`
Vérification de la disponibilité d'un objet pour une période donnée.

## Services de réservation

### `reservationsService`

#### `getReservations(): Promise<Reservation[]>`
Récupération de toutes les réservations de l'utilisateur (en tant que locataire ou propriétaire).

#### `getReservationById(id: string): Promise<Reservation | null>`
Récupération d'une réservation par son ID.

#### `getReservationsAsRenter(): Promise<Reservation[]>`
Récupération des réservations en tant que locataire.

#### `getReservationsAsOwner(): Promise<Reservation[]>`
Récupération des réservations en tant que propriétaire.

#### `createReservation(input: CreateReservationInput): Promise<Reservation>`
Création d'une nouvelle réservation.

**Paramètres :**
```typescript
interface CreateReservationInput {
  object_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}
```

**Réponse :**
```typescript
interface Reservation {
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
}
```

#### `updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation>`
Mise à jour d'une réservation.

#### `cancelReservation(id: string): Promise<void>`
Annulation d'une réservation.

#### `confirmReservation(id: string, stripePaymentIntent: string): Promise<Reservation>`
Confirmation d'une réservation après paiement.

#### `calculateTotalPrice(pricePerDay: number, startDate: string, endDate: string): number`
Calcul du prix total pour une période donnée.

## Services de messagerie

### `messagesService`

#### `getConversations(): Promise<Conversation[]>`
Récupération de la liste des conversations.

**Réponse :**
```typescript
interface Conversation {
  conversation_id: string;
  other_user: Profile;
  last_message: Message;
  unread_count: number;
  object?: RentalObject;
}
```

#### `getMessages(conversationId: string): Promise<Message[]>`
Récupération des messages d'une conversation.

**Réponse :**
```typescript
interface Message {
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
```

#### `sendMessage(input: CreateMessageInput): Promise<Message>`
Envoi d'un nouveau message.

**Paramètres :**
```typescript
interface CreateMessageInput {
  conversation_id: string;
  receiver_id: string;
  object_id?: string;
  content: string;
}
```

#### `markAsRead(messageId: string): Promise<void>`
Marquage d'un message comme lu.

#### `markConversationAsRead(conversationId: string): Promise<void>`
Marquage de tous les messages d'une conversation comme lus.

#### `generateConversationId(userId1: string, userId2: string, objectId?: string): string`
Génération d'un ID de conversation unique.

#### `subscribeToMessages(conversationId: string, callback: (message: Message) => void)`
Abonnement aux nouveaux messages d'une conversation.

#### `getUnreadCount(): Promise<number>`
Récupération du nombre de messages non lus.

## Services d'avis

### `reviewsService`

#### `getReviewsByUserId(userId: string): Promise<Review[]>`
Récupération des avis reçus par un utilisateur.

#### `getReviewsByReservationId(reservationId: string): Promise<Review[]>`
Récupération des avis pour une réservation.

#### `createReview(input: CreateReviewInput): Promise<Review>`
Création d'un nouvel avis.

**Paramètres :**
```typescript
interface CreateReviewInput {
  reservation_id: string;
  reviewed_id: string;
  rating: number;        // 1-5
  comment?: string;
}
```

#### `updateReview(reviewId: string, updates: Partial<CreateReviewInput>): Promise<Review>`
Mise à jour d'un avis existant.

#### `deleteReview(reviewId: string): Promise<void>`
Suppression d'un avis.

#### `getAverageRating(userId: string): Promise<number>`
Calcul de la note moyenne d'un utilisateur.

#### `getRatingStats(userId: string): Promise<RatingStats>`
Récupération des statistiques de notation d'un utilisateur.

**Réponse :**
```typescript
interface RatingStats {
  average: number;
  total: number;
  distribution: { [key: number]: number }; // Distribution des notes 1-5
}
```

## Edge Functions

### `create-checkout`

Endpoint pour créer une session de paiement Stripe.

**URL :** `POST /functions/v1/create-checkout`

**Paramètres :**
```typescript
interface CheckoutRequest {
  reservationId: string;
  amount: number;        // Montant en centimes
  objectTitle: string;
}
```

**Réponse :**
```typescript
{
  sessionId: string;     // ID de session Stripe
}
```

### `stripe-webhook`

Endpoint pour recevoir les webhooks Stripe.

**URL :** `POST /functions/v1/stripe-webhook`

Gère automatiquement :
- Confirmation des paiements
- Mise à jour du statut des réservations
- Gestion des erreurs de paiement

## Gestion des erreurs

### Types d'erreurs

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
```

### Codes d'erreur courants

- `AUTH_REQUIRED`: Authentification requise
- `INVALID_INPUT`: Données d'entrée invalides
- `NOT_FOUND`: Ressource non trouvée
- `UNAUTHORIZED`: Accès non autorisé
- `PAYMENT_FAILED`: Échec du paiement
- `UPLOAD_FAILED`: Échec de l'upload

### Gestion des erreurs côté client

```typescript
try {
  const result = await objectsService.createObject(data);
  toast.success('Objet créé avec succès');
} catch (error) {
  console.error('Erreur:', error);
  toast.error(error.message || 'Une erreur est survenue');
}
```

## Sécurité

### Row Level Security (RLS)

Toutes les tables utilisent RLS avec des policies restrictives :

- **Profiles** : Lecture publique, modification par le propriétaire
- **Objects** : Lecture publique, modification par le propriétaire
- **Reservations** : Accès limité aux parties concernées
- **Messages** : Accès limité aux participants
- **Reviews** : Lecture publique, création par les parties concernées

### Validation des données

- Validation côté client avec TypeScript
- Validation côté serveur avec les contraintes SQL
- Sanitisation des entrées utilisateur
- Vérification des permissions avant chaque opération

## Rate Limiting

Supabase applique automatiquement des limites de taux :
- **Authentification** : 10 requêtes/minute
- **API** : 1000 requêtes/minute
- **Storage** : 100 uploads/minute

## Monitoring

### Logs automatiques
- Toutes les requêtes sont loggées
- Erreurs trackées automatiquement
- Métriques de performance disponibles

### Alertes
- Échecs de paiement Stripe
- Erreurs critiques d'API
- Utilisation excessive des ressources
