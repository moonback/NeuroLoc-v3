import { Package, Calendar, Star, Euro, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../common/Card';

interface ProfileStatsProps {
  stats: {
    totalObjects?: number;
    totalReservations?: number;
    averageRating?: number;
    totalEarnings?: number;
    responseRate?: number;
  };
  className?: string;
}

export const ProfileStats = ({ stats, className = '' }: ProfileStatsProps) => {
  const statItems = [
    {
      icon: Package,
      label: 'Objets publiés',
      value: stats.totalObjects || 0,
      color: 'text-brand-600',
      bgColor: 'bg-brand-100'
    },
    {
      icon: Calendar,
      label: 'Réservations',
      value: stats.totalReservations || 0,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Euro,
      label: 'Revenus totaux',
      value: `${stats.totalEarnings || 0}€`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: TrendingUp,
      label: 'Taux de réponse',
      value: `${stats.responseRate || 0}%`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <Card key={index} className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className={`${item.bgColor} rounded-full p-3 mr-3`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-sm text-body">
                  {item.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
