import { useRole } from '../../hooks/useRole';
import { RoleBadge } from '../common/RoleBadge';
import { User, Store, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface RoleStatsProps {
  className?: string;
}

export const RoleStats = ({ className = '' }: RoleStatsProps) => {
  const { role, isVerified, getRoleDisplayName, getRoleIcon } = useRole();

  const getRoleStats = () => {
    switch (role) {
      case 'client':
        return {
          title: 'Statistiques Client',
          icon: <User className="h-8 w-8 text-blue-600" />,
          stats: [
            { label: 'Réservations actives', value: '0', color: 'text-blue-600' },
            { label: 'Objets loués', value: '0', color: 'text-green-600' },
            { label: 'Avis reçus', value: '0', color: 'text-yellow-600' }
          ],
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'loueur':
        return {
          title: 'Statistiques Loueur',
          icon: <Store className="h-8 w-8 text-green-600" />,
          stats: [
            { label: 'Objets publiés', value: '0', color: 'text-green-600' },
            { label: 'Réservations reçues', value: '0', color: 'text-blue-600' },
            { label: 'Revenus générés', value: '0€', color: 'text-purple-600' }
          ],
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'admin':
        return {
          title: 'Statistiques Administrateur',
          icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
          stats: [
            { label: 'Utilisateurs actifs', value: '0', color: 'text-purple-600' },
            { label: 'Objets publiés', value: '0', color: 'text-green-600' },
            { label: 'Réservations totales', value: '0', color: 'text-blue-600' }
          ],
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          title: 'Statistiques',
          icon: <User className="h-8 w-8 text-gray-600" />,
          stats: [],
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const roleStats = getRoleStats();

  return (
    <div className={`${roleStats.bgColor} ${roleStats.borderColor} border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            {roleStats.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{roleStats.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <RoleBadge role={role || 'client'} size="sm" />
              {isVerified && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Vérifié</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {roleStats.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleStats.stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className={`text-sm font-medium ${stat.color}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isVerified && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Compte non vérifié :</strong> Certaines fonctionnalités peuvent être limitées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
