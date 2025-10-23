import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  isActive?: boolean;
}

export const QRCodeScanner = ({ onScan, onError, className = '', isActive = true }: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isActive || hasScanned) return;
    
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      setIsScanning(true);
      setError(null);

      await reader.decodeFromVideoDevice(undefined, videoElement, (result, error) => {
        if (result && !hasScanned) {
          setHasScanned(true);
          onScan(result.getText());
          stopScanning();
        }
        if (error && !error.message.includes('No MultiFormat Readers')) {
          console.error('Scan error:', error);
          if (onError) {
            onError(error);
          }
        }
      });
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Impossible d\'accéder à la caméra');
      setIsScanning(false);
    }
  }, [isActive, hasScanned, onScan, onError, stopScanning]);

  const resetScanner = useCallback(() => {
    setHasScanned(false);
    setError(null);
    stopScanning();
    if (isActive) {
      startScanning();
    }
  }, [isActive, startScanning, stopScanning]);

  useEffect(() => {
    if (isActive && !hasScanned) {
      startScanning();
    } else if (!isActive) {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isActive, hasScanned, startScanning, stopScanning]);

  // Exposer la fonction reset pour le composant parent
  useEffect(() => {
    if (videoRef.current) {
      (videoRef.current as any).resetScanner = resetScanner;
    }
  }, [resetScanner]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg"
        style={{ maxHeight: '400px' }}
      />
      
      {hasScanned ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-green-500 bg-opacity-90 rounded-lg p-4 text-white text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium">QR Code scanné !</p>
          </div>
        </div>
      ) : isScanning ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white text-center">
            <div className="animate-pulse mb-2">📷</div>
            <p className="text-sm">Pointez la caméra vers le QR code</p>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-lg">
          <div className="text-red-600 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
