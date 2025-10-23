import { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, QrCode, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Handover, HandoverStatus } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CreateHandoverForm } from './CreateHandoverForm';
import toast from 'react-hot-toast';

interface HandoversManagerProps {
  reservationId: string;
}

export const HandoversManager = ({ reservationId }: HandoversManagerProps) => {
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

  const handleStatusUpdate = async (handoverId: string, status: HandoverStatus) => {
    try {
      await handoversService.updateHandoverStatus(handoverId, status);
      toast.success('Statut mis à jour avec succès !');
      loadHandovers(); // Recharger les données
    } catch (error) {
      console.error('Error updating handover status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusIcon = (status: HandoverStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'returned': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <QrCode className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Gestion des Handovers</h2>
        </div>
        <CreateHandoverForm 
          reservationId={reservationId} 
          onHandoverCreated={loadHandovers}
        />
      </div>

      {/* Liste des handovers */}
      {handovers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun handover créé pour cette réservation</p>
          <CreateHandoverForm 
            reservationId={reservationId} 
            onHandoverCreated={loadHandovers}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {handovers.map((handover) => (
            <div key={handover.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">
                    {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(handover.status)}
                  <span className="text-sm font-medium">{getStatusLabel(handover.status)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{handover.pickup_address}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {handover.actual_date && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      Effectué le {new Date(handover.actual_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code simplifié */}
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-mono break-all">
                  {handover.qr_code}
                </p>
              </div>

              {/* Actions rapides */}
              {handover.status === 'pending' && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusUpdate(handover.id, 'picked_up')}
                    className="flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirmer</span>
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate(handover.id, 'cancelled')}
                    className="flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              )}

              {handover.status === 'picked_up' && handover.type === 'pickup' && (
                <button
                  onClick={() => handleStatusUpdate(handover.id, 'returned')}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Marquer comme restitué</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
