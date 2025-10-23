import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { objectsService } from '../services/objects.service';
import { reservationsService } from '../services/reservations.service';
import { RentalObject, Reservation } from '../types';
import { Loader } from '../components/common/Loader';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Package, Calendar, Edit, Trash2, Euro } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [myObjects, setMyObjects] = useState<RentalObject[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [receivedReservations, setReceivedReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'objects' | 'reservations' | 'received'>('objects');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Dashboard: Loading data...', { profile: profile?.id });
      
      if (profile) {
        const [objects, rentals, received] = await Promise.all([
          objectsService.getObjectsByOwner(profile.id),
          reservationsService.getReservationsAsRenter(),
          reservationsService.getReservationsAsOwner()
        ]);
        
        console.log('Dashboard: Data loaded:', { 
          objects: objects.length, 
          rentals: rentals.length, 
          received: received.length,
          objectsData: objects
        });
        
        setMyObjects(objects);
        setMyReservations(rentals);
        setReceivedReservations(received);
      } else {
        console.log('Dashboard: No profile found');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObject = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) return;

    try {
      await objectsService.deleteObject(id);
      toast.success('Objet supprimé avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      ongoing: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {profile?.full_name || 'Utilisateur'}
          </h1>
          <p className="text-gray-600">Gérez vos objets et vos réservations</p>
        </div>

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
                              <p>Locataire: {reservation.renter?.full_name}</p>
                              <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                              <div className="flex items-center">
                                <Euro className="h-4 w-4 mr-1" />
                                <span className="font-medium">{reservation.total_price}€</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
