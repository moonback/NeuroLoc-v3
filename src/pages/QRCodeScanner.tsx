import { useState, useEffect } from 'react';
import { ScanLine, CheckCircle, XCircle, ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handoversService } from '../services/handovers.service';
import { Handover } from '../types';
import toast from 'react-hot-toast';

export const QRCodeScanner = () => {
  const navigate = useNavigate();
  const [scannedCode, setScannedCode] = useState<string>('');
  const [handover, setHandover] = useState<Handover | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulation du scan QR code
    setTimeout(() => {
      // Pour la démo, on utilise un code de test
      const testCode = 'pickup_test-reservation-123_' + Date.now() + '_abc123';
      setScannedCode(testCode);
      setIsScanning(false);
      toast.success('QR Code scanné avec succès !');
    }, 2000);
  };

  const handleManualInput = (code: string) => {
    setScannedCode(code);
  };

  const processQRCode = async () => {
    if (!scannedCode) return;

    setIsProcessing(true);
    try {
      const result = await handoversService.scanQRCode(scannedCode);
      if (result) {
        setHandover(result);
        toast.success('Handover trouvé !');
      } else {
        toast.error('QR Code non reconnu');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Erreur lors du traitement du QR Code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (status: 'picked_up' | 'returned' | 'cancelled') => {
    if (!handover) return;

    try {
      await handoversService.updateHandoverStatus(handover.id, status);
      toast.success('Statut mis à jour avec succès !');
      setHandover(null);
      setScannedCode('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h2 className="text-xl font-semibold mb-4">Scanner QR Code</h2>
            
            {!scannedCode ? (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <ScanLine className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {isScanning ? 'Scan en cours...' : 'Prêt à scanner'}
                  </p>
                </div>
                
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? 'Scan en cours...' : 'Scanner QR Code'}
                </button>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Ou saisissez manuellement :</p>
                  <input
                    type="text"
                    placeholder="Code QR..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleManualInput(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-6 mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">QR Code scanné !</p>
                  <p className="text-sm text-green-600 font-mono break-all mt-2">
                    {scannedCode}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={processQRCode}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Traitement...' : 'Traiter'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setScannedCode('');
                      setHandover(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Nouveau scan
                  </button>
                </div>
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
                    <h4 className="font-medium">Actions disponibles :</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleStatusUpdate('picked_up')}
                        className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirmer</span>
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </div>
                )}

                {handover.status === 'picked_up' && handover.type === 'pickup' && (
                  <button
                    onClick={() => handleStatusUpdate('returned')}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Marquer comme restitué</span>
                  </button>
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
