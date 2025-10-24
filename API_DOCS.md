# 📚 Documentation API NeuroLoc

## Vue d'Ensemble

NeuroLoc utilise Supabase comme Backend-as-a-Service, fournissant une API REST automatique basée sur PostgreSQL. Cette documentation couvre tous les endpoints disponibles pour les différentes entités de l'application.

## 🔐 Authentification

### Endpoints d'Authentification

#### Inscription
```typescript
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "options": {
    "data": {
      "full_name": "John Doe",
      "role": "client"
    }
  }
}
```

#### Connexion
```typescript
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Déconnexion
```typescript
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

#### Réinitialisation de mot de passe
```typescript
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 👤 Profils Utilisateurs

### Endpoints Profils

#### Récupérer le profil de l'utilisateur connecté
```typescript
GET /rest/v1/profiles?select=*&id=eq.{user_id}
Authorization: Bearer <access_token>
```

#### Mettre à jour le profil
```typescript
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+33123456789",
  "bio": "Passionné de bricolage",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postal_code": "75001",
  "country": "France",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

#### Récupérer un profil public
```typescript
GET /rest/v1/profiles?select=*&id=eq.{profile_id}
Authorization: Bearer <access_token>
```

## 📦 Objets de Location

### Endpoints Objets

#### Lister tous les objets disponibles
```typescript
GET /rest/v1/objects?select=*,owner:profiles(*)&status=eq.available
Authorization: Bearer <access_token>
```

#### Rechercher des objets avec filtres
```typescript
GET /rest/v1/objects?select=*,owner:profiles(*)&category=eq.Bricolage&price_per_day=gte.10&price_per_day=lte.50
Authorization: Bearer <access_token>
```

#### Récupérer un objet spécifique
```typescript
GET /rest/v1/objects?select=*,owner:profiles(*)&id=eq.{object_id}
Authorization: Bearer <access_token>
```

#### Créer un nouvel objet
```typescript
POST /rest/v1/objects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Perceuse Bosch",
  "description": "Perceuse puissante pour tous travaux",
  "category": "Bricolage",
  "price_per_day": 15.00,
  "location": "Paris, France",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "images": ["https://example.com/image1.jpg"]
}
```

#### Mettre à jour un objet
```typescript
PATCH /rest/v1/objects?id=eq.{object_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Perceuse Bosch Pro",
  "price_per_day": 20.00,
  "status": "available"
}
```

#### Supprimer un objet
```typescript
DELETE /rest/v1/objects?id=eq.{object_id}
Authorization: Bearer <access_token>
```

## 📅 Réservations

### Endpoints Réservations

#### Créer une réservation
```typescript
POST /rest/v1/reservations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "object_id": "uuid-object-id",
  "owner_id": "uuid-owner-id",
  "start_date": "2024-02-01",
  "end_date": "2024-02-03",
  "total_price": 45.00,
  "status": "pending"
}
```

#### Récupérer les réservations de l'utilisateur
```typescript
GET /rest/v1/reservations?select=*,object:objects(*),owner:profiles(*),renter:profiles(*)&renter_id=eq.{user_id}
Authorization: Bearer <access_token>
```

#### Récupérer les réservations reçues
```typescript
GET /rest/v1/reservations?select=*,object:objects(*),owner:profiles(*),renter:profiles(*)&owner_id=eq.{user_id}
Authorization: Bearer <access_token>
```

#### Mettre à jour le statut d'une réservation
```typescript
PATCH /rest/v1/reservations?id=eq.{reservation_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "confirmed",
  "stripe_payment_intent": "pi_1234567890"
}
```

## 💬 Messages

### Endpoints Messages

#### Récupérer les conversations
```typescript
GET /rest/v1/messages?select=*,sender:profiles(*),receiver:profiles(*),object:objects(*)&conversation_id=eq.{conversation_id}&order=created_at.asc
Authorization: Bearer <access_token>
```

#### Envoyer un message
```typescript
POST /rest/v1/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "conversation_id": "conversation-uuid",
  "receiver_id": "uuid-receiver-id",
  "object_id": "uuid-object-id",
  "content": "Bonjour, je suis intéressé par votre objet"
}
```

#### Marquer un message comme lu
```typescript
PATCH /rest/v1/messages?id=eq.{message_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "read": true
}
```

## ⭐ Avis et Évaluations

### Endpoints Avis

#### Créer un avis
```typescript
POST /rest/v1/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reservation_id": "uuid-reservation-id",
  "reviewed_id": "uuid-reviewed-id",
  "rating": 5,
  "comment": "Excellent service, objet en parfait état"
}
```

#### Récupérer les avis d'un utilisateur
```typescript
GET /rest/v1/reviews?select=*,reviewer:profiles(*),reservation:reservations(*)&reviewed_id=eq.{user_id}
Authorization: Bearer <access_token>
```

## 📱 Handovers (Remises)

### Endpoints Handovers

#### Créer un handover
```typescript
POST /rest/v1/handovers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reservation_id": "uuid-reservation-id",
  "type": "pickup",
  "pickup_address": "123 Rue de la Paix, Paris",
  "pickup_latitude": 48.8566,
  "pickup_longitude": 2.3522,
  "scheduled_date": "2024-02-01T10:00:00Z",
  "notes": "Rendez-vous devant l'entrée principale"
}
```

