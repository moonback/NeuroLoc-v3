import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '../common/Button';
import { reviewsService } from '../../services/reviews.service';
import { CreateReviewInput } from '../../types';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  reservationId: string;
  reviewedUserId: string;
  objectTitle: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
  className?: string;
}

export const ReviewForm = ({
  reservationId,
  reviewedUserId,
  objectTitle,
  onReviewSubmitted,
  onCancel,
  className = ''
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

    if (comment.trim().length < 10) {
      toast.error('Veuillez écrire au moins 10 caractères pour votre commentaire');
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewData: CreateReviewInput = {
        reservation_id: reservationId,
        reviewed_id: reviewedUserId,
        rating,
        comment: comment.trim()
      };

      await reviewsService.createReview(reviewData);
      toast.success('Avis publié avec succès');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erreur lors de la publication de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className={`transition-colors ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400`}
      >
        <Star
          className={`h-8 w-8 ${
            i < rating ? 'fill-current' : ''
          }`}
        />
      </button>
    ));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border ${className}`}>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Laisser un avis
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Avis pour: <span className="font-medium">{objectTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Note *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 && `${rating}/5`}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec cet objet..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum 10 caractères ({comment.length}/10)
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={rating === 0 || comment.trim().length < 10}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Publier l'avis</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
