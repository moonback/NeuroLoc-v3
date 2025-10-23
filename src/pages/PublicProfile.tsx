import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useProfileStats } from '../hooks/useProfileStats';
import { reviewsService } from '../services/reviews.service';
import { Avatar } from '../components/common/Avatar';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ReviewsList } from '../components/profile/ReviewsList';
import { Loader } from '../components/common/Loader';
import { User, Calendar, MapPin, Mail, Phone, Star } from 'lucide-react';
import { Review } from '../types';
import toast from 'react-hot-toast';

export const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading: profileLoading, error: profileError } = useProfile(userId);
  const { stats, loading: statsLoading } = useProfileStats(userId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;

      try {
        setReviewsLoading(true);
        const userReviews = await reviewsService.getReviewsByUserId(userId);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Erreur lors du chargement des avis');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profil non trouvé
          </h2>
          <p className="text-gray-600">
            L'utilisateur que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header du profil */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name || 'Utilisateur'}
                size="xl"
                fallback={profile.full_name}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'Utilisateur'}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Membre depuis {formatDate(profile.created_at)}</span>
                </div>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {!statsLoading && (
          <div className="mb-8">
            <ProfileStats stats={stats} />
          </div>
        )}

        {/* Avis et évaluations */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Avis et évaluations
            </h2>
          </div>
          <div className="p-6">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="md" />
              </div>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Objets récents */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Objets disponibles
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {stats.totalObjects} objet{stats.totalObjects > 1 ? 's' : ''} disponible{stats.totalObjects > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Informations de contact
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    Membre depuis {formatDate(profile.created_at)}
                  </span>
                </div>
                {stats.averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-3" />
                    <span className="text-gray-700">
                      Note moyenne: {stats.averageRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
