import { useEffect, useRef } from 'react';
import './WaveformAvatar.css';

export default function WaveformAvatar({ isSpeaking }) {
  const canvasRef = useRef(null);
  const animationId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 200;
    const height = canvas.height = 200;
    const centerY = height / 2;

    const drawWaveform = () => {
      // Clear canvas
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, width, height);
      
      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSpeaking ? '#1a73e8' : '#cccccc';
      ctx.beginPath();
      
      // Generate random waveform when speaking
      if (isSpeaking) {
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x += 10) {
          const amplitude = Math.random() * 40;
          ctx.lineTo(x, centerY + amplitude);
        }
      } else {
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
      }
      
      ctx.stroke();
      animationId.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      cancelAnimationFrame(animationId.current);
    };
  }, [isSpeaking]);

  return (
    <div className="waveform-avatar-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
