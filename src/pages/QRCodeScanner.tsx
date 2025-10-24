import { useState } from 'react';
import { ScanLine, CheckCircle, ArrowLeft, MapPin, Calendar, User, Camera, CameraOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handoversService } from '../services/handovers.service';
import { Handover } from '../types';
import { QRCodeScanner } from '../components/common/QRCodeScanner';
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
        toast.success('Handover trouvé !');
        
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-blue-600 bg-blue-100';
      case 'returned': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'picked_up': return 'Récupéré';
      case 'returned': return 'Restitué';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour au dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <ScanLine className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Scanner QR Code</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Scannez le QR code pour gérer le retrait ou la restitution d'un objet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Scanner QR Code</span>
            </h2>
            
            {!handover ? (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="text-center py-8">
                    <CameraOff className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{cameraError}</p>
                <button
                      onClick={resetScanner}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                      Réessayer
                </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QRCodeScanner 
                      onScan={handleScan}
                      onError={handleScanError}
                      className="h-64"
                    />
                    
                    {isProcessing && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Traitement du QR Code...</p>
                      </div>
                    )}
                    
                    {scannedCode && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm">
                          <strong>Code scanné :</strong> {scannedCode}
                        </p>
                      </div>
                    )}
                </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-100 rounded-lg p-6 mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">QR Code scanné avec succès !</p>
                </div>
                
                  <button
                  onClick={resetScanner}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                  Scanner un autre QR Code
                  </button>
              </div>
            )}
          </div>

          {/* Résultat */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informations Handover</h2>
            
            {!handover ? (
              <div className="text-center py-12">
                <ScanLine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Scannez un QR code pour voir les informations du handover
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Informations de base */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      {handover.type === 'pickup' ? 'Retrait' : 'Restitution'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(handover.status)}`}>
                      {getStatusLabel(handover.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Objet: {handover.reservation?.object?.title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{handover.pickup_address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        Prévu le {new Date(handover.scheduled_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {handover.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Instructions :</strong> Le scan QR code valide automatiquement le {handover.type === 'pickup' ? 'retrait' : 'restitution'} de l'objet.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Validation automatique :</strong> Une fois le QR code scanné, le statut sera automatiquement mis à jour.
                      </p>
                    </div>
                  </div>
                )}

                {handover.status === 'picked_up' && handover.type === 'pickup' && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Prochaine étape :</strong> Scannez le QR code de restitution pour marquer l'objet comme rendu.
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Validation QR :</strong> Le scan du QR code de restitution validera automatiquement la restitution.
                      </p>
                    </div>
                  </div>
                )}

                {handover.notes && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Notes :</strong> {handover.notes}
                    </p>
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
