import { supabase } from '../services/supabase';
import { maintenanceService } from '../services/maintenance.service';

export const diagnosticUtils = {
  /**
   * Diagnostique les problèmes de cohérence des statuts d'objets
   */
  async diagnoseObjectStatuses(): Promise<{
    totalObjects: number;
    availableObjects: number;
    rentedObjects: number;
    unavailableObjects: number;
    inconsistentObjects: Array<{
      id: string;
      title: string;
      status: string;
      activeReservations: number;
      issue: string;
    }>;
  }> {
    try {
      // Récupérer tous les objets avec leurs réservations
      const { data: objects, error: objectsError } = await supabase
        .from('objects')
        .select(`
          id,
          title,
          status,
          reservations!inner(id, status)
        `);

      if (objectsError) throw objectsError;

      const result = {
        totalObjects: objects?.length || 0,
        availableObjects: 0,
        rentedObjects: 0,
        unavailableObjects: 0,
        inconsistentObjects: [] as Array<{
          id: string;
          title: string;
          status: string;
          activeReservations: number;
          issue: string;
        }>
      };

      // Analyser chaque objet
      for (const object of objects || []) {
        const activeReservations = object.reservations?.filter(
          (r: any) => ['confirmed', 'ongoing'].includes(r.status)
        ) || [];

        // Compter les statuts
        if (object.status === 'available') result.availableObjects++;
        else if (object.status === 'rented') result.rentedObjects++;
        else if (object.status === 'unavailable') result.unavailableObjects++;

        // Vérifier les incohérences
        let issue = '';
        if (object.status === 'available' && activeReservations.length > 0) {
          issue = 'Objet marqué comme disponible mais a des réservations actives';
        } else if (object.status === 'rented' && activeReservations.length === 0) {
          issue = 'Objet marqué comme loué mais n\'a pas de réservations actives';
        }

        if (issue) {
          result.inconsistentObjects.push({
            id: object.id,
            title: object.title,
            status: object.status,
            activeReservations: activeReservations.length,
            issue
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      throw error;
    }
  },

  /**
   * Affiche un rapport de diagnostic dans la console
   */
  async generateDiagnosticReport(): Promise<void> {
    try {
      console.log('🔍 Diagnostic des statuts d\'objets...');
      
      const diagnostic = await this.diagnoseObjectStatuses();
      
      console.log('\n📊 Rapport de diagnostic:');
      console.log(`Total d'objets: ${diagnostic.totalObjects}`);
      console.log(`- Disponibles: ${diagnostic.availableObjects}`);
      console.log(`- Loués: ${diagnostic.rentedObjects}`);
      console.log(`- Indisponibles: ${diagnostic.unavailableObjects}`);
      
      if (diagnostic.inconsistentObjects.length > 0) {
        console.log(`\n⚠️  ${diagnostic.inconsistentObjects.length} objet(s) avec des incohérences:`);
        diagnostic.inconsistentObjects.forEach(obj => {
          console.log(`- ${obj.title} (${obj.id}): ${obj.issue}`);
        });
        
        console.log('\n🔧 Correction automatique en cours...');
        await maintenanceService.resetObjectStatuses();
        console.log('✅ Correction terminée');
      } else {
        console.log('\n✅ Aucune incohérence détectée');
      }
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
    }
  },

  /**
   * Fonction utilitaire pour tester le système
   */
  async testObjectStatusFlow(): Promise<void> {
    console.log('🧪 Test du flux de statuts d\'objets...');
    
    try {
      // Test 1: Vérifier les objets disponibles
      const { data: availableObjects } = await supabase
        .from('objects')
        .select('id, title, status')
        .eq('status', 'available');
      
      console.log(`✅ ${availableObjects?.length || 0} objets disponibles`);
      
      // Test 2: Vérifier les objets loués
      const { data: rentedObjects } = await supabase
        .from('objects')
        .select('id, title, status')
        .eq('status', 'rented');
      
      console.log(`✅ ${rentedObjects?.length || 0} objets loués`);
      
      // Test 3: Vérifier les réservations actives
      const { data: activeReservations } = await supabase
        .from('reservations')
        .select('id, object_id, status')
        .in('status', ['confirmed', 'ongoing']);
      
      console.log(`✅ ${activeReservations?.length || 0} réservations actives`);
      
      console.log('✅ Test terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
    }
  }
};
