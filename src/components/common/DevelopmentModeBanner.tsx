import { useState } from 'react';
import { Info, X, CreditCard } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

export const DevelopmentModeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-large mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mode Développement</h3>
              <p className="text-brand-100 text-sm">
                Les paiements sont simulés - Aucun vrai paiement ne sera effectué
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Paiement Simulé</span>
            </div>
            
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-brand-100">
          <p>
            • Les réservations sont créées normalement<br/>
            • Les paiements ont 90% de chance de réussir<br/>
            • Aucune transaction réelle n'est effectuée<br/>
            • Parfait pour tester toutes les fonctionnalités
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
