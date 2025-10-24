import { useRole } from '../../hooks/useRole';
import { RoleBadge } from '../common/RoleBadge';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { User, Store, TrendingUp, CheckCircle } from 'lucide-react';

interface RoleStatsProps {
  className?: string;
}

export const RoleStats = ({ className = '' }: RoleStatsProps) => {
  const { role, isVerified } = useRole();

  const getRoleStats = () => {
    switch (role) {
      case 'client':
        return {
          title: 'Statistiques Client',
          icon: <User className="h-6 w-6 text-brand-600" />,
          stats: [
            { label: 'Réservations actives', value: '0', variant: 'brand' as const },
            { label: 'Objets loués', value: '0', variant: 'success' as const },
            { label: 'Avis reçus', value: '0', variant: 'warning' as const }
          ],
          bgColor: 'bg-brand-50',
          borderColor: 'border-brand-200'
        };
      case 'loueur':
        return {
          title: 'Statistiques Loueur',
          icon: <Store className="h-6 w-6 text-success-600" />,
          stats: [
            { label: 'Objets publiés', value: '0', variant: 'success' as const },
            { label: 'Réservations reçues', value: '0', variant: 'brand' as const },
            { label: 'Revenus générés', value: '0€', variant: 'default' as const }
          ],
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200'
        };
      case 'admin':
        return {
          title: 'Statistiques Administrateur',
          icon: <TrendingUp className="h-6 w-6 text-brand-600" />,
          stats: [
            { label: 'Utilisateurs actifs', value: '0', variant: 'brand' as const },
            { label: 'Objets publiés', value: '0', variant: 'success' as const },
            { label: 'Réservations totales', value: '0', variant: 'default' as const }
          ],
          bgColor: 'bg-brand-50',
          borderColor: 'border-brand-200'
        };
      default:
        return {
          title: 'Statistiques',
          icon: <User className="h-6 w-6 text-neutral-600" />,
          stats: [],
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200'
        };
    }
  };

  const roleStats = getRoleStats();

  return (
    <Card className={`${roleStats.bgColor} ${roleStats.borderColor} border-2 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-soft">
              {roleStats.icon}
            </div>
            <div>
              <h3 className="text-heading text-xl font-semibold">{roleStats.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={role || 'client'} size="sm" />
                {isVerified && (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {roleStats.stats.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleStats.stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-soft border border-neutral-200">
                <div className="text-2xl font-bold text-neutral-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-neutral-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
