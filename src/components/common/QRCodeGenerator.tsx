import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
  dataHandoverId?: string;
}

export const QRCodeGenerator = ({ value, size = 200, className = '', dataHandoverId }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }).catch((error) => {
        console.error('Error generating QR code:', error);
      });
    }
  }, [value, size]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas 
        ref={canvasRef} 
        data-handover-id={dataHandoverId}
      />
    </div>
  );
};
