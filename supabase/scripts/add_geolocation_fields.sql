-- Script SQL à exécuter dans l'éditeur SQL de Supabase
-- Ajout des champs de géolocalisation aux profils

-- 1. Ajouter les nouveaux champs à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS latitude decimal(10,8),
ADD COLUMN IF NOT EXISTS longitude decimal(11,8);

-- 2. Ajouter des contraintes de validation pour les coordonnées
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS valid_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS valid_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- 3. Créer des index pour optimiser les requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city) 
WHERE city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country) 
WHERE country IS NOT NULL;

-- 4. Fonction pour calculer la distance entre deux points géographiques
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

-- 5. Fonction pour trouver les utilisateurs dans un rayon donné
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

-- 6. Vérifier que tout a été créé correctement
SELECT 
  'Champs ajoutés' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('address', 'city', 'postal_code', 'country', 'latitude', 'longitude')
ORDER BY column_name;

-- 7. Vérifier les contraintes
SELECT 
  'Contraintes créées' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_name LIKE '%valid_%';

-- 8. Vérifier les index
SELECT 
  'Index créés' as status,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname LIKE '%location%' OR indexname LIKE '%city%' OR indexname LIKE '%country%';
