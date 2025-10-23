import { useState } from 'react';
import { Info, X, CreditCard } from 'lucide-react';

export const DevelopmentModeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 mb-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mode Développement</h3>
            <p className="text-blue-100 text-sm">
              Les paiements sont simulés - Aucun vrai paiement ne sera effectué
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">Paiement Simulé</span>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-blue-100">
        <p>
          • Les réservations sont créées normalement<br/>
          • Les paiements ont 90% de chance de réussir<br/>
          • Aucune transaction réelle n'est effectuée<br/>
          • Parfait pour tester toutes les fonctionnalités
        </p>
      </div>
    </div>
  );
};
