import { useAuth } from './useAuth';
import { UserRole } from '../types';

export const useRole = () => {
  const { profile } = useAuth();

  const isClient = profile?.role === 'client';
  const isLoueur = profile?.role === 'loueur';
  const isAdmin = profile?.role === 'admin';
  const isVerified = profile?.is_verified || false;

  const canCreateObjects = isLoueur || isAdmin;
  const canManageObjects = isLoueur || isAdmin;
  const canViewAnalytics = isLoueur || isAdmin;
  const canManageUsers = isAdmin;
  const canAccessAdminPanel = isAdmin;

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'client':
        return 'Client';
      case 'loueur':
        return 'Loueur';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'loueur':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole): string => {
    switch (role) {
      case 'client':
        return '👤';
      case 'loueur':
        return '🏪';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  return {
    // Rôles
    isClient,
    isLoueur,
    isAdmin,
    isVerified,
    
    // Permissions
    canCreateObjects,
    canManageObjects,
    canViewAnalytics,
    canManageUsers,
    canAccessAdminPanel,
    
    // Utilitaires
    getRoleDisplayName,
    getRoleColor,
    getRoleIcon,
    
    // Données brutes
    role: profile?.role,
    profile
  };
};
