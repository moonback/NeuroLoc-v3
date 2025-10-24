import { useState, useEffect } from 'react';
import { MapPin, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { profilesService } from '../../services/profiles.service';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';

export const AddressManager = () => {
  const { profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postal_code: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'France'
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      await profilesService.updateProfile(profile.id, formData);
      await refreshProfile();
      setIsEditing(false);
      toast.success('Adresse mise à jour avec succès !');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Erreur lors de la mise à jour de l\'adresse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'France'
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasAddress = profile?.address && profile?.city && profile?.postal_code;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-brand-600" />
            </div>
            <h3 className="text-heading text-lg font-semibold">Adresse de retrait</h3>
          </div>
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasAddress && !isEditing && (
          <Card className="mb-6 border-warning-200 bg-warning-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-warning-600 flex-shrink-0" />
                <div>
                  <p className="text-warning-800 font-medium">Adresse requise</p>
                  <p className="text-warning-700 text-sm">
                    Vous devez configurer votre adresse pour pouvoir créer des handovers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Adresse *
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Numéro et nom de rue"
                leftIcon={MapPin}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ville *
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ville"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Code postal *
                </label>
                <Input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="75001"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Pays
              </label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="France"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading || !formData.address || !formData.city || !formData.postal_code}
                variant="primary"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={isLoading}
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              
              <Button
                onClick={handleCancel}
                variant="ghost"
                leftIcon={<X className="h-4 w-4" />}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hasAddress ? (
              <Card className="bg-neutral-50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-heading font-medium">{formData.address}</p>
                    <p className="text-body">
                      {formData.postal_code} {formData.city}
                    </p>
                    {formData.country && (
                      <p className="text-muted text-sm">{formData.country}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">
                    Aucune adresse configurée
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Configurez votre adresse pour pouvoir créer des handovers
                  </p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Ajouter une adresse
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
