import { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Calendar, Euro, User, CheckCircle } from 'lucide-react';
import { Reservation, Review } from '../../types';
import { reviewsService } from '../../services/reviews.service';
import { supabase } from '../../services/supabase';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
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
      <Card>
        <CardHeader>
          <h3 className="text-heading text-lg font-semibold">
            Locations terminées
          </h3>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500">
            Aucune location terminée pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-heading text-lg font-semibold">
          Locations terminées ({completedReservations.length})
        </h3>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {completedReservations.map((reservation) => {
            const otherUser = getOtherUser(reservation);
            const userToReview = getUserToReview(reservation);
            const hasReviewed = hasUserReviewed(reservation.id, user?.id || '');
            
            return (
              <Card key={reservation.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-heading font-semibold text-lg mb-2">
                        {reservation.object?.title}
                      </h4>
                      
                      <div className="text-sm text-neutral-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <span>
                            {isOwner ? 'Locataire' : 'Propriétaire'} : 
                            <span className="font-medium ml-1">
                              {userToReview?.full_name}
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span>
                            Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium">{reservation.total_price}€</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terminée
                      </Badge>

                      {/* Bouton d'avis */}
                      {!hasReviewed && userToReview && (
                        <Button
                          onClick={() => setShowReviewForm(reservation.id)}
                          variant="primary"
                          size="sm"
                          leftIcon={<Star className="h-4 w-4" />}
                        >
                          Laisser un avis
                        </Button>
                      )}

                      {hasReviewed && (
                        <div className="flex items-center gap-1 text-success-600 text-sm">
                          <Star className="h-4 w-4" />
                          <span>Avis donné</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formulaire d'avis */}
                  {showReviewForm === reservation.id && userToReview && (
                    <div className="mt-4 border-t border-neutral-200 pt-4">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
