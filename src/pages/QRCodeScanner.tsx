import { useState } from 'react';
import { ScanLine, CheckCircle, ArrowLeft, MapPin, Calendar, User, Camera, CameraOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handoversService } from '../services/handovers.service';
import { Handover } from '../types';
import { QRCodeScanner } from '../components/common/QRCodeScanner';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import toast from 'react-hot-toast';

export const QRCodeScannerPage = () => {
  const navigate = useNavigate();
  const [scannedCode, setScannedCode] = useState<string>('');
  const [handover, setHandover] = useState<Handover | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  const handleScan = (result: string) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime;
    
    // Éviter les scans répétés du même code ou scans trop rapprochés (moins de 2 secondes)
    if (result === lastScannedCode || timeSinceLastScan < 2000) {
      return;
    }
    
    setLastScannedCode(result);
    setLastScanTime(now);
    setScannedCode(result);
    processQRCode(result);
  };

  const handleScanError = (error: Error) => {
    console.error('Scan error:', error);
    setCameraError('Erreur de scan: ' + error.message);
  };

  const processQRCode = async (code: string) => {
    if (!code) return;

    setIsProcessing(true);
    try {
      const result = await handoversService.scanQRCode(code);
      if (result) {
        setHandover(result);
        // toast.success('Handover trouvé !');
        
        // Validation automatique selon le statut et le type
        if (result.status === 'pending') {
          if (result.type === 'pickup') {
            // Pour un retrait, marquer comme récupéré
            await handoversService.updateHandoverStatus(result.id, 'picked_up');
            toast.success('Retrait validé automatiquement !');
          } else if (result.type === 'return') {
            // Pour une restitution, marquer comme restitué
            await handoversService.updateHandoverStatus(result.id, 'returned');
            toast.success('Restitution validée automatiquement !');
          }
          
          // Recharger les données pour avoir le statut mis à jour
          const updatedHandover = await handoversService.scanQRCode(code);
          if (updatedHandover) {
            setHandover(updatedHandover);
          }
        } else if (result.status === 'picked_up' && result.type === 'pickup') {
          // Si c'est un objet récupéré, valider la restitution
          await handoversService.updateHandoverStatus(result.id, 'returned');
          toast.success('Restitution validée automatiquement !');
          
          // Recharger les données
          const updatedHandover = await handoversService.scanQRCode(code);
          if (updatedHandover) {
            setHandover(updatedHandover);
          }
        }
      } else {
        toast.error('QR Code non reconnu');
        setScannedCode('');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Erreur lors du traitement du QR Code');
      setScannedCode('');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setHandover(null);
    setScannedCode('');
    setCameraError(null);
    setLastScannedCode('');
    setLastScanTime(0);
    // Réinitialiser le scanner QR code
    const videoElement = document.querySelector('video') as HTMLVideoElement & { resetScanner?: () => void };
    if (videoElement && videoElement.resetScanner) {
      videoElement.resetScanner();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      picked_up: 'brand' as const,
      returned: 'success' as const,
      cancelled: 'danger' as const
    };

    const labels = {
      pending: 'En attente',
      picked_up: 'Récupéré',
      returned: 'Restitué',
      cancelled: 'Annulé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            className="mb-4"
          >
            Retour au dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <ScanLine className="h-8 w-8 text-brand-600" />
            <h1 className="text-heading text-3xl font-bold">Scanner QR Code</h1>
          </div>
          <p className="text-body mt-2">
            Scannez le QR code pour gérer le retrait ou la restitution d'un objet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner */}
          <Card>
            <CardHeader>
              <h2 className="text-heading text-xl font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <span>Scanner QR Code</span>
              </h2>
            </CardHeader>
            
            <CardContent>
              {!handover ? (
                <div className="space-y-4">
                  {cameraError ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <CameraOff className="h-16 w-16 text-accent-400 mx-auto mb-4" />
                        <p className="text-accent-600 mb-4">{cameraError}</p>
                        <Button
                          onClick={resetScanner}
                          variant="primary"
                        >
                          Réessayer
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <QRCodeScanner 
                        onScan={handleScan}
                        onError={handleScanError}
                        className="h-64"
                      />
                      
                      {isProcessing && (
                        <Card className="text-center py-4">
                          <CardContent>
                            <Loader size="lg" />
                            <p className="text-neutral-600 mt-2">Traitement du QR Code...</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {scannedCode && (
                        <Card className="border-success-200 bg-success-50">
                          <CardContent className="p-3">
                            <p className="text-success-800 text-sm">
                              <strong>Code scanné :</strong> {scannedCode}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <Card className="border-success-200 bg-success-50 mb-4">
                      <CardContent className="p-6">
                        <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-2" />
                        <p className="text-success-800 font-medium">QR Code scanné avec succès !</p>
                      </CardContent>
                    </Card>
                    
                    <Button
                      onClick={resetScanner}
                      variant="secondary"
                    >
                      Scanner un autre QR Code
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Résultat */}
          <Card>
            <CardHeader>
              <h2 className="text-heading text-xl font-semibold">Informations Handover</h2>
            </CardHeader>
            
            <CardContent>
              {!handover ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <ScanLine className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">
                      Scannez un QR code pour voir les informations du handover
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Informations de base */}
                  <Card className="bg-neutral-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-heading font-semibold text-lg">
                          {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                        </h3>
                        {getStatusBadge(handover.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <span>Objet: {handover.reservation?.object?.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-neutral-500" />
                          <span>{handover.pickup_address}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span>
                            Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  {handover.status === 'pending' && (
                    <div className="space-y-3">
                      <Card className="border-warning-200 bg-warning-50">
                        <CardContent className="p-3">
                          <p className="text-sm text-warning-800">
                            <strong>Instructions :</strong> Le scan QR code valide automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'} de l'objet.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-brand-200 bg-brand-50">
                        <CardContent className="p-3">
                          <p className="text-sm text-brand-800">
                            <strong>Validation automatique :</strong> Une fois le QR code scanné, le statut sera automatiquement mis à jour.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {handover.status === 'picked_up' && handover.type === 'pickup' && (
                    <div className="space-y-3">
                      <Card className="border-brand-200 bg-brand-50">
                        <CardContent className="p-3">
                          <p className="text-sm text-brand-800">
                            <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour marquer l'objet comme rendu.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-success-200 bg-success-50">
                        <CardContent className="p-3">
                          <p className="text-sm text-success-800">
                            <strong>Validation QR :</strong> Le scan du QR code de restitution validera automatiquement la restitution.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {handover.notes && (
                    <Card className="bg-brand-50">
                      <CardContent className="p-3">
                        <p className="text-sm text-brand-800">
                          <strong>Notes :</strong> {handover.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
