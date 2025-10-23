-- Script pour corriger le type de conversation_id
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier le type actuel de la colonne
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'conversation_id';

-- Changer le type de UUID vers TEXT
ALTER TABLE messages ALTER COLUMN conversation_id TYPE TEXT;

-- Vérifier que le changement a été appliqué
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'conversation_id';

-- Ajouter un index pour les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Ajouter une contrainte de validation
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_not_empty 
CHECK (conversation_id IS NOT NULL AND conversation_id != '');