#### Récupérer les handovers d'une réservation
```typescript
GET /rest/v1/handovers?select=*&reservation_id=eq.{reservation_id}
Authorization: Bearer <access_token>
```

#### Mettre à jour le statut d'un handover
```typescript
PATCH /rest/v1/handovers?id=eq.{handover_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "picked_up",
  "actual_date": "2024-02-01T10:30:00Z"
}
```

## 💳 Paiements Stripe

### Edge Functions

#### Créer une session de paiement
```typescript
POST /functions/v1/create-checkout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reservation_id": "uuid-reservation-id",
  "amount": 4500, // Montant en centimes
  "currency": "eur",
  "success_url": "https://neuroloc.com/payment/success",
  "cancel_url": "https://neuroloc.com/payment/cancel"
}
```

**Réponse :**
```json
{
  "sessionId": "cs_test_1234567890",
  "url": "https://checkout.stripe.com/pay/cs_test_1234567890"
}
```

#### Webhook Stripe (automatique)
```typescript
POST /functions/v1/stripe-webhook
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=signature

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "metadata": {
        "reservation_id": "uuid-reservation-id"
      }
    }
  }
}
```

## 🔍 Recherche et Filtres

### Paramètres de Recherche

#### Recherche textuelle
```typescript
GET /rest/v1/objects?select=*&title=ilike.*perceuse*
Authorization: Bearer <access_token>
```

#### Filtres par catégorie
```typescript
GET /rest/v1/objects?select=*&category=in.(Bricolage,Jardinage)
Authorization: Bearer <access_token>
```

#### Filtres par prix
```typescript
GET /rest/v1/objects?select=*&price_per_day=gte.10&price_per_day=lte.50
Authorization: Bearer <access_token>
```

#### Filtres par localisation
```typescript
GET /rest/v1/objects?select=*&location=ilike.*paris*
Authorization: Bearer <access_token>
```

#### Tri des résultats
```typescript
GET /rest/v1/objects?select=*&order=price_per_day.asc
GET /rest/v1/objects?select=*&order=created_at.desc
Authorization: Bearer <access_token>
```

## 📊 Statistiques

### Endpoints Statistiques

#### Statistiques d'un utilisateur
```typescript
GET /rest/v1/profiles?select=id&id=eq.{user_id}
Authorization: Bearer <access_token>
```

**Requêtes associées pour calculer les stats :**
```typescript
// Nombre d'objets publiés
GET /rest/v1/objects?select=count&owner_id=eq.{user_id}

// Nombre de réservations
GET /rest/v1/reservations?select=count&renter_id=eq.{user_id}

// Note moyenne
GET /rest/v1/reviews?select=avg(rating)&reviewed_id=eq.{user_id}
```

## 🚨 Gestion d'Erreurs

### Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 500 | Erreur serveur |

### Format des Erreurs

```json
{
  "code": "23505",
  "details": "Key (email)=(user@example.com) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"profiles_email_key\""
}
```

## 🔒 Sécurité et Permissions

### Row Level Security (RLS)

Toutes les tables utilisent RLS pour garantir la sécurité des données :

- **Profils** : Les utilisateurs peuvent uniquement voir/modifier leur propre profil
- **Objets** : Les propriétaires peuvent modifier leurs objets, tous peuvent voir les objets disponibles
- **Réservations** : Accès limité aux parties concernées (propriétaire et locataire)
- **Messages** : Accès limité aux participants de la conversation
- **Avis** : Lecture publique, écriture limitée aux utilisateurs authentifiés

### Headers Requis

```typescript
Authorization: Bearer <access_token>
Content-Type: application/json
apikey: <supabase_anon_key>
```

## 📝 Exemples d'Utilisation

### Créer une réservation complète

```typescript
// 1. Créer la réservation
const reservation = await supabase
  .from('reservations')
  .insert({
    object_id: 'uuid-object',
    owner_id: 'uuid-owner',
    start_date: '2024-02-01',
    end_date: '2024-02-03',
    total_price: 45.00,
    status: 'pending'
  })
  .select()
  .single();

// 2. Créer la session de paiement
const { data: checkout } = await supabase.functions.invoke('create-checkout', {
  body: {
    reservation_id: reservation.id,
    amount: 4500,
    currency: 'eur'
  }
});

// 3. Rediriger vers Stripe
window.location.href = checkout.url;
```

### Récupérer le dashboard utilisateur

```typescript
const [objects, reservations, receivedReservations] = await Promise.all([
  // Mes objets
  supabase
    .from('objects')
    .select('*')
    .eq('owner_id', user.id),
  
  // Mes réservations
  supabase
    .from('reservations')
    .select('*,object:objects(*),owner:profiles(*)')
    .eq('renter_id', user.id),
  
  // Réservations reçues
  supabase
    .from('reservations')
    .select('*,object:objects(*),renter:profiles(*)')
    .eq('owner_id', user.id)
]);
```

---

Cette API REST fournie par Supabase permet une intégration facile avec le frontend React et garantit la sécurité des données grâce aux politiques RLS.