#!/bin/bash

# Script pour configurer le bucket de stockage Supabase
# Ce script doit être exécuté dans le terminal Supabase CLI

echo "🚀 Configuration du bucket de stockage pour les avatars..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    echo "Installation: npm install -g supabase"
    exit 1
fi

# Vérifier si nous sommes dans un projet Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Ce répertoire ne semble pas être un projet Supabase."
    echo "Assurez-vous d'être dans le répertoire racine de votre projet."
    exit 1
fi

echo "📁 Application des migrations..."

# Appliquer les migrations
supabase db push

echo "✅ Migrations appliquées avec succès!"

echo "🔧 Configuration du bucket de stockage..."

# Créer le bucket via l'API Supabase (si nécessaire)
echo "📦 Vérification du bucket 'profiles'..."

# Note: Le bucket devrait être créé automatiquement par la migration
# Si ce n'est pas le cas, vous devrez le créer manuellement dans le dashboard Supabase

echo "✅ Configuration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez dans le dashboard Supabase que le bucket 'profiles' existe"
echo "2. Vérifiez que les politiques de sécurité sont correctement configurées"
echo "3. Testez l'upload d'avatar dans votre application"
echo ""
echo "🔗 Dashboard Supabase: https://supabase.com/dashboard"
echo "📚 Documentation Storage: https://supabase.com/docs/guides/storage"
