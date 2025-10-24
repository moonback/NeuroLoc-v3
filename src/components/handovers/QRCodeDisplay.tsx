import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, Calendar, Download, Share2 } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { QRCodeGenerator } from '../common/QRCodeGenerator';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  handover: Handover;
  isOwner?: boolean;
}

export const QRCodeDisplay = ({ handover, isOwner = false }: QRCodeDisplayProps) => {
  const [showQRCode, setShowQRCode] = useState(false);

  const handleDownloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `handover-${handover.id}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('QR Code téléchargé !');
    }
  };

  const handleShareQRCode = async () => {
    if (navigator.share) {
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
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


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-lg font-semibold">
            {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
          </h3>
          {getStatusBadge(handover.status)}
        </div>
      </CardHeader>

      <CardContent>
        {/* Informations de base */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{handover.pickup_address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {handover.actual_date && (
            <div className="flex items-center gap-2 text-neutral-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>

        {/* QR Code - Seulement pour les locataires et si pas encore utilisé */}
        {!isOwner && handover.status === 'pending' && (
          <div className="text-center mb-6">
            <Card className="bg-neutral-50 inline-block">
              <CardContent className="p-4">
                {showQRCode ? (
                  <div className="space-y-4">
                    <QRCodeGenerator 
                      value={handover.qr_code} 
                      size={200}
                      className="mb-2"
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-neutral-200 rounded-lg p-8">
                      <QrCode className="h-24 w-24 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">QR Code masqué</p>
                    </div>
                    <Button
                      onClick={() => setShowQRCode(true)}
                      variant="primary"
                      leftIcon={<QrCode className="h-4 w-4" />}
                    >
                      Afficher le QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message QR Code utilisé */}
        {!isOwner && handover.status !== 'pending' && (
          <div className="text-center mb-6">
            <Card className="border-success-200 bg-success-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-24 w-24 text-success-500 mx-auto mb-3" />
                <p className="text-lg text-success-700 font-medium mb-2">
                  QR Code utilisé - {handover.status === 'picked_up' ? 'Objet récupéré' : 'Objet restitué'}
                </p>
                <p className="text-sm text-success-600">
                  Le QR code a été scanné avec succès le {handover.actual_date ? new Date(handover.actual_date).toLocaleDateString('fr-FR') : 'récemment'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3">
          {handover.status === 'pending' && (
            <Card className="border-warning-200 bg-warning-50">
              <CardContent className="p-3">
                <p className="text-sm text-warning-800">
                  <strong>Instructions :</strong> Présentez ce QR code au propriétaire/locataire. Le scan QR code validera automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'}.
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

          {handover.notes && (
            <Card className="bg-neutral-50">
              <CardContent className="p-3">
                <p className="text-sm text-neutral-600">
                  <strong>Notes :</strong> {handover.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
