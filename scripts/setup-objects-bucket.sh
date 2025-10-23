#!/bin/bash

# Script pour appliquer la migration du bucket d'images d'objets
# Ce script applique la migration SQL pour créer le bucket 'objects'

echo "🚀 Application de la migration du bucket d'images d'objets..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    echo "   npm install -g supabase"
    exit 1
fi

# Appliquer la migration
echo "📦 Création du bucket 'objects' pour les images d'objets..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès!"
    echo ""
    echo "📋 Résumé des changements:"
    echo "   • Bucket 'objects' créé pour les images d'objets"
    echo "   • Politiques RLS configurées pour la sécurité"
    echo "   • Triggers automatiques pour le nettoyage des images"
    echo "   • Limite de 10MB par image"
    echo "   • Types de fichiers autorisés: JPEG, PNG, WebP, GIF"
    echo ""
    echo "🔧 Prochaines étapes:"
    echo "   1. Testez l'upload d'images dans l'interface"
    echo "   2. Vérifiez que les images s'affichent correctement"
    echo "   3. Testez la suppression d'objets avec images"
else
    echo "❌ Erreur lors de l'application de la migration"
    echo "   Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
