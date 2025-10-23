import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useObject } from '../hooks/useObjects';
import { reservationsService } from '../services/reservations.service';
import { stripeService } from '../services/stripe.service';
import { messagesService } from '../services/messages.service';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { MapPin, Euro, Calendar, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export const ObjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { object, loading } = useObject(id!);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleContactOwner = () => {
    if (!user || !profile || !object) return;

    const conversationId = messagesService.generateConversationId(
      profile.id,
      object.owner_id,
      object.id
    );

    navigate(`/messages?conversation=${conversationId}&receiver=${object.owner_id}&object=${object.id}`);
  };

  const handleBooking = async () => {
    if (!user || !object) {
      toast.error('Vous devez être connecté pour réserver');
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner les dates');
      return;
    }

    setIsBooking(true);

    try {
      const totalPrice = reservationsService.calculateTotalPrice(
        object.price_per_day,
        startDate,
        endDate
      );

      const reservation = await reservationsService.createReservation({
        object_id: object.id,
        owner_id: object.owner_id,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice
      });

      await stripeService.handlePayment(
        reservation.id,
        Math.round(totalPrice * 100),
        object.title
      );
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réservation');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Objet non trouvé</p>
      </div>
    );
  }

  const isOwner = user?.id === object.owner_id;
  const mainImage = object.images && object.images.length > 0
    ? object.images[0]
    : 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1200';

  const totalPrice = startDate && endDate
    ? reservationsService.calculateTotalPrice(object.price_per_day, startDate, endDate)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative h-96 lg:h-auto">
              <img
                src={mainImage}
                alt={object.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-medium">
                {object.status === 'available' ? 'Disponible' : 'Loué'}
              </div>
            </div>

            <div className="p-8">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mb-4">
                {object.category}
              </span>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {object.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{object.location}</span>
              </div>

              <div className="flex items-center text-blue-600 text-3xl font-bold mb-6">
                <Euro className="h-8 w-8" />
                <span>{object.price_per_day}</span>
                <span className="text-lg text-gray-500 ml-2">/jour</span>
              </div>

              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {object.description}
                </p>
              </div>

              {object.owner && (
                <div className="border-t pt-6 mb-6">
                  <h2 className="text-xl font-semibold mb-3">Propriétaire</h2>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{object.owner.full_name}</p>
                      <p className="text-sm text-gray-500">{object.owner.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isOwner && object.status === 'available' && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Réserver</h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {totalPrice > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Prix total:</span>
                        <span className="text-2xl font-bold text-blue-600">{totalPrice}€</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={handleBooking}
                      className="w-full"
                      isLoading={isBooking}
                      disabled={!startDate || !endDate}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Réserver maintenant
                    </Button>

                    <Button
                      onClick={handleContactOwner}
                      variant="secondary"
                      className="w-full"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contacter le propriétaire
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
