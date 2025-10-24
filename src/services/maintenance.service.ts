import { supabase } from './supabase';

export const maintenanceService = {
  /**
   * Réinitialise les statuts des objets basés sur leurs réservations actives
   * Cette fonction peut être utilisée pour corriger les incohérences
   */
  async resetObjectStatuses(): Promise<void> {
    try {
      // Récupérer tous les objets
      const { data: objects, error: objectsError } = await supabase
        .from('objects')
        .select('id, status');

      if (objectsError) throw objectsError;

      for (const object of objects || []) {
        // Vérifier s'il y a des réservations actives pour cet objet
        const { data: activeReservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('id, status')
          .eq('object_id', object.id)
          .in('status', ['confirmed', 'ongoing']);

        if (reservationsError) throw reservationsError;

        // Déterminer le statut correct
        let correctStatus = 'available';
        if (activeReservations && activeReservations.length > 0) {
          correctStatus = 'rented';
        }

        // Mettre à jour si nécessaire
        if (object.status !== correctStatus) {
          console.log(`Mise à jour de l'objet ${object.id}: ${object.status} → ${correctStatus}`);
          
          const { error: updateError } = await supabase
            .from('objects')
            .update({ 
              status: correctStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', object.id);

          if (updateError) throw updateError;
        }
      }

      console.log('Réinitialisation des statuts d\'objets terminée');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des statuts:', error);
      throw error;
    }
  },

  /**
   * Marque automatiquement les réservations comme 'ongoing' quand la date de début arrive
   */
  async updateOngoingReservations(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'ongoing',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'confirmed')
        .lte('start_date', today);

      if (error) throw error;

      console.log('Mise à jour des réservations en cours terminée');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des réservations:', error);
      throw error;
    }
  },

  /**
   * Marque automatiquement les réservations comme 'completed' quand la date de fin passe
   */
  async completeFinishedReservations(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'ongoing')
        .lt('end_date', today);

      if (error) throw error;

      // Remettre les objets en 'available' pour les réservations terminées
      const { data: completedReservations } = await supabase
        .from('reservations')
        .select('object_id')
        .eq('status', 'completed')
        .lt('end_date', today);

      if (completedReservations) {
        for (const reservation of completedReservations) {
          await supabase
            .from('objects')
            .update({ 
              status: 'available',
              updated_at: new Date().toISOString()
            })
            .eq('id', reservation.object_id);
        }
      }

      console.log('Finalisation des réservations terminées terminée');
    } catch (error) {
      console.error('Erreur lors de la finalisation des réservations:', error);
      throw error;
    }
  }
};
