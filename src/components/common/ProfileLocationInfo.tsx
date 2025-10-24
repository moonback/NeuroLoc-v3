import { Info, MapPin, User } from 'lucide-react';
import { Card, CardContent } from './Card';

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
      <Card className={`border-brand-200 bg-brand-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-brand-900 mb-1">
                Adresse de votre profil
              </h4>
              <p className="text-sm text-brand-700 mb-2">
                Pour publier des objets, vous devez d'abord renseigner votre adresse dans votre profil.
              </p>
              <div className="flex items-center text-xs text-brand-600">
                <User className="h-3 w-3 mr-1" />
                <span>Allez dans votre profil pour ajouter votre adresse</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-success-200 bg-success-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-success-900 mb-1">
              Adresse utilisée par défaut
            </h4>
            <p className="text-sm text-success-700 mb-2">
              L'adresse de votre profil sera utilisée comme localisation par défaut pour vos objets.
            </p>
            <div className="text-xs text-success-600">
              <span className="font-medium">Adresse :</span> {profileAddress}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
