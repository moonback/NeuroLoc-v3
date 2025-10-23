import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { Profile } from '../types';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userProfile = await authService.getProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await authService.updateProfile(userId, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const avatarUrl = await authService.uploadAvatar(userId, file);
      if (profile) {
        setProfile({ ...profile, avatar_url: avatarUrl });
      }
      return avatarUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement de l\'avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile: () => {
      if (userId) {
        const fetchProfile = async () => {
          try {
            setLoading(true);
            setError(null);
            const userProfile = await authService.getProfile(userId);
            setProfile(userProfile);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
            setProfile(null);
          } finally {
            setLoading(false);
          }
        };
        fetchProfile();
      }
    }
  };
};
