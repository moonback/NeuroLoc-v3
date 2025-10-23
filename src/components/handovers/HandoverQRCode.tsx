import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, Calendar, Download, Share2 } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { QRCodeGenerator } from '../common/QRCodeGenerator';
import toast from 'react-hot-toast';

interface HandoverQRCodeProps {
  handover: Handover;
  isOwner?: boolean;
}

export const HandoverQRCode = ({ handover, isOwner = false }: HandoverQRCodeProps) => {
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
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve!));
          await navigator.share({
            title: `QR Code Handover - ${handover.type === 'pickup' ? 'Retrait' : 'Restitution'}`,
            text: `QR Code pour le ${handover.type === 'pickup' ? 'retrait' : 'restitution'} de ${handover.reservation?.object?.title}`,
            files: [new File([blob!], `handover-${handover.id}-qr.png`, { type: 'image/png' })]
          });
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
        </h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(handover.status)}`}>
          {getStatusIcon(handover.status)}
          <span>{getStatusLabel(handover.status)}</span>
        </div>
      </div>

      {/* Informations de base */}
      <div className="space-y-3 mb-6">
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

      {/* QR Code - Seulement pour les locataires */}
      {!isOwner && (
        <div className="text-center mb-6">
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            {showQRCode ? (
              <div className="space-y-4">
                <QRCodeGenerator 
                  value={handover.qr_code} 
                  size={200}
                  className="mb-2"
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
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg p-8">
                  <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code masqué</p>
                </div>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mx-auto"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Afficher le QR Code</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="space-y-3">
        {handover.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Instructions :</strong> Présentez ce QR code au propriétaire/locataire. Le scan QR code validera automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'}.
            </p>
          </div>
        )}

        {handover.status === 'picked_up' && handover.type === 'pickup' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour valider automatiquement la restitution de l'objet.
            </p>
          </div>
        )}

        {handover.notes && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Notes :</strong> {handover.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
