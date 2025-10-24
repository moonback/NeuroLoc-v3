import { ReactNode } from 'react';
import { useRole } from '../../hooks/useRole';
import { UserRole } from '../../types';
import { AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireVerification?: boolean;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback,
  requireVerification = false 
}: RoleGuardProps) => {
  const { role, isVerified, getRoleDisplayName } = useRole();

  // Vérifier si l'utilisateur a le bon rôle
  const hasCorrectRole = role && allowedRoles.includes(role);
  
  // Vérifier si la vérification est requise
  const isVerificationRequired = requireVerification && !isVerified;

  if (!hasCorrectRole || isVerificationRequired) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-large">
          <CardContent className="p-8 text-center">
            <div className="bg-accent-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Lock className="h-8 w-8 text-accent-600" />
            </div>
            
            <h1 className="text-heading text-2xl font-bold mb-4">
              Accès restreint
            </h1>
            
            <div className="space-y-3 text-body">
              {!hasCorrectRole && (
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent-500" />
                  <p>
                    Cette fonctionnalité est réservée aux :{' '}
                    <span className="font-medium">
                      {allowedRoles.map(getRoleDisplayName).join(', ')}
                    </span>
                  </p>
                </div>
              )}
              
              {isVerificationRequired && (
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent-500" />
                  <p>
                    Votre compte doit être vérifié pour accéder à cette fonctionnalité.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-brand-50 rounded-xl">
              <p className="text-sm text-brand-800">
                <strong>Votre rôle actuel :</strong> {role ? getRoleDisplayName(role) : 'Non défini'}
              </p>
              {requireVerification && (
                <p className="text-sm text-brand-800 mt-1">
                  <strong>Statut de vérification :</strong> {isVerified ? 'Vérifié' : 'Non vérifié'}
                </p>
              )}
            </div>

            <div className="mt-6">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="primary"
                className="w-full"
              >
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Composants spécialisés pour chaque rôle
export const ClientOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['client']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const LoueurOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['loueur']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const LoueurOrAdmin = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['loueur', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);
