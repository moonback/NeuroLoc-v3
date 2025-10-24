import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { Profile as ProfileType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { User, Mail, Calendar, Camera, Save, Edit3, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddressAutocomplete } from '../components/common/AddressAutocomplete';
import { GeolocationButton, LocationDisplay } from '../components/common/GeolocationButton';
import { geolocationService } from '../services/geolocation.service';

export const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<Partial<ProfileType>>({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    latitude: null,
    longitude: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || '',
        latitude: profile.latitude,
        longitude: profile.longitude
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = async (selectedAddress: string, formattedAddress: string) => {
    try {
      setLoading(true);
      const geocodeResult = await geolocationService.geocodeAddress(formattedAddress);
      
      setFormData(prev => ({
        ...prev,
        address: geocodeResult.address,
        city: geocodeResult.city,
        postal_code: geocodeResult.postal_code,
        country: geocodeResult.country,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude
      }));
      
      toast.success('Adresse géocodée avec succès');
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Erreur lors du géocodage de l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationDetected = (address: string, city: string, postalCode: string, country: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      address,
      city,
      postal_code: postalCode,
      country,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    try {
      setLoading(true);
      const avatarUrl = await authService.uploadAvatar(user.id, file);
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erreur lors du téléchargement de la photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await authService.updateProfile(user.id, formData as Partial<ProfileType>);
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="shadow-large mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-neutral-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-700 transition">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-heading text-3xl font-bold mb-2">
                  {profile.full_name || 'Utilisateur'}
                </h1>
                <p className="text-body mb-4">{profile.email}</p>
                <div className="flex items-center text-sm text-muted">
                  <Calendar className="h-4 w-4 mr-2" />
                  Membre depuis {formatDate(profile.created_at)}
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    leftIcon={<Edit3 className="h-4 w-4" />}
                  >
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      isLoading={loading}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <Card className="shadow-large">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <h2 className="text-heading text-xl font-semibold">Informations personnelles</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  label="Nom complet"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <Input
                  label="Email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="bg-neutral-50"
                />
                <p className="mt-1 text-sm text-muted">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <Input
                  label="Téléphone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              {/* Section Géolocalisation */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-heading text-lg font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-brand-600" />
                    Localisation
                  </h3>
                  {isEditing && (
                    <GeolocationButton
                      onLocationFound={handleLocationDetected}
                      disabled={loading}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    {isEditing ? (
                      <AddressAutocomplete
                        value={formData.address || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                        onSelect={handleAddressSelect}
                        placeholder="Rechercher votre adresse..."
                        disabled={loading}
                      />
                    ) : (
                      <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                        {formData.address || 'Non renseignée'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Ville"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Votre ville"
                      />
                    </div>
                    <div>
                      <Input
                        label="Code postal"
                        name="postal_code"
                        value={formData.postal_code || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Code postal"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Pays"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Votre pays"
                    />
                  </div>

                  {/* Affichage des coordonnées */}
                  {formData.latitude && formData.longitude && (
                    <LocationDisplay
                      address={formData.address || undefined}
                      city={formData.city || undefined}
                      postalCode={formData.postal_code || undefined}
                      country={formData.country || undefined}
                      latitude={formData.latitude || undefined}
                      longitude={formData.longitude || undefined}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                  }`}
                />
              </div>
          </CardContent>
        </Card>

          {/* Sécurité */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
            </div>
            <div className="p-6">
              {!isChangingPassword ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Mot de passe
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Changez votre mot de passe pour sécuriser votre compte
                  </p>
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="secondary"
                  >
                    Changer le mot de passe
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Changer le mot de passe
                  </h3>
                  
                  <div className="relative">
                    <Input
                      label="Mot de passe actuel"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Nouveau mot de passe"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirmer le nouveau mot de passe"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setIsChangingPassword(false)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      isLoading={loading}
                      className="flex-1"
                    >
                      Mettre à jour
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Statistiques</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Profil</h3>
                <p className="text-sm text-gray-600">Complété à 100%</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Membre depuis</h3>
                <p className="text-sm text-gray-600">{formatDate(profile.created_at)}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email vérifié</h3>
                <p className="text-sm text-gray-600">
                  {user?.email_confirmed_at ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
