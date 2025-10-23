import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Euro } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'success' | 'cancelled' | 'pending' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const session = searchParams.get('session');

    if (payment && session) {
      setStatus(payment as 'success' | 'cancelled');
      setSessionId(session);

      // Afficher une notification selon le statut
      if (payment === 'success') {
        toast.success('🎉 Paiement simulé réussi ! Votre réservation est confirmée.', {
          duration: 5000,
        });
      } else if (payment === 'cancelled') {
        toast.error('❌ Paiement simulé annulé. Vous pouvez réessayer.', {
          duration: 5000,
        });
      }
    }
  }, [searchParams]);

  if (!status || !sessionId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-4">
        {status === 'success' && (
          <>
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800">
                Paiement Simulé Réussi
              </h3>
              <p className="text-gray-600">
                Votre réservation a été confirmée avec succès.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Session ID: {sessionId}
              </p>
            </div>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">
                Paiement Simulé Annulé
              </h3>
              <p className="text-gray-600">
                Le paiement a été annulé. Vous pouvez réessayer.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Session ID: {sessionId}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Mode développement - Paiement simulé</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
          <Euro className="h-4 w-4" />
          <span>Aucun vrai paiement n'a été effectué</span>
        </div>
      </div>
    </div>
  );
};
