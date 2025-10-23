import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Profile } from '../../types';
import { Calendar, MapPin, Star } from 'lucide-react';

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
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Avatar
          src={profile.avatar_url}
          alt={profile.full_name || 'Utilisateur'}
          size="lg"
          fallback={profile.full_name}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.full_name || 'Utilisateur'}
          </h3>
          <p className="text-gray-600 text-sm">{profile.email}</p>
          {profile.phone && (
            <p className="text-gray-500 text-sm">{profile.phone}</p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {profile.bio}
        </p>
      )}

      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Calendar className="h-4 w-4 mr-2" />
        <span>Membre depuis {formatDate(profile.created_at)}</span>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">4.8</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          to={`/profile/${profile.id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Voir le profil complet →
        </Link>
      </div>
    </div>
  );
};
