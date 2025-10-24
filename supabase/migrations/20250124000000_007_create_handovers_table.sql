-- Migration pour créer la table handovers
CREATE TABLE IF NOT EXISTS handovers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pickup', 'return')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'returned', 'cancelled')),
  qr_code TEXT NOT NULL UNIQUE,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_handovers_reservation_id ON handovers(reservation_id);
CREATE INDEX IF NOT EXISTS idx_handovers_qr_code ON handovers(qr_code);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON handovers(status);
CREATE INDEX IF NOT EXISTS idx_handovers_type ON handovers(type);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_handovers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_handovers_updated_at
  BEFORE UPDATE ON handovers
  FOR EACH ROW
  EXECUTE FUNCTION update_handovers_updated_at();

-- RLS (Row Level Security)
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leurs propres handovers
CREATE POLICY "Users can view their own handovers" ON handovers
  FOR SELECT USING (
    reservation_id IN (
      SELECT id FROM reservations 
      WHERE renter_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Policy pour permettre aux utilisateurs de créer des handovers pour leurs réservations
CREATE POLICY "Users can create handovers for their reservations" ON handovers
  FOR INSERT WITH CHECK (
    reservation_id IN (
      SELECT id FROM reservations 
      WHERE renter_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Policy pour permettre aux utilisateurs de mettre à jour leurs handovers
CREATE POLICY "Users can update their own handovers" ON handovers
  FOR UPDATE USING (
    reservation_id IN (
      SELECT id FROM reservations 
      WHERE renter_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Policy pour permettre aux utilisateurs de supprimer leurs handovers
CREATE POLICY "Users can delete their own handovers" ON handovers
  FOR DELETE USING (
    reservation_id IN (
      SELECT id FROM reservations 
      WHERE renter_id = auth.uid() OR owner_id = auth.uid()
    )
  );
