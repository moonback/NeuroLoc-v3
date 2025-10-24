import { useState, useEffect } from 'react';
import { MapPin, Calendar, FileText, Plus } from 'lucide-react';
import { CreateHandoverInput, HandoverType, Reservation } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { reservationsService } from '../../services/reservations.service';
import toast from 'react-hot-toast';

interface CreateHandoverFormProps {
  reservationId: string;
  onHandoverCreated?: () => void;
}

export const CreateHandoverForm = ({ reservationId, onHandoverCreated }: CreateHandoverFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<CreateHandoverInput>({
    reservation_id: reservationId,
    type: 'pickup',
    pickup_address: '',
    scheduled_date: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);

  // Récupérer les informations de la réservation au montage du composant
  useEffect(() => {
    const loadReservation = async () => {
      setIsLoadingReservation(true);
      try {
        const reservationData = await reservationsService.getReservationById(reservationId);
        if (reservationData) {
          setReservation(reservationData);
          // Pré-remplir l'adresse avec l'adresse du propriétaire
          if (reservationData.owner?.address) {
            setFormData(prev => ({
              ...prev,
              pickup_address: reservationData.owner.address,
              pickup_latitude: reservationData.owner.latitude || undefined,
              pickup_longitude: reservationData.owner.longitude || undefined
            }));
          }
        }
      } catch (error) {
        console.error('Error loading reservation:', error);
        toast.error('Erreur lors du chargement de la réservation');
      } finally {
        setIsLoadingReservation(false);
      }
    };

    if (reservationId) {
      loadReservation();
    }
  }, [reservationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickup_address || !formData.scheduled_date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      await handoversService.createHandover(formData);
      toast.success('Handover créé avec succès !');
      setIsOpen(false);
      setFormData({
        reservation_id: reservationId,
        type: 'pickup',
        pickup_address: '',
        scheduled_date: '',
        notes: ''
      });
      if (onHandoverCreated) {
        onHandoverCreated();
      }
    } catch (error: any) {
      console.error('Error creating handover:', error);
      toast.error('Erreur lors de la création du handover');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateHandoverInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        <span>Créer un handover</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Créer un Handover</h3>
      
      {/* Informations de la réservation */}
      {reservation && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informations de la réservation</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Objet :</strong> {reservation.object?.title}</p>
            <p><strong>Propriétaire :</strong> {reservation.owner?.full_name}</p>
            <p><strong>Locataire :</strong> {reservation.renter?.full_name}</p>
            <p><strong>Période :</strong> {new Date(reservation.start_date).toLocaleDateString('fr-FR')} - {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type de handover */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de handover
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'pickup')}
              className={`p-3 rounded-lg border-2 transition ${
                formData.type === 'pickup'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Retrait</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('type', 'return')}
              className={`p-3 rounded-lg border-2 transition ${
                formData.type === 'return'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Restitution</span>
              </div>
            </button>
          </div>
        </div>

        {/* Adresse de retrait */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse de retrait *
          </label>
          {isLoadingReservation ? (
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded flex-1"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Affichage de l'adresse du propriétaire */}
              {reservation?.owner?.address && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Adresse du propriétaire :</span>
                  </div>
                  <p className="text-sm text-blue-700">{reservation.owner.address}</p>
                  {reservation.owner.city && (
                    <p className="text-sm text-blue-600">{reservation.owner.city}, {reservation.owner.postal_code}</p>
                  )}
                </div>
              )}
              
              {/* Champ d'adresse modifiable */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  placeholder="Adresse complète de retrait (modifiable si nécessaire)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {reservation?.owner?.address && formData.pickup_address !== reservation.owner.address && (
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('pickup_address', reservation.owner?.address || '');
                    if (reservation.owner?.latitude && reservation.owner?.longitude) {
                      setFormData(prev => ({
                        ...prev,
                        pickup_latitude: reservation.owner?.latitude || undefined,
                        pickup_longitude: reservation.owner?.longitude || undefined
                      }));
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Utiliser l'adresse du propriétaire
                </button>
              )}
            </div>
          )}
        </div>

        {/* Date prévue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date prévue *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Instructions spéciales, détails de contact..."
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création...' : 'Créer le handover'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};
