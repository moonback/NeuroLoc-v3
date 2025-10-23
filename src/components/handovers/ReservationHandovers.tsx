import { useState, useEffect } from 'react';
import { QrCode, MapPin, Calendar, Clock, CheckCircle, Eye } from 'lucide-react';
import { Handover } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { QRCodeDisplay } from './QRCodeDisplay';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'returned': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <CheckCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'picked_up': return 'Récupéré';
      case 'returned': return 'Restitué';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-blue-600 bg-blue-100';
      case 'returned': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (handovers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <QrCode className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Handovers</h3>
        </div>
        <div className="text-center py-4">
          <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucun handover créé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <QrCode className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold">Handovers ({handovers.length})</h3>
      </div>

      <div className="space-y-3">
        {handovers.map((handover) => (
          <div key={handover.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">
                  {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(handover.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(handover.status)}`}>
                  {getStatusLabel(handover.status)}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{handover.pickup_address}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {handover.actual_date && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="bg-gray-100 rounded px-2 py-1">
                <p className="text-xs text-gray-500 font-mono">
                  {handover.qr_code.substring(0, 20)}...
                </p>
              </div>
              
              <button
                onClick={() => setSelectedHandover(handover)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition text-sm"
              >
                <Eye className="h-4 w-4" />
                <span>Voir détails</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour afficher les détails */}
      {selectedHandover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Détails du Handover</h3>
                <button
                  onClick={() => setSelectedHandover(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <QRCodeDisplay 
                handover={selectedHandover}
                onStatusUpdate={(handoverId, status) => {
                  // Mettre à jour le statut et recharger
                  loadHandovers();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
