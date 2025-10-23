import { useState } from 'react';
import { QrCode, ScanLine, CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  handover: Handover;
  onStatusUpdate?: (handoverId: string, status: HandoverStatus) => void;
}

export const QRCodeDisplay = ({ handover, onStatusUpdate }: QRCodeDisplayProps) => {
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScan = () => {
    setIsScanning(true);
    // Simulation du scan QR code
    setTimeout(() => {
      setIsScanning(false);
      toast.success('QR Code scanné avec succès !');
    }, 2000);
  };

  const handleStatusUpdate = (newStatus: HandoverStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(handover.id, newStatus);
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

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="bg-gray-100 rounded-lg p-4 inline-block">
          <QrCode className="h-32 w-32 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {handover.qr_code}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {handover.status === 'pending' && (
          <>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <ScanLine className="h-4 w-4" />
              <span>{isScanning ? 'Scan en cours...' : 'Scanner QR Code'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStatusUpdate('picked_up')}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirmer</span>
              </button>
              
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <XCircle className="h-4 w-4" />
                <span>Annuler</span>
              </button>
            </div>
          </>
        )}

        {handover.status === 'picked_up' && handover.type === 'pickup' && (
          <button
            onClick={() => handleStatusUpdate('returned')}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Marquer comme restitué</span>
          </button>
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
