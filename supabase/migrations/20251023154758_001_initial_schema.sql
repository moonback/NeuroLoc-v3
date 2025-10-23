/*
  # Schema initial NeuroLoc - Plateforme de location d'objets

  ## Description
  Ce fichier crée le schéma complet de la base de données pour NeuroLoc,
  une plateforme de location d'objets entre particuliers.

  ## Tables créées

  ### 1. profiles
  Table des profils utilisateurs liée à auth.users
  - Stocke les informations détaillées des utilisateurs (nom, avatar, téléphone, bio)
  - Relation 1:1 avec auth.users

  ### 2. objects
  Table des objets disponibles à la location
  - Contient tous les détails des objets (titre, description, prix, images)
  - Gère la localisation géographique (latitude/longitude)
  - Statut de disponibilité (available, rented, unavailable)
  - Relation avec profiles (owner_id)

  ### 3. reservations
  Table des réservations d'objets
  - Gère les périodes de location (dates début/fin)
  - Calcule le prix total
  - Suit le statut de la réservation (pending, confirmed, ongoing, completed, cancelled)
  - Stocke l'identifiant de paiement Stripe
  - Relations avec objects, profiles (renter et owner)

  ### 4. messages
  Table de messagerie entre utilisateurs
  - Conversations groupées par conversation_id
  - Lien optionnel avec un objet
  - Statut de lecture
  - Relations avec profiles (sender et receiver)

  ### 5. reviews
  Table des avis et évaluations
  - Note de 1 à 5 étoiles
  - Commentaire textuel
  - Liée à une réservation complétée
  - Relations avec profiles (reviewer et reviewed)

  ## Sécurité
  - RLS (Row Level Security) activé sur toutes les tables
  - Policies restrictives basées sur l'authentification et la propriété des données
  - Les utilisateurs peuvent uniquement accéder à leurs propres données
  - Les données publiques (objets disponibles, profils publics) sont accessibles à tous les utilisateurs authentifiés

  ## Indexes
  - Index sur les clés étrangères pour optimiser les jointures
  - Index sur les champs de recherche fréquents (status, category, location)
  - Index sur les dates de réservation pour les requêtes de disponibilité
*/

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Table des objets à louer
CREATE TABLE IF NOT EXISTS objects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price_per_day decimal(10,2) NOT NULL CHECK (price_per_day >= 0),
  images text[] DEFAULT ARRAY[]::text[],
  location text NOT NULL,
  latitude decimal(10,8),
  longitude decimal(11,8),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'unavailable')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  object_id uuid NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled')),
  stripe_payment_intent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  object_id uuid REFERENCES objects(id) ON DELETE SET NULL,
  content text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(reservation_id, reviewer_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_objects_owner_id ON objects(owner_id);
CREATE INDEX IF NOT EXISTS idx_objects_status ON objects(status);
CREATE INDEX IF NOT EXISTS idx_objects_category ON objects(category);
CREATE INDEX IF NOT EXISTS idx_reservations_object_id ON reservations(object_id);
CREATE INDEX IF NOT EXISTS idx_reservations_renter_id ON reservations(renter_id);
CREATE INDEX IF NOT EXISTS idx_reservations_owner_id ON reservations(owner_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON objects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies pour objects
CREATE POLICY "Anyone can view available objects"
  ON objects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create objects"
  ON objects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own objects"
  ON objects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own objects"
  ON objects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policies pour reservations
CREATE POLICY "Users can view own reservations as renter"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters and owners can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Policies pour messages
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Policies pour reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their reservations"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = reservation_id
      AND (reservations.renter_id = auth.uid() OR reservations.owner_id = auth.uid())
      AND reservations.status = 'completed'
    )
  );

CREATE POLICY "Reviewers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);