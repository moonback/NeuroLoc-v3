import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useProfileStats } from '../hooks/useProfileStats';
import { reviewsService } from '../services/reviews.service';
import { Avatar } from '../components/common/Avatar';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ReviewsList } from '../components/profile/ReviewsList';
import { Loader } from '../components/common/Loader';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { User, Calendar, MapPin, Mail, Phone, Star, Package } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-neutral-600">Chargement du profil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-heading text-2xl font-bold mb-2">
              Profil non trouvé
            </h2>
            <p className="text-body">
              L'utilisateur que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header du profil */}
        <Card className="shadow-large mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name || 'Utilisateur'}
                size="xl"
                name={profile.full_name}
              />
              <div className="flex-1">
                <h1 className="text-heading text-3xl font-bold mb-2">
                  {profile.full_name || 'Utilisateur'}
                </h1>
                <div className="flex items-center text-body mb-4">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                  <span>Membre depuis {formatDate(profile.created_at)}</span>
                </div>
                
                {profile.bio && (
                  <p className="text-body mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-body">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        {!statsLoading && (
          <div className="mb-8">
            <ProfileStats stats={stats} />
          </div>
        )}

        {/* Avis et évaluations */}
        <Card className="shadow-large mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-brand-600" />
              </div>
              <h2 className="text-heading text-xl font-semibold">
                Avis et évaluations
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="md" />
              </div>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Objets récents */}
          <Card className="shadow-large">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-success-600" />
                </div>
                <h3 className="text-heading text-lg font-semibold">
                  Objets disponibles
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-body">
                  {stats.totalObjects} objet{stats.totalObjects > 1 ? 's' : ''} disponible{stats.totalObjects > 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card className="shadow-large">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <h3 className="text-heading text-lg font-semibold">
                  Informations de contact
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-neutral-400 mr-3" />
                  <span className="text-body">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-neutral-400 mr-3" />
                    <span className="text-body">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-neutral-400 mr-3" />
                  <span className="text-body">
                    Membre depuis {formatDate(profile.created_at)}
                  </span>
                </div>
                {stats.averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-3" />
                    <span className="text-body">
                      Note moyenne: {stats.averageRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
