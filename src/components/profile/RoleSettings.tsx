import { useState } from 'react';
import { UserRole } from '../../types';
import { useRole } from '../../hooks/useRole';
import { authService } from '../../services/auth.service';
import { RoleSelector } from '../common/RoleSelector';
import { Button } from '../common/Button';
import { Settings, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleSettingsProps {
  className?: string;
}

export const RoleSettings = ({ className = '' }: RoleSettingsProps) => {
  const { role, profile, getRoleDisplayName, getRoleColor } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role || 'client');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleRoleChange = async () => {
    if (!profile?.id || selectedRole === role) return;

    setIsLoading(true);
    try {
      await authService.updateRole(profile.id, selectedRole);
      toast.success(`Rôle changé en ${getRoleDisplayName(selectedRole)}`);
      setShowRoleSelector(false);
      
      // Recharger la page pour mettre à jour le contexte
      window.location.reload();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors du changement de rôle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(role || 'client');
    setShowRoleSelector(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rôle utilisateur</h3>
          <p className="text-sm text-gray-600">
            Gérez votre rôle sur la plateforme
          </p>
        </div>
      </div>

      {!showRoleSelector ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Rôle actuel</p>
              <p className="text-sm text-gray-600">
                {role ? getRoleDisplayName(role) : 'Non défini'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role || 'client')}`}>
              {role ? getRoleDisplayName(role) : 'Non défini'}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Changer de rôle</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Vous pouvez changer votre rôle à tout moment. Cela affectera les fonctionnalités disponibles.
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Client :</strong> Réserver et louer des objets</li>
                  <li>• <strong>Loueur :</strong> Publier et louer vos objets</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowRoleSelector(true)}
            className="w-full"
            variant="outline"
          >
            Changer de rôle
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />

          <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRoleChange}
              isLoading={isLoading}
              disabled={selectedRole === role}
              className="flex-1"
            >
              {isLoading ? 'Changement...' : 'Confirmer'}
            </Button>
          </div>

          {selectedRole !== role && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Le changement de rôle prendra effet immédiatement après confirmation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
