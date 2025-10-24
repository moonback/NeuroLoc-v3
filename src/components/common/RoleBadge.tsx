import { UserRole } from '../types';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoleBadge = ({ role, showIcon = true, size = 'md', className = '' }: RoleBadgeProps) => {
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
        return 'bg-brand-100 text-brand-800';
      case 'loueur':
        return 'bg-success-100 text-success-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
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

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-medium ${getRoleColor(role)} ${sizeClasses[size]} ${className}`}>
      {showIcon && <span>{getRoleIcon(role)}</span>}
      <span>{getRoleDisplayName(role)}</span>
    </span>
  );
};
