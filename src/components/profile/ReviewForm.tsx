import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { CreateReviewInput } from '../../types';
import { reviewsService } from '../../services/reviews.service';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  reservationId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  objectTitle: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export const ReviewForm = ({ 
  reservationId, 
  reviewedUserId, 
  reviewedUserName, 
  objectTitle,
  onReviewSubmitted,
  onCancel 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewInput = {
        reservation_id: reservationId,
        reviewed_id: reviewedUserId,
        rating,
        comment: comment.trim() || undefined
      };

      await reviewsService.createReview(reviewData);
      toast.success('Avis envoyé avec succès !');
      
      // Reset form
      setRating(0);
      setComment('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Laisser un avis
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Avis pour <span className="font-medium">{reviewedUserName}</span>
        </p>
        <p className="text-sm text-gray-500">
          Objet : {objectTitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className={`transition-colors ${
                  star <= rating
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && 'Très déçu'}
              {rating === 2 && 'Déçu'}
              {rating === 3 && 'Correct'}
              {rating === 4 && 'Satisfait'}
              {rating === 5 && 'Très satisfait'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caractères
          </p>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};