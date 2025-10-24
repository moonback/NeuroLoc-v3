import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QrCode, MapPin, Calendar, Clock, CheckCircle, Eye, X } from 'lucide-react';
import { Handover } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Loader } from '../common/Loader';

interface ReservationHandoversProps {
  reservationId: string;
  isOwner: boolean;
}

export const ReservationHandovers = ({ reservationId, isOwner }: ReservationHandoversProps) => {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);

  useEffect(() => {
    loadHandovers();
  }, [reservationId]);

  const loadHandovers = async () => {
    try {
      const data = await handoversService.getHandoversByReservation(reservationId);
      setHandovers(data);
    } catch (error) {
      console.error('Error loading handovers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      picked_up: 'brand' as const,
      returned: 'success' as const,
      cancelled: 'danger' as const
    };

    const labels = {
      pending: 'En attente',
      picked_up: 'Récupéré',
      returned: 'Restitué',
      cancelled: 'Annulé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (handovers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-neutral-600" />
            <h3 className="text-heading font-semibold">Handovers</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-500">Aucun handover créé</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-neutral-600" />
          <h3 className="text-heading font-semibold">Handovers ({handovers.length})</h3>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {handovers.map((handover) => (
            <Card key={handover.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-heading font-medium text-sm">
                      {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                    </span>
                  </div>
                  {getStatusBadge(handover.status)}
                </div>

                <div className="space-y-2 text-sm text-body mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{handover.pickup_address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {handover.actual_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>
                        Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {!isOwner && handover.status === 'pending' && (
                    <Card className="bg-neutral-100">
                      <CardContent className="p-2">
                        <p className="text-xs text-neutral-500 font-mono">
                          {handover.qr_code.substring(0, 20)}...
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!isOwner && handover.status !== 'pending' && (
                    <Card className="border-success-200 bg-success-50">
                      <CardContent className="p-2">
                        <p className="text-xs text-success-600 font-medium">
                          QR utilisé - {handover.status === 'picked_up' ? 'Récupéré' : 'Restitué'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Button
                    onClick={() => setSelectedHandover(handover)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Modal pour afficher les détails */}
      {selectedHandover && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto shadow-large">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-heading text-lg font-semibold">Détails du Handover</h3>
                <Button
                  onClick={() => setSelectedHandover(null)}
                  variant="ghost"
                  size="sm"
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <QRCodeDisplay 
                handover={selectedHandover}
                isOwner={isOwner}
              />
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </Card>
  );
};
