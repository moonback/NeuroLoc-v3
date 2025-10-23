-- Migration pour changer le type de conversation_id de UUID vers TEXT
-- Cela permettra d'utiliser des IDs composés comme "user1_user2_objectId"

-- D'abord, supprimer la contrainte de clé étrangère si elle existe
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- Changer le type de colonne de UUID vers TEXT
ALTER TABLE messages ALTER COLUMN conversation_id TYPE TEXT;

-- Optionnel: Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Optionnel: Ajouter une contrainte pour s'assurer que conversation_id n'est pas vide
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_not_empty CHECK (conversation_id IS NOT NULL AND conversation_id != '');
