import { Star, Calendar, User } from 'lucide-react';
import { Avatar } from '../common/Avatar';
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
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Avatar
          src={review.reviewer?.avatar_url}
          alt={review.reviewer?.full_name || 'Utilisateur'}
          size="md"
          fallback={review.reviewer?.full_name}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.reviewer?.full_name || 'Utilisateur anonyme'}
              </h4>
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600 ml-2">
                  {review.rating}/5
                </span>
              </div>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(review.created_at)}
            </div>
          </div>
          
          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.comment}
            </p>
          )}
          
          {review.reservation?.object && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Avis pour: <span className="font-medium">{review.reservation.object.title}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ReviewsListProps {
  reviews: Review[];
  className?: string;
}

export const ReviewsList = ({ reviews, className = '' }: ReviewsListProps) => {
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun avis pour le moment
        </h3>
        <p className="text-gray-600">
          Les avis apparaîtront ici une fois que vous aurez des réservations terminées.
        </p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  );

  return (
    <div className={className}>
      {/* Résumé des avis */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Avis et évaluations
          </h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Basé sur {reviews.length} avis
            </p>
          </div>
        </div>

        {/* Répartition des notes */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = ratingCounts[index];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-8">
                  {rating}★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
