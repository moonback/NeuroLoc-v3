-- Migration pour ajouter les champs de rôle et de vérification aux profils
-- Date: 2025-01-24

-- Ajouter les colonnes role et is_verified à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' CHECK (role IN ('client', 'loueur', 'admin')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Créer un index sur la colonne role pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Créer un index sur la colonne is_verified pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- Mettre à jour les profils existants pour avoir un rôle par défaut
-- (optionnel, seulement si vous voulez migrer les données existantes)
UPDATE profiles 
SET role = 'loueur' 
WHERE id IN (
  SELECT DISTINCT owner_id 
  FROM objects 
  WHERE owner_id IS NOT NULL
);

-- Commentaire sur la migration
COMMENT ON COLUMN profiles.role IS 'Rôle de l''utilisateur: client, loueur, ou admin';
COMMENT ON COLUMN profiles.is_verified IS 'Indique si le profil utilisateur est vérifié';
