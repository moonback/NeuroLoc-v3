import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, Calendar, Download, Share2, Eye, EyeOff } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { QRCodeGenerator } from '../common/QRCodeGenerator';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import toast from 'react-hot-toast';

interface HandoverCardProps {
  handover: Handover;
  isOwner?: boolean;
}

export const HandoverCard = ({ handover, isOwner = false }: HandoverCardProps) => {
  const [showQRCode, setShowQRCode] = useState(false);

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

  const handleDownloadQRCode = () => {
    const canvas = document.querySelector(`canvas[data-handover-id="${handover.id}"]`);
    if (canvas) {
      const link = document.createElement('a');
      link.download = `handover-${handover.id}-qr.png`;
      link.href = (canvas as HTMLCanvasElement).toDataURL();
      link.click();
      toast.success('QR Code téléchargé !');
    }
  };

  const handleShareQRCode = async () => {
    if (navigator.share) {
      try {
        const canvas = document.querySelector(`canvas[data-handover-id="${handover.id}"]`);
        if (canvas) {
          const blob = await new Promise<Blob | null>((resolve) => (canvas as HTMLCanvasElement).toBlob(resolve));
          if (blob) {
            await navigator.share({
              title: `QR Code Handover - ${handover.type === 'pickup' ? 'Retrait' : 'Restitution'}`,
              text: `QR Code pour le ${handover.type === 'pickup' ? 'retrait' : 'restitution'} de ${handover.reservation?.object?.title}`,
              files: [new File([blob], `handover-${handover.id}-qr.png`, { type: 'image/png' })]
            });
          }
        }
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Erreur lors du partage');
      }
    } else {
      toast.error('Le partage n\'est pas supporté sur cet appareil');
    }
  };


  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              handover.type === 'pickup' ? 'bg-brand-100' : 'bg-success-100'
            }`}>
              <MapPin className={`h-5 w-5 ${
                handover.type === 'pickup' ? 'text-brand-600' : 'text-success-600'
              }`} />
            </div>
            <div>
              <h3 className="text-heading text-lg font-semibold">
                {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
              </h3>
              <p className="text-body text-sm">{handover.reservation?.object?.title}</p>
            </div>
          </div>
          {getStatusBadge(handover.status)}
        </div>

        {/* Informations */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-body">
            <MapPin className="h-4 w-4 text-neutral-500" />
            <span className="text-sm">{handover.pickup_address}</span>
          </div>
          
          <div className="flex items-center gap-3 text-body">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <span className="text-sm">
              Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {handover.actual_date && (
            <div className="flex items-center gap-3 text-body">
              <CheckCircle className="h-4 w-4 text-success-500" />
              <span className="text-sm">
                Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>

        {/* QR Code - Seulement pour les locataires et si pas encore utilisé */}
        {!isOwner && handover.status === 'pending' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-heading font-medium">QR Code</h4>
              <Button
                onClick={() => setShowQRCode(!showQRCode)}
                variant="ghost"
                size="sm"
                leftIcon={showQRCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              >
                {showQRCode ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
            
            {showQRCode ? (
              <Card className="bg-neutral-50">
                <CardContent className="p-4 text-center">
                  <QRCodeGenerator 
                    value={handover.qr_code} 
                    size={150}
                    className="mb-4"
                    dataHandoverId={handover.id}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleDownloadQRCode}
                      variant="primary"
                      size="sm"
                      leftIcon={<Download className="h-3 w-3" />}
                    >
                      Télécharger
                    </Button>
                    <Button
                      onClick={handleShareQRCode}
                      variant="secondary"
                      size="sm"
                      leftIcon={<Share2 className="h-3 w-3" />}
                    >
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-neutral-100">
                <CardContent className="p-4 text-center">
                  <QrCode className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">QR Code masqué</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Message QR Code utilisé */}
        {!isOwner && handover.status !== 'pending' && (
          <Card className="mb-6 border-success-200 bg-success-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-2" />
              <p className="text-sm text-success-700 font-medium">
                QR Code utilisé - {handover.status === 'picked_up' ? 'Objet récupéré' : 'Objet restitué'}
              </p>
              <p className="text-xs text-success-600 mt-1">
                Le QR code a été scanné avec succès le {handover.actual_date ? new Date(handover.actual_date).toLocaleDateString('fr-FR') : 'récemment'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {handover.status === 'pending' && (
          <Card className="border-warning-200 bg-warning-50">
            <CardContent className="p-4">
              <p className="text-sm text-warning-800">
                <strong>Instructions :</strong> Présentez le QR code au propriétaire/locataire. Le scan QR code validera automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'}.
              </p>
            </CardContent>
          </Card>
        )}

        {handover.status === 'picked_up' && handover.type === 'pickup' && (
          <Card className="border-brand-200 bg-brand-50">
            <CardContent className="p-4">
              <p className="text-sm text-brand-800">
                <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour valider automatiquement la restitution de l'objet.
              </p>
            </CardContent>
          </Card>
        )}

        {handover.notes && (
          <Card className="mt-4 bg-neutral-50">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-600">
                <strong>Notes :</strong> {handover.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
