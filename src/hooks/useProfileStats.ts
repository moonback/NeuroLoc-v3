import { useState, useEffect } from 'react';
import { objectsService } from '../services/objects.service';
import { reservationsService } from '../services/reservations.service';
import { reviewsService } from '../services/reviews.service';

interface ProfileStats {
  totalObjects: number;
  totalReservations: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

export const useProfileStats = (userId?: string) => {
  const [stats, setStats] = useState<ProfileStats>({
    totalObjects: 0,
    totalReservations: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          objects,
          reservationsAsOwner,
          reservationsAsRenter,
          ratingStats
        ] = await Promise.all([
          objectsService.getObjectsByOwner(userId),
          reservationsService.getReservationsAsOwner(),
          reservationsService.getReservationsAsRenter(),
          reviewsService.getRatingStats(userId)
        ]);

        // Calculer les revenus totaux (réservations confirmées et terminées)
        const totalEarnings = reservationsAsOwner
          .filter(r => r.status === 'confirmed' || r.status === 'completed')
          .reduce((sum, r) => sum + r.total_price, 0);

        // Calculer le taux de réponse (simulation - dans une vraie app, 
        // vous auriez besoin de tracker les messages/réponses)
        const responseRate = Math.min(95, Math.max(60, Math.random() * 40 + 60));

        setStats({
          totalObjects: objects.length,
          totalReservations: reservationsAsRenter.length,
          totalEarnings,
          averageRating: ratingStats.average,
          responseRate: Math.round(responseRate)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refreshStats: () => {
      if (userId) {
        const fetchStats = async () => {
          try {
            setLoading(true);
            setError(null);

            const [
              objects,
              reservationsAsOwner,
              reservationsAsRenter,
              ratingStats
            ] = await Promise.all([
              objectsService.getObjectsByOwner(userId),
              reservationsService.getReservationsAsOwner(),
              reservationsService.getReservationsAsRenter(),
              reviewsService.getRatingStats(userId)
            ]);

            const totalEarnings = reservationsAsOwner
              .filter(r => r.status === 'confirmed' || r.status === 'completed')
              .reduce((sum, r) => sum + r.total_price, 0);

            const responseRate = Math.min(95, Math.max(60, Math.random() * 40 + 60));

            setStats({
              totalObjects: objects.length,
              totalReservations: reservationsAsRenter.length,
              totalEarnings,
              averageRating: ratingStats.average,
              responseRate: Math.round(responseRate)
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
          } finally {
            setLoading(false);
          }
        };
        fetchStats();
      }
    }
  };
};
