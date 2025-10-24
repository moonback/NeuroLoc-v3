import { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, QrCode, Clock, CheckCircle, ScanLine, XCircle } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CreateHandoverForm } from './CreateHandoverForm';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Loader } from '../common/Loader';
import toast from 'react-hot-toast';

interface HandoversManagerProps {
  reservationId: string;
  isOwner?: boolean;
}

export const HandoversManager = ({ reservationId, isOwner = false }: HandoversManagerProps) => {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHandovers();
  }, [reservationId]);

  const loadHandovers = async () => {
    try {
      const data = await handoversService.getHandoversByReservation(reservationId);
      setHandovers(data);
    } catch (error) {
      console.error('Error loading handovers:', error);
      toast.error('Erreur lors du chargement des handovers');
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status: HandoverStatus) => {
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
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <QrCode className="h-4 w-4 text-brand-600" />
          </div>
          <h2 className="text-heading text-xl font-semibold">Gestion des Handovers</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.open('/qr-scanner', '_blank')}
            variant="secondary"
            leftIcon={<ScanLine className="h-4 w-4" />}
          >
            Scanner QR Code
          </Button>
          <CreateHandoverForm 
            reservationId={reservationId} 
            onHandoverCreated={loadHandovers}
          />
        </div>
      </div>

      {/* Liste des handovers */}
      {handovers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <QrCode className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">Aucun handover</h3>
            <p className="text-neutral-500 mb-6">Aucun handover créé pour cette réservation</p>
            <CreateHandoverForm 
              reservationId={reservationId} 
              onHandoverCreated={loadHandovers}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {handovers.map((handover) => (
            <Card key={handover.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-brand-600" />
                    </div>
                    <h3 className="text-heading font-semibold">
                      {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                    </h3>
                  </div>
                  {getStatusBadge(handover.status)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-body text-sm">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span>{handover.pickup_address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-body text-sm">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span>
                      Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {handover.actual_date && (
                    <div className="flex items-center gap-3 text-body text-sm">
                      <CheckCircle className="h-4 w-4 text-success-500" />
                      <span>
                        Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* QR Code - Seulement pour les locataires et si pas encore utilisé */}
                {!isOwner && handover.status === 'pending' && (
                  <Card className="bg-neutral-100">
                    <CardContent className="p-4 text-center">
                      <QrCode className="h-16 w-16 text-neutral-400 mx-auto mb-2" />
                      <p className="text-xs text-neutral-500 font-mono break-all">
                        {handover.qr_code}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Message QR Code utilisé */}
                {!isOwner && handover.status !== 'pending' && (
                  <Card className="border-success-200 bg-success-50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-2" />
                      <p className="text-sm text-success-700 font-medium">
                        QR Code utilisé - {handover.status === 'picked_up' ? 'Objet récupéré' : 'Objet restitué'}
                      </p>
                      <p className="text-xs text-success-600 mt-1">
                        Scanné le {handover.actual_date ? new Date(handover.actual_date).toLocaleDateString('fr-FR') : 'récemment'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions QR Code */}
                {handover.status === 'pending' && (
                  <Card className="border-warning-200 bg-warning-50">
                    <CardContent className="p-3">
                      <p className="text-sm text-warning-800">
                        <strong>Instructions :</strong> Présentez le QR code au propriétaire/locataire. Le scan QR code validera automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'}.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {handover.status === 'picked_up' && handover.type === 'pickup' && (
                  <Card className="border-brand-200 bg-brand-50">
                    <CardContent className="p-3">
                      <p className="text-sm text-brand-800">
                        <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour valider automatiquement la restitution de l'objet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
