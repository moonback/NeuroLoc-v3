import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Euro, MapPin, QrCode, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Reservation } from '../../types';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ReservationHandovers } from '../handovers/ReservationHandovers';

interface ReservationCardProps {
  reservation: Reservation;
  isOwner?: boolean;
  getStatusBadge: (status: string) => JSX.Element;
}

export const ReservationCard = ({ reservation, isOwner = false, getStatusBadge }: ReservationCardProps) => {
  const [showHandovers, setShowHandovers] = useState(false);
  
  // Déterminer si la réservation est terminée
  const isCompleted = reservation.status === 'completed';
  
  // Pour les réservations terminées, les handovers sont cachés par défaut
  const shouldShowHandovers = !isCompleted || showHandovers;
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-0">
        {/* Header avec image et infos principales */}
        <div className="flex">
          {/* Image de l'objet */}
          <div className="w-32 h-32 flex-shrink-0 relative">
            <img
              src={reservation.object?.images?.[0] || 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={reservation.object?.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay avec gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-heading text-lg font-semibold mb-2 line-clamp-1">
                  {reservation.object?.title}
                </h3>
                
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-body">
                      <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-sm">
                        Du {formatDate(reservation.start_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body">
                      <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-sm">
                        Au {formatDate(reservation.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-body">
                      <Euro className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatPrice(reservation.total_price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body">
                      <MapPin className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {reservation.object?.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badge de statut et actions */}
              <div className="flex flex-col items-end gap-3">
                {getStatusBadge(reservation.status)}
                <Link
                  to={`/objects/${reservation.object?.id}`}
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium hover:underline transition-colors duration-200"
                >
                  <ExternalLink className="h-3 w-3" />
                  Voir l'objet
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section Handovers */}
        <div className="border-t border-neutral-200 bg-neutral-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-brand-600" />
                </div>
                <h4 className="text-heading font-semibold">Handovers</h4>
              </div>
              
              {/* Bouton pour afficher/masquer les handovers (seulement pour les réservations terminées) */}
              {isCompleted && (
                <Button
                  onClick={() => setShowHandovers(!showHandovers)}
                  variant="ghost"
                  size="sm"
                  leftIcon={showHandovers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                >
                  {showHandovers ? 'Masquer' : 'Afficher'}
                </Button>
              )}
            </div>
            
            {/* Affichage conditionnel des handovers */}
            {shouldShowHandovers ? (
              <ReservationHandovers 
                reservationId={reservation.id} 
                isOwner={isOwner}
              />
            ) : isCompleted ? (
              <Card className="bg-neutral-100">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-neutral-500">
                    <EyeOff className="h-4 w-4" />
                    <span className="text-sm">Handovers masqués</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cliquez sur "Afficher" pour voir les détails
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
