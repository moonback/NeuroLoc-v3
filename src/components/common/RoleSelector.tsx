import { useState } from 'react';
import { UserRole } from '../../types';
import { User, Store, Settings } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const RoleSelector = ({ selectedRole, onRoleChange, className = '' }: RoleSelectorProps) => {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const roles: Array<{
    value: UserRole;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = [
    {
      value: 'client',
      label: 'Client',
      description: 'Je veux louer des objets',
      icon: <User className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      value: 'loueur',
      label: 'Loueur',
      description: 'Je veux louer mes objets',
      icon: <Store className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choisissez votre rôle
        </h3>
        <p className="text-sm text-gray-600">
          Vous pourrez modifier ce choix plus tard dans vos paramètres
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          const isHovered = hoveredRole === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleChange(role.value)}
              onMouseEnter={() => setHoveredRole(role.value)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? `${role.bgColor} border-current ring-2 ring-current ring-opacity-50` 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
                ${isHovered && !isSelected ? 'shadow-md transform scale-105' : ''}
                ${isSelected ? 'shadow-lg' : 'hover:shadow-md'}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`${role.color} ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                  {role.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${isSelected ? role.color : 'text-gray-900'}`}>
                    {role.label}
                  </h4>
                  <p className={`text-sm mt-1 ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                    {role.description}
                  </p>
                </div>

                {isSelected && (
                  <div className={`${role.color} text-lg`}>
                    ✓
                  </div>
                )}
              </div>

              {/* Indicateur de sélection */}
              {isSelected && (
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${role.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">💡 Bon à savoir</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Client :</strong> Vous pouvez réserver et louer des objets</li>
          <li>• <strong>Loueur :</strong> Vous pouvez publier et louer vos objets</li>
          <li>• Vous pouvez changer de rôle à tout moment</li>
          <li>• Certaines fonctionnalités peuvent nécessiter une vérification</li>
        </ul>
      </div>
    </div>
  );
};
