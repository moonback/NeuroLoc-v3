import { Info, MapPin, User } from 'lucide-react';

interface ProfileLocationInfoProps {
  profileAddress?: string;
  className?: string;
}

export const ProfileLocationInfo = ({ 
  profileAddress, 
  className = '' 
}: ProfileLocationInfoProps) => {
  if (!profileAddress) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Adresse de votre profil
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              Pour publier des objets, vous devez d'abord renseigner votre adresse dans votre profil.
            </p>
            <div className="flex items-center text-xs text-blue-600">
              <User className="h-3 w-3 mr-1" />
              <span>Allez dans votre profil pour ajouter votre adresse</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-900 mb-1">
            Adresse utilisée par défaut
          </h4>
          <p className="text-sm text-green-700 mb-2">
            L'adresse de votre profil sera utilisée comme localisation par défaut pour vos objets.
          </p>
          <div className="text-xs text-green-600">
            <span className="font-medium">Adresse :</span> {profileAddress}
          </div>
        </div>
      </div>
    </div>
  );
};
