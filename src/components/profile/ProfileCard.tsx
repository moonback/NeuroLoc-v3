import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { Profile } from '../../types';
import { Calendar, MapPin, Star, ExternalLink } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  showStats?: boolean;
  className?: string;
}

export const ProfileCard = ({ 
  profile, 
  showStats = false, 
  className = '' 
}: ProfileCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url}
            alt={profile.full_name || 'Utilisateur'}
            size="lg"
            name={profile.full_name}
          />
          <div className="flex-1">
            <h3 className="text-heading text-xl font-semibold">
              {profile.full_name || 'Utilisateur'}
            </h3>
            <p className="text-body text-sm">{profile.email}</p>
            {profile.phone && (
              <p className="text-muted text-sm">{profile.phone}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {profile.bio && (
          <p className="text-body text-sm mb-6 line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center text-muted text-sm mb-6">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Membre depuis {formatDate(profile.created_at)}</span>
        </div>

        {showStats && (
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 mb-2">4.8</div>
              <div className="text-sm text-neutral-600 mb-2">Note moyenne</div>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 mb-2">24</div>
              <div className="text-sm text-neutral-600">Locations</div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            to={`/profile/${profile.id}`}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors duration-200"
          >
            Voir le profil complet
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
