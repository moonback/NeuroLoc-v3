import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { CreateReviewInput } from '../../types';
import { reviewsService } from '../../services/reviews.service';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-lg font-semibold">
            Laisser un avis
          </h3>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <p className="text-body text-sm mb-2">
            Avis pour <span className="font-medium text-neutral-900">{reviewedUserName}</span>
          </p>
          <p className="text-muted text-sm">
            Objet : {objectTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Note *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className={`transition-colors duration-200 ${
                    star <= rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-neutral-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="h-7 w-7 fill-current" />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-neutral-600 mt-2">
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="input resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-neutral-500 mt-2">
              {comment.length}/500 caractères
            </p>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="ghost"
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              variant="primary"
              leftIcon={<Send className="h-4 w-4" />}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};