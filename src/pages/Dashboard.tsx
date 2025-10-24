import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { objectsService } from '../services/objects.service';
import { reservationsService } from '../services/reservations.service';
import { RentalObject, Reservation, Handover } from '../types';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Package, Calendar, Edit, Trash2, Euro, RefreshCw, AlertCircle, CheckCircle, XCircle, QrCode, User, Clock, Star, Plus } from 'lucide-react';
// import { DevelopmentModeBanner } from '../components/common/DevelopmentModeBanner';
import { PaymentStatus } from '../components/payment/PaymentStatus';
import { HandoversManager } from '../components/handovers/HandoversManager';
import { ReservationHandovers } from '../components/handovers/ReservationHandovers';
import { AddressManager } from '../components/profile/AddressManager';
import { CompletedReservations } from '../components/profile/CompletedReservations';
import { RoleStats } from '../components/profile/RoleStats';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const { isLoueur } = useRole();
  const [myObjects, setMyObjects] = useState<RentalObject[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [receivedReservations, setReceivedReservations] = useState<Reservation[]>([]);
  
  // Debug: Log objects state changes
  useEffect(() => {
    console.log('📦 myObjects state changed:', myObjects);
  }, [myObjects]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'objects' | 'reservations' | 'received' | 'handovers' | 'reviews'>(isLoueur ? 'objects' : 'reservations');

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 loadData called', { profileId: profile?.id, isLoueur, role: profile?.role });
      setLoading(true);
      setError(null);
      
      if (profile?.id) {
        // Vérifier le rôle directement depuis le profil pour éviter les re-renders
        const userIsLoueur = profile.role === 'loueur';
        
        if (userIsLoueur) {
          console.log('📦 Loading objects for loueur...');
          const [objects, rentals, received] = await Promise.all([
            objectsService.getObjectsByOwner(profile.id),
            reservationsService.getReservationsAsRenter(),
            reservationsService.getReservationsAsOwner()
          ]);
          
          console.log('📦 Objects loaded:', objects);
          // Vérifier que nous avons bien des objets avant de les définir
          if (Array.isArray(objects)) {
            setMyObjects(objects);
          } else {
            console.warn('⚠️ Objects is not an array:', objects);
            setMyObjects([]);
          }
          setMyReservations(rentals);
          setReceivedReservations(received);
        } else {
          console.log('👤 Loading data for renter...');
          const [rentals, received] = await Promise.all([
            reservationsService.getReservationsAsRenter(),
            reservationsService.getReservationsAsOwner()
          ]);
          
          setMyObjects([]);
          setMyReservations(rentals);
          setReceivedReservations(received);
        }
      } else {
        console.log('❌ No profile ID found');
        setError('Profil utilisateur non trouvé. Veuillez vous reconnecter.');
      }
    } catch (error) {
      console.error('❌ Error in loadData:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors du chargement des données: ${errorMessage}`);
      toast.error(`Erreur lors du chargement des données: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.role]);

  // Charger les données quand le profil est disponible
  useEffect(() => {
    console.log('🔄 useEffect triggered', { authLoading, profileId: profile?.id, isLoueur });
    if (!authLoading && profile?.id) {
      console.log('✅ Conditions met, calling loadData');
      loadData();
    } else {
      console.log('❌ Conditions not met', { authLoading, profileId: profile?.id });
    }
  }, [profile?.id, authLoading, loadData]);

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
    const variants = {
      pending: 'warning' as const,
      confirmed: 'brand' as const,
      ongoing: 'success' as const,
      completed: 'default' as const,
      cancelled: 'danger' as const,
      rejected: 'danger' as const
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
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getObjectStatusBadge = (status: string) => {
    const variants = {
      available: 'success' as const,
      rented: 'brand' as const,
      unavailable: 'danger' as const
    };

    const labels = {
      available: 'Disponible',
      rented: 'Loué',
      unavailable: 'Indisponible'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
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


  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-neutral-600">Chargement de votre tableau de bord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Bienvenue, {profile?.full_name || 'Utilisateur'}
              </h1>
              <p className="text-neutral-600">Gérez vos objets et vos réservations</p>
            </div>
            <Button
              onClick={loadData}
              disabled={loading}
              variant="secondary"
              leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualiser
            </Button>
          </div>
          
          {/* Statistiques de rôle */}
          <RoleStats />
          
          {error && (
            <Card className="mt-6 border-accent-200 bg-accent-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-accent-600 flex-shrink-0" />
                <div>
                  <p className="text-accent-800 font-medium">Erreur de chargement</p>
                  <p className="text-accent-600 text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Banner de mode développement */}
        {/* <DevelopmentModeBanner /> */}

        {/* Statut du paiement simulé */}
        <PaymentStatus />

        {/* Navigation par onglets */}
        <Card className="mb-8">
          <CardHeader className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              {isLoueur && (
                <button
                  onClick={() => setActiveTab('objects')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'objects'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Mes objets ({myObjects.length})</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'reservations'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Mes locations ({myReservations.length})</span>
                </div>
              </button>
              {isLoueur && (
                <button
                  onClick={() => setActiveTab('received')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'received'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Réservations reçues ({receivedReservations.length})</span>
                  </div>
                </button>
              )}
              
              {isLoueur && (
                <button
                  onClick={() => setActiveTab('handovers')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'handovers'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>Handovers</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'reviews'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Avis</span>
                </div>
              </button>
            </nav>
          </CardHeader>

          <CardContent className="p-6">
            {activeTab === 'objects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-heading text-xl font-semibold">Mes objets</h2>
                  <Link to="/objects/new">
                    <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                      Ajouter un objet
                    </Button>
                  </Link>
                </div>

                {myObjects.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-600 mb-2">Aucun objet</h3>
                      <p className="text-neutral-500 mb-6">Commencez par publier votre premier objet</p>
                      <Link to="/objects/new">
                        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                          Publier un objet
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myObjects.map((object) => (
                      <div key={object.id} className="relative">
                        <ObjectCard object={object} />
                        {/* Badge de statut de l'objet */}
                        <div className="absolute top-3 right-3">
                          {getObjectStatusBadge(object.status)}
                        </div>
                        {/* Boutons d'action */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Link
                            to={`/objects/${object.id}/edit`}
                            className="w-8 h-8 bg-white rounded-lg shadow-soft flex items-center justify-center hover:bg-neutral-50 transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4 text-brand-600" />
                          </Link>
                          <button
                            onClick={() => handleDeleteObject(object.id)}
                            className="w-8 h-8 bg-white rounded-lg shadow-soft flex items-center justify-center hover:bg-neutral-50 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 text-accent-600" />
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
                <h2 className="text-heading text-xl font-semibold mb-6">Mes locations</h2>
                {myReservations.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-600 mb-2">Aucune réservation</h3>
                      <p className="text-neutral-500 mb-6">Vous n'avez pas encore fait de réservations</p>
                      <Link to="/objects">
                        <Button variant="primary" leftIcon={<Package className="h-4 w-4" />}>
                          Découvrir les objets
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myReservations.map((reservation) => (
                      <Card key={reservation.id} className="card-hover">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-heading text-lg font-semibold mb-2">
                                {reservation.object?.title}
                              </h3>
                              <div className="text-body text-sm space-y-2">
                                <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                                <div className="flex items-center gap-1">
                                  <Euro className="h-4 w-4" />
                                  <span className="font-medium">{reservation.total_price}€</span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(reservation.status)}
                          </div>
                          
                          {/* Handovers pour cette réservation */}
                          <div className="border-t border-neutral-200 pt-4">
                            <ReservationHandovers 
                              reservationId={reservation.id} 
                              isOwner={false}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'received' && (
              <div>
                <h2 className="text-heading text-xl font-semibold mb-6">Réservations reçues</h2>
                {receivedReservations.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-600 mb-2">Aucune réservation</h3>
                      <p className="text-neutral-500 mb-6">Vous n'avez pas encore reçu de réservations</p>
                      <Link to="/objects/new">
                        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                          Publier un objet
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {receivedReservations.map((reservation) => (
                      <Card key={reservation.id} className="card-hover">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-heading text-lg font-semibold mb-2">
                                {reservation.object?.title}
                              </h3>
                              <div className="text-body text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-neutral-500" />
                                  <Link 
                                    to={`/profile/${reservation.renter?.id}`}
                                    className="text-brand-600 hover:text-brand-700 hover:underline font-medium"
                                  >
                                    {reservation.renter?.full_name}
                                  </Link>
                                </div>
                                <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                                <div className="flex items-center gap-1">
                                  <Euro className="h-4 w-4" />
                                  <span className="font-medium">{reservation.total_price}€</span>
                                </div>
                                
                                {/* Informations de scan QR */}
                                {reservation.handovers && reservation.handovers.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    {reservation.handovers?.map((handover: Handover) => (
                                      <div key={handover.id} className="flex items-center gap-2 text-xs">
                                        <Clock className="h-3 w-3 text-neutral-500" />
                                        <span className="text-neutral-600">
                                          {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}:
                                        </span>
                                        {handover.actual_date ? (
                                          <span className="text-success-600 font-medium">
                                            {new Date(handover.actual_date).toLocaleString('fr-FR')}
                                          </span>
                                        ) : (
                                          <span className="text-warning-600">
                                            En attente
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              {getStatusBadge(reservation.status)}
                              
                              {/* Boutons d'action pour les réservations en attente */}
                              {reservation.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAcceptReservation(reservation.id)}
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<CheckCircle className="h-4 w-4" />}
                                  >
                                    Accepter
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectReservation(reservation.id)}
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<XCircle className="h-4 w-4" />}
                                  >
                                    Refuser
                                  </Button>
                                </div>
                              )}
                              
                              {/* Message pour les réservations confirmées */}
                              {reservation.status === 'confirmed' && (
                                <div className="flex items-center gap-1 text-success-600 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Confirmée</span>
                                </div>
                              )}
                              
                              {/* Message pour les réservations refusées */}
                              {reservation.status === 'rejected' && (
                                <div className="flex items-center gap-1 text-accent-600 text-sm">
                                  <XCircle className="h-4 w-4" />
                                  <span>Refusée</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                <Card>
                  <CardHeader>
                    <h3 className="text-heading text-lg font-semibold">Handovers par Réservation</h3>
                  </CardHeader>
                  <CardContent>
                    {receivedReservations.filter(r => r.status === 'confirmed').length === 0 ? (
                      <div className="text-center py-8">
                        <QrCode className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-600 mb-2">Aucune réservation confirmée</h3>
                        <p className="text-neutral-500 text-sm">
                          Les handovers ne peuvent être créés que pour les réservations confirmées
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receivedReservations
                          .filter(reservation => reservation.status === 'confirmed')
                          .map((reservation) => (
                            <Card key={reservation.id} className="border-neutral-200">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="text-heading text-lg font-semibold">{reservation.object?.title}</h4>
                                    <p className="text-body text-sm">
                                      Locataire: {reservation.renter?.full_name}
                                    </p>
                                    <p className="text-body text-sm">
                                      Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Euro className="h-4 w-4 text-neutral-600" />
                                    <span className="font-medium">{reservation.total_price}€</span>
                                  </div>
                                </div>
                                
                                <HandoversManager reservationId={reservation.id} isOwner={true} />
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Mes locations terminées - Avis pour les propriétaires */}
                <CompletedReservations 
                  reservations={receivedReservations} 
                  isOwner={true} 
                />
                
                {/* Mes réservations terminées - Avis pour les locataires */}
                <CompletedReservations 
                  reservations={myReservations} 
                  isOwner={false} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
