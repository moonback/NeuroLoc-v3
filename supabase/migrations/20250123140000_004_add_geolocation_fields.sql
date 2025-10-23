-- Migration pour ajouter les champs de géolocalisation aux profils
-- Date: 2025-01-23
-- Description: Ajout des champs d'adresse et de coordonnées géographiques

-- Ajouter les nouveaux champs à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS latitude decimal(10,8),
ADD COLUMN IF NOT EXISTS longitude decimal(11,8);

-- Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN profiles.address IS 'Adresse complète de l''utilisateur';
COMMENT ON COLUMN profiles.city IS 'Ville de l''utilisateur';
COMMENT ON COLUMN profiles.postal_code IS 'Code postal de l''utilisateur';
COMMENT ON COLUMN profiles.country IS 'Pays de l''utilisateur';
COMMENT ON COLUMN profiles.latitude IS 'Latitude de la position de l''utilisateur';
COMMENT ON COLUMN profiles.longitude IS 'Longitude de la position de l''utilisateur';

-- Ajouter des contraintes de validation pour les coordonnées
ALTER TABLE profiles 
ADD CONSTRAINT valid_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE profiles 
ADD CONSTRAINT valid_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Créer des index pour optimiser les requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city) 
WHERE city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country) 
WHERE country IS NOT NULL;

-- Fonction pour calculer la distance entre deux points géographiques
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 decimal(10,8),
  lon1 decimal(11,8),
  lat2 decimal(10,8),
  lon2 decimal(11,8)
)
RETURNS decimal(10,2) AS $$
DECLARE
  earth_radius decimal(10,2) := 6371; -- Rayon de la Terre en kilomètres
  dlat decimal(10,8);
  dlon decimal(11,8);
  a decimal(20,10);
  c decimal(20,10);
  distance decimal(10,2);
BEGIN
  -- Vérifier que les coordonnées sont valides
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF lat1 < -90 OR lat1 > 90 OR lat2 < -90 OR lat2 > 90 THEN
    RETURN NULL;
  END IF;
  
  IF lon1 < -180 OR lon1 > 180 OR lon2 < -180 OR lon2 > 180 THEN
    RETURN NULL;
  END IF;
  
  -- Convertir les degrés en radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  -- Calculer la distance en utilisant la formule de Haversine
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  distance := earth_radius * c;
  
  RETURN round(distance * 100) / 100; -- Arrondir à 2 décimales
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour trouver les utilisateurs dans un rayon donné
CREATE OR REPLACE FUNCTION find_users_within_radius(
  center_lat decimal(10,8),
  center_lon decimal(11,8),
  radius_km decimal(10,2)
)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  city text,
  country text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  distance_km decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.city,
    p.country,
    p.latitude,
    p.longitude,
    calculate_distance(center_lat, center_lon, p.latitude, p.longitude) as distance_km
  FROM profiles p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(center_lat, center_lon, p.latitude, p.longitude) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement les coordonnées lors de la mise à jour de l'adresse
CREATE OR REPLACE FUNCTION update_profile_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Cette fonction peut être étendue pour appeler un service de géocodage
  -- Pour l'instant, elle ne fait que mettre à jour le timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp lors des changements de localisation
CREATE TRIGGER update_profile_location_trigger
  BEFORE UPDATE OF address, city, postal_code, country, latitude, longitude ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_location();

-- Mettre à jour la fonction handle_new_user pour inclure les nouveaux champs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, address, city, postal_code, country, latitude, longitude)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postal_code',
    NEW.raw_user_meta_data->>'country',
    (NEW.raw_user_meta_data->>'latitude')::decimal(10,8),
    (NEW.raw_user_meta_data->>'longitude')::decimal(11,8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
