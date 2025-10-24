import { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Calendar, Euro, User, CheckCircle } from 'lucide-react';
import { Reservation, Review } from '../../types';
import { reviewsService } from '../../services/reviews.service';
import { supabase } from '../../services/supabase';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface CompletedReservationsProps {
  reservations: Reservation[];
  isOwner: boolean; // true si c'est le propriétaire qui voit ses réservations reçues
}

export const CompletedReservations = ({ reservations, isOwner }: CompletedReservationsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtrer les réservations terminées avec useMemo pour éviter les recalculs
  const completedReservations = useMemo(() => 
    reservations.filter(r => r.status === 'completed'), 
    [reservations]
  );

  // Charger les avis avec useEffect directement
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les avis pour les réservations terminées en une seule requête
        const reservationIds = completedReservations.map(r => r.id);
        
        if (reservationIds.length === 0) {
          setReviews([]);
          return;
        }

        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(*),
            reviewed:profiles!reviews_reviewed_id_fkey(*),
            reservation:reservations(*, object:objects(*))
          `)
          .in('reservation_id', reservationIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
        toast.error('Erreur lors du chargement des avis');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [completedReservations]);

  const hasUserReviewed = (reservationId: string, reviewerId: string) => {
    return reviews.some(review => 
      review.reservation_id === reservationId && 
      review.reviewer_id === reviewerId
    );
  };

  const getOtherUser = (reservation: Reservation) => {
    return isOwner ? reservation.renter : reservation.owner;
  };

  const getUserToReview = (reservation: Reservation) => {
    return isOwner ? reservation.renter : reservation.owner;
  };

  if (completedReservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Locations terminées
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Aucune location terminée pour le moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Locations terminées ({completedReservations.length})
      </h3>
      
      <div className="space-y-4">
        {completedReservations.map((reservation) => {
          const otherUser = getOtherUser(reservation);
          const userToReview = getUserToReview(reservation);
          const hasReviewed = hasUserReviewed(reservation.id, user?.id || '');
          
          return (
            <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">
                    {reservation.object?.title}
                  </h4>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        {isOwner ? 'Locataire' : 'Propriétaire'} : 
                        <span className="font-medium ml-1">
                          {userToReview?.full_name}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Euro className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{reservation.total_price}€</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Terminée</span>
                  </div>

                  {/* Bouton d'avis */}
                  {!hasReviewed && userToReview && (
                    <button
                      onClick={() => setShowReviewForm(reservation.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                    >
                      <Star className="h-4 w-4" />
                      <span>Laisser un avis</span>
                    </button>
                  )}

                  {hasReviewed && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <Star className="h-4 w-4" />
                      <span>Avis donné</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulaire d'avis */}
              {showReviewForm === reservation.id && userToReview && (
                <div className="mt-4 border-t pt-4">
                  <ReviewForm
                    reservationId={reservation.id}
                    reviewedUserId={userToReview.id}
                    reviewedUserName={userToReview.full_name || 'Utilisateur'}
                    objectTitle={reservation.object?.title || 'Objet'}
                    onReviewSubmitted={() => {
                      setShowReviewForm(null);
                      // Recharger les avis en refaisant la requête
                      const reloadReviews = async () => {
                        try {
                          const reservationIds = completedReservations.map(r => r.id);
                          if (reservationIds.length === 0) return;

                          const { data, error } = await supabase
                            .from('reviews')
                            .select(`
                              *,
                              reviewer:profiles!reviews_reviewer_id_fkey(*),
                              reviewed:profiles!reviews_reviewed_id_fkey(*),
                              reservation:reservations(*, object:objects(*))
                            `)
                            .in('reservation_id', reservationIds)
                            .order('created_at', { ascending: false });

                          if (error) throw error;
                          setReviews(data || []);
                        } catch (error) {
                          console.error('Error reloading reviews:', error);
                        }
                      };
                      reloadReviews();
                    }}
                    onCancel={() => setShowReviewForm(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
