import { useState, useEffect } from 'react';
import { MapPin, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { profilesService } from '../../services/profiles.service';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Adresse de retrait</h3>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm">Modifier</span>
          </button>
        )}
      </div>

      {!hasAddress && !isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Adresse requise</p>
              <p className="text-yellow-700 text-sm">
                Vous devez configurer votre adresse pour pouvoir créer des handovers
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Numéro et nom de rue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Ville"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal *
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="75001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="France"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading || !formData.address || !formData.city || !formData.postal_code}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
            
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <X className="h-4 w-4" />
              <span>Annuler</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {hasAddress ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-1">
                <p className="font-medium">{formData.address}</p>
                <p className="text-gray-600">
                  {formData.postal_code} {formData.city}
                </p>
                {formData.country && (
                  <p className="text-gray-500 text-sm">{formData.country}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aucune adresse configurée</p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Ajouter une adresse
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
