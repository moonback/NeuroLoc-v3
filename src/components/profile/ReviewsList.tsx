import { Star, Calendar, User } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export const ReviewCard = ({ review, className = '' }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
        }`}
      />
    ));
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={review.reviewer?.avatar_url}
            alt={review.reviewer?.full_name || 'Utilisateur'}
            size="md"
            name={review.reviewer?.full_name}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-heading font-semibold">
                  {review.reviewer?.full_name || 'Utilisateur anonyme'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-neutral-600">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              <div className="flex items-center text-neutral-500 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(review.created_at)}
              </div>
            </div>
            
            {review.comment && (
              <p className="text-body text-sm leading-relaxed mb-4">
                {review.comment}
              </p>
            )}
            
            {review.reservation?.object && (
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Avis pour: <span className="font-medium text-neutral-700">{review.reservation.object.title}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ReviewsListProps {
  reviews: Review[];
  className?: string;
}

export const ReviewsList = ({ reviews, className = '' }: ReviewsListProps) => {
  if (reviews.length === 0) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <CardContent>
          <Star className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 mb-2">
            Aucun avis pour le moment
          </h3>
          <p className="text-neutral-500">
            Les avis apparaîtront ici une fois que vous aurez des réservations terminées.
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  );

  return (
    <div className={className}>
      {/* Résumé des avis */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-heading text-xl font-semibold">
              Avis et évaluations
            </h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-neutral-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                Basé sur {reviews.length} avis
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Répartition des notes */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingCounts[index];
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-700 w-8">
                    {rating}★
                  </span>
                  <div className="flex-1 bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
