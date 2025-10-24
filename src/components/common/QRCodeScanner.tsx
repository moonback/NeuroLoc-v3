import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { CheckCircle, Camera, AlertCircle } from 'lucide-react';

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
    <Card className={`relative ${className}`}>
      <CardContent className="p-0">
        <video
          ref={videoRef}
          className="w-full h-full rounded-lg"
          style={{ maxHeight: '400px' }}
        />
        
        {hasScanned ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="border-success-200 bg-success-50">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-success-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-success-700">QR Code scanné !</p>
              </CardContent>
            </Card>
          </div>
        ) : isScanning ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="border-neutral-200 bg-neutral-900 bg-opacity-50">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 text-white mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-white">Pointez la caméra vers le QR code</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="border-accent-200 bg-accent-50">
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-8 w-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm text-accent-700">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
