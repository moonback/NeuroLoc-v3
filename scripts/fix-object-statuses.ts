#!/usr/bin/env ts-node

/**
 * Script de correction des statuts d'objets
 * 
 * Ce script corrige les incohérences entre les statuts des objets
 * et leurs réservations actives.
 * 
 * Usage:
 * npm run fix-object-statuses
 * ou
 * npx ts-node scripts/fix-object-statuses.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (utilise les variables d'environnement)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ObjectWithReservations {
  id: string;
  title: string;
  status: string;
  reservations: Array<{
    id: string;
    status: string;
  }>;
}

async function fixObjectStatuses() {
  console.log('🔧 Début de la correction des statuts d\'objets...\n');

  try {
    // Récupérer tous les objets avec leurs réservations
    const { data: objects, error: objectsError } = await supabase
      .from('objects')
      .select(`
        id,
        title,
        status,
        reservations(id, status)
      `);

    if (objectsError) {
      throw new Error(`Erreur lors de la récupération des objets: ${objectsError.message}`);
    }

    console.log(`📊 ${objects?.length || 0} objets trouvés\n`);

    let correctedCount = 0;
    const corrections: Array<{
      id: string;
      title: string;
      oldStatus: string;
      newStatus: string;
      reason: string;
    }> = [];

    // Analyser chaque objet
    for (const object of objects as ObjectWithReservations[]) {
      const activeReservations = object.reservations?.filter(
        r => ['confirmed', 'ongoing'].includes(r.status)
      ) || [];

      let newStatus = object.status;
      let reason = '';

      // Déterminer le statut correct basé sur les réservations actives
      if (activeReservations.length > 0 && object.status !== 'rented') {
        newStatus = 'rented';
        reason = `A ${activeReservations.length} réservation(s) active(s)`;
      } else if (activeReservations.length === 0 && object.status === 'rented') {
        newStatus = 'available';
        reason = 'Aucune réservation active';
      }

      // Appliquer la correction si nécessaire
      if (newStatus !== object.status) {
        const { error: updateError } = await supabase
          .from('objects')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', object.id);

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de l'objet ${object.id}:`, updateError);
        } else {
          correctedCount++;
          corrections.push({
            id: object.id,
            title: object.title,
            oldStatus: object.status,
            newStatus,
            reason
          });
          
          console.log(`✅ ${object.title}: ${object.status} → ${newStatus} (${reason})`);
        }
      }
    }

    // Afficher le résumé
    console.log(`\n📋 Résumé des corrections:`);
    console.log(`- Objets analysés: ${objects?.length || 0}`);
    console.log(`- Corrections appliquées: ${correctedCount}`);
    
    if (correctedCount === 0) {
      console.log('✅ Aucune correction nécessaire - tous les statuts sont cohérents');
    } else {
      console.log('\n📝 Détail des corrections:');
      corrections.forEach(correction => {
        console.log(`- ${correction.title} (${correction.id}): ${correction.oldStatus} → ${correction.newStatus} (${correction.reason})`);
      });
    }

    console.log('\n🎉 Correction terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  fixObjectStatuses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export { fixObjectStatuses };
