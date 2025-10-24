import { useState } from 'react';
import { UserRole } from '../../types';
import { useRole } from '../../hooks/useRole';
import { authService } from '../../services/auth.service';
import { RoleSelector } from '../common/RoleSelector';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader } from '../common/Card';
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
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-heading text-lg font-semibold">Rôle utilisateur</h3>
            <p className="text-body text-sm">Gérez votre rôle sur la plateforme</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!showRoleSelector ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="text-heading font-medium">Rôle actuel</p>
                <p className="text-body text-sm">
                  {role ? getRoleDisplayName(role) : 'Non défini'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role || 'client')}`}>
                {role ? getRoleDisplayName(role) : 'Non défini'}
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-heading font-medium mb-1">Changer de rôle</h4>
                  <p className="text-body text-sm mb-3">
                    Vous pouvez changer votre rôle à tout moment. Cela affectera les fonctionnalités disponibles.
                  </p>
                  <ul className="text-body text-sm space-y-1">
                    <li>• <strong>Client :</strong> Réserver et louer des objets</li>
                    <li>• <strong>Loueur :</strong> Publier et louer vos objets</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowRoleSelector(true)}
              className="w-full"
              variant="secondary"
              leftIcon={<Settings className="h-4 w-4" />}
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

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRoleChange}
                isLoading={isLoading}
                disabled={selectedRole === role}
                className="flex-1"
                variant="primary"
              >
                {isLoading ? 'Changement...' : 'Confirmer'}
              </Button>
            </div>

            {selectedRole !== role && (
              <div className="bg-success-50 border border-success-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                  <p className="text-success-800 text-sm">
                    Le changement de rôle prendra effet immédiatement après confirmation.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
