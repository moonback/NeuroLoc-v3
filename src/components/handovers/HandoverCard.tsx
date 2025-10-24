import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, Calendar, Download, Share2, Eye, EyeOff } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { QRCodeGenerator } from '../common/QRCodeGenerator';
import toast from 'react-hot-toast';

interface HandoverCardProps {
  handover: Handover;
  isOwner?: boolean;
}

export const HandoverCard = ({ handover, isOwner = false }: HandoverCardProps) => {
  const [showQRCode, setShowQRCode] = useState(false);

  const getStatusColor = (status: HandoverStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-blue-600 bg-blue-100';
      case 'returned': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: HandoverStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4" />;
      case 'returned': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: HandoverStatus) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'picked_up': return 'Récupéré';
      case 'returned': return 'Restitué';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
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
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${handover.type === 'pickup' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <MapPin className={`h-5 w-5 ${handover.type === 'pickup' ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
            </h3>
            <p className="text-sm text-gray-600">{handover.reservation?.object?.title}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(handover.status)}`}>
          {getStatusIcon(handover.status)}
          <span>{getStatusLabel(handover.status)}</span>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{handover.pickup_address}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {handover.actual_date && (
          <div className="flex items-center space-x-2 text-gray-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      {/* QR Code - Seulement pour les locataires et si pas encore utilisé */}
      {!isOwner && handover.status === 'pending' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">QR Code</h4>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition"
            >
              {showQRCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-sm">{showQRCode ? 'Masquer' : 'Afficher'}</span>
            </button>
          </div>
          
          {showQRCode ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <QRCodeGenerator 
                value={handover.qr_code} 
                size={150}
                className="mb-3"
                dataHandoverId={handover.id}
              />
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={handleDownloadQRCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Download className="h-3 w-3" />
                  <span>Télécharger</span>
                </button>
                <button
                  onClick={handleShareQRCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR Code masqué</p>
            </div>
          )}
        </div>
      )}

      {/* Message QR Code utilisé */}
      {!isOwner && handover.status !== 'pending' && (
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">
              QR Code utilisé - {handover.status === 'picked_up' ? 'Objet récupéré' : 'Objet restitué'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Le QR code a été scanné avec succès le {handover.actual_date ? new Date(handover.actual_date).toLocaleDateString('fr-FR') : 'récemment'}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {handover.status === 'pending' && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Instructions :</strong> Présentez le QR code au propriétaire/locataire. Le scan QR code validera automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'}.
            </p>
          </div>
        </div>
      )}

      {handover.status === 'picked_up' && handover.type === 'pickup' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour valider automatiquement la restitution de l'objet.
            </p>
          </div>
        </div>
      )}

      {handover.notes && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            <strong>Notes :</strong> {handover.notes}
          </p>
        </div>
      )}
    </div>
  );
};
