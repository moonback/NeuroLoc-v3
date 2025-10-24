import { useState, useEffect } from 'react';
import { MapPin, Calendar, FileText, Plus, X } from 'lucide-react';
import { CreateHandoverInput, HandoverType, Reservation } from '../../types';
import { handoversService } from '../../services/handovers.service';
import { reservationsService } from '../../services/reservations.service';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
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
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Créer un handover
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-lg font-semibold">Créer un Handover</h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-4 w-4" />}
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Informations de la réservation */}
        {reservation && (
          <Card className="mb-6 bg-neutral-50">
            <CardContent className="p-4">
              <h4 className="text-heading font-medium mb-3">Informations de la réservation</h4>
              <div className="space-y-2 text-sm text-body">
                <p><strong>Objet :</strong> {reservation.object?.title}</p>
                <p><strong>Propriétaire :</strong> {reservation.owner?.full_name}</p>
                <p><strong>Locataire :</strong> {reservation.renter?.full_name}</p>
                <p><strong>Période :</strong> {new Date(reservation.start_date).toLocaleDateString('fr-FR')} - {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de handover */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Type de handover
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'pickup')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === 'pickup'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Retrait</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('type', 'return')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === 'return'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Restitution</span>
                </div>
              </button>
            </div>
          </div>

          {/* Adresse de retrait */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Adresse de retrait *
            </label>
            {isLoadingReservation ? (
              <div className="w-full p-3 border border-neutral-300 rounded-xl bg-neutral-50">
                <div className="flex items-center gap-3">
                  <Loader size="sm" />
                  <div className="h-4 bg-neutral-300 rounded flex-1 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Affichage de l'adresse du propriétaire */}
                {reservation?.owner?.address && (
                  <Card className="border-brand-200 bg-brand-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-brand-600" />
                        <span className="text-sm font-medium text-brand-800">Adresse du propriétaire :</span>
                      </div>
                      <p className="text-sm text-brand-700">{reservation.owner.address}</p>
                      {reservation.owner.city && (
                        <p className="text-sm text-brand-600">{reservation.owner.city}, {reservation.owner.postal_code}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Champ d'adresse modifiable */}
                <Input
                  type="text"
                  value={formData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  placeholder="Adresse complète de retrait (modifiable si nécessaire)"
                  leftIcon={MapPin}
                  required
                />
                
                {reservation?.owner?.address && formData.pickup_address !== reservation.owner.address && (
                  <Button
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
                    variant="ghost"
                    size="sm"
                  >
                    Utiliser l'adresse du propriétaire
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Date prévue */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Date prévue *
            </label>
            <Input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
              leftIcon={Calendar}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Instructions spéciales, détails de contact..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Création...' : 'Créer le handover'}
            </Button>
            
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              variant="ghost"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
