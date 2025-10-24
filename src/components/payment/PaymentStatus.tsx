import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Euro } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
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
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {status === 'success' && (
            <>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-heading text-lg font-semibold text-success-800">
                  Paiement Simulé Réussi
                </h3>
                <p className="text-body">
                  Votre réservation a été confirmée avec succès.
                </p>
                <p className="text-muted text-sm mt-1">
                  Session ID: {sessionId}
                </p>
              </div>
            </>
          )}

          {status === 'cancelled' && (
            <>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-heading text-lg font-semibold text-accent-800">
                  Paiement Simulé Annulé
                </h3>
                <p className="text-body">
                  Le paiement a été annulé. Vous pouvez réessayer.
                </p>
                <p className="text-muted text-sm mt-1">
                  Session ID: {sessionId}
                </p>
              </div>
            </>
          )}
        </div>

        <Card className="mt-4 bg-neutral-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="h-4 w-4" />
              <span>Mode développement - Paiement simulé</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
              <Euro className="h-4 w-4" />
              <span>Aucun vrai paiement n'a été effectué</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
