import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { objectsService } from '../services/objects.service';
import { reservationsService } from '../services/reservations.service';
import { RentalObject, Reservation, Handover } from '../types';
import { Loader } from '../components/common/Loader';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Package, Calendar, Edit, Trash2, Euro, RefreshCw, AlertCircle, CheckCircle, XCircle, QrCode, User, Clock } from 'lucide-react';
// import { DevelopmentModeBanner } from '../components/common/DevelopmentModeBanner';
import { PaymentStatus } from '../components/payment/PaymentStatus';
import { HandoversManager } from '../components/handovers/HandoversManager';
import { ReservationHandovers } from '../components/handovers/ReservationHandovers';
import { AddressManager } from '../components/profile/AddressManager';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [myObjects, setMyObjects] = useState<RentalObject[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [receivedReservations, setReceivedReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'objects' | 'reservations' | 'received' | 'handovers'>('objects');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (profile?.id) {
        const [objects, rentals, received] = await Promise.all([
          objectsService.getObjectsByOwner(profile.id),
          reservationsService.getReservationsAsRenter(),
          reservationsService.getReservationsAsOwner()
        ]);
        
        setMyObjects(objects);
        setMyReservations(rentals);
        setReceivedReservations(received);
      } else {
        setError('Profil utilisateur non trouvé. Veuillez vous reconnecter.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors du chargement des données: ${errorMessage}`);
      toast.error(`Erreur lors du chargement des données: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recharger les données quand le profil change
  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id, loadData]);

  const handleDeleteObject = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) return;

    try {
      await objectsService.deleteObject(id);
      toast.success('Objet supprimé avec succès');
      loadData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      ongoing: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
      rejected: 'Refusée'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleAcceptReservation = async (reservationId: string) => {
    try {
      await reservationsService.acceptReservation(reservationId);
      toast.success('✅ Réservation acceptée !');
      loadData(); // Recharger les données
    } catch (error: unknown) {
      console.error('Error accepting reservation:', error);
      toast.error('Erreur lors de l\'acceptation de la réservation');
    }
  };

  const handleRejectReservation = async (reservationId: string) => {
    try {
      await reservationsService.rejectReservation(reservationId);
      toast.success('❌ Réservation refusée');
      loadData(); // Recharger les données
    } catch (error: unknown) {
      console.error('Error rejecting reservation:', error);
      toast.error('Erreur lors du refus de la réservation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue, {profile?.full_name || 'Utilisateur'}
              </h1>
              <p className="text-gray-600">Gérez vos objets et vos réservations</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Erreur de chargement</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Banner de mode développement */}
        {/* <DevelopmentModeBanner /> */}

        {/* Statut du paiement simulé */}
        <PaymentStatus />

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('objects')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === 'objects'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Mes objets ({myObjects.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === 'reservations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Mes locations ({myReservations.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === 'received'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Réservations reçues ({receivedReservations.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('handovers')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === 'handovers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Handovers</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'objects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mes objets</h2>
                  <Link
                    to="/objects/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Ajouter un objet
                  </Link>
                </div>

                {myObjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore d'objets</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myObjects.map((object) => (
                      <div key={object.id} className="relative">
                        <ObjectCard object={object} />
                        <div className="absolute top-2 left-2 flex space-x-2">
                          <Link
                            to={`/objects/${object.id}/edit`}
                            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Link>
                          <button
                            onClick={() => handleDeleteObject(object.id)}
                            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reservations' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Mes locations</h2>
                {myReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore de réservations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReservations.map((reservation) => (
                      <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {reservation.object?.title}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                              <div className="flex items-center">
                                <Euro className="h-4 w-4 mr-1" />
                                <span className="font-medium">{reservation.total_price}€</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        {/* Handovers pour cette réservation */}
                        <div className="mt-4">
                          <ReservationHandovers 
                            reservationId={reservation.id} 
                            isOwner={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'received' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Réservations reçues</h2>
                {receivedReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune réservation reçue</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedReservations.map((reservation) => (
                      <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {reservation.object?.title}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <Link 
                                  to={`/profile/${reservation.renter?.id}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                  {reservation.renter?.full_name}
                                </Link>
                              </div>
                              <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                              <div className="flex items-center">
                                <Euro className="h-4 w-4 mr-1" />
                                <span className="font-medium">{reservation.total_price}€</span>
                              </div>
                              
                              {/* Informations de scan QR */}
                              {reservation.handovers && reservation.handovers.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {reservation.handovers?.map((handover: Handover) => (
                                    <div key={handover.id} className="flex items-center space-x-2 text-xs">
                                      <Clock className="h-3 w-3 text-gray-500" />
                                      <span className="text-gray-600">
                                        {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}:
                                      </span>
                                      {handover.actual_date ? (
                                        <span className="text-green-600 font-medium">
                                          {new Date(handover.actual_date).toLocaleString('fr-FR')}
                                        </span>
                                      ) : (
                                        <span className="text-yellow-600">
                                          En attente
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(reservation.status)}
                            
                            {/* Boutons d'action pour les réservations en attente */}
                            {reservation.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAcceptReservation(reservation.id)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Accepter</span>
                                </button>
                                <button
                                  onClick={() => handleRejectReservation(reservation.id)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Refuser</span>
                                </button>
                              </div>
                            )}
                            
                            {/* Message pour les réservations confirmées */}
                            {reservation.status === 'confirmed' && (
                              <div className="flex items-center space-x-1 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4" />
                                <span>Confirmée</span>
                              </div>
                            )}
                            
                            {/* Message pour les réservations refusées */}
                            {reservation.status === 'rejected' && (
                              <div className="flex items-center space-x-1 text-red-600 text-sm">
                                <XCircle className="h-4 w-4" />
                                <span>Refusée</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'handovers' && (
              <div className="space-y-6">
                {/* Gestionnaire d'adresse */}
                <AddressManager />
                
                {/* Liste des réservations avec handovers */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Handovers par Réservation</h3>
                  
                  {receivedReservations.filter(r => r.status === 'confirmed').length === 0 ? (
                    <div className="text-center py-8">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">Aucune réservation confirmée</p>
                      <p className="text-sm text-gray-400">
                        Les handovers ne peuvent être créés que pour les réservations confirmées
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {receivedReservations
                        .filter(reservation => reservation.status === 'confirmed')
                        .map((reservation) => (
                          <div key={reservation.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{reservation.object?.title}</h4>
                                <p className="text-sm text-gray-600">
                                  Locataire: {reservation.renter?.full_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Euro className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">{reservation.total_price}€</span>
                              </div>
                            </div>
                            
                            <HandoversManager reservationId={reservation.id} isOwner={true} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
