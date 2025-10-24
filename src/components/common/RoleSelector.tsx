import { useState } from 'react';
import { UserRole } from '../../types';
import { User, Store, Settings } from 'lucide-react';
import { Card, CardContent } from './Card';

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
    borderColor: string;
  }> = [
    {
      value: 'client',
      label: 'Client',
      description: 'Je veux louer des objets',
      icon: <User className="h-6 w-6" />,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200'
    },
    {
      value: 'loueur',
      label: 'Loueur',
      description: 'Je veux louer mes objets',
      icon: <Store className="h-6 w-6" />,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-heading text-lg font-semibold mb-2">
          Choisissez votre rôle
        </h3>
        <p className="text-body text-sm">
          Vous pourrez modifier ce choix plus tard dans vos paramètres
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          const isHovered = hoveredRole === role.value;
          
          return (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? `${role.bgColor} border-2 ${role.borderColor} shadow-medium` 
                  : 'hover:shadow-medium hover:-translate-y-1'
              }`}
              onClick={() => onRoleChange(role.value)}
              onMouseEnter={() => setHoveredRole(role.value)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    isSelected ? role.bgColor : 'bg-neutral-100'
                  }`}>
                    <div className={isSelected ? role.color : 'text-neutral-600'}>
                      {role.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg mb-1 ${
                      isSelected ? role.color : 'text-neutral-900'
                    }`}>
                      {role.label}
                    </h4>
                    <p className={`text-sm ${
                      isSelected ? 'text-neutral-700' : 'text-neutral-600'
                    }`}>
                      {role.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className={`w-6 h-6 rounded-full ${role.bgColor} flex items-center justify-center`}>
                      <div className={`w-3 h-3 rounded-full ${role.color.replace('text-', 'bg-')}`} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <Card className="bg-neutral-50">
        <CardContent className="p-4">
          <h4 className="text-heading font-medium mb-2">💡 Bon à savoir</h4>
          <ul className="text-body text-sm space-y-1">
            <li>• <strong>Client :</strong> Vous pouvez réserver et louer des objets</li>
            <li>• <strong>Loueur :</strong> Vous pouvez publier et louer vos objets</li>
            <li>• Vous pouvez changer de rôle à tout moment</li>
            <li>• Certaines fonctionnalités peuvent nécessiter une vérification</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
