import { useEffect, useRef } from 'react';
import './CostumeAvatar.css';

export default function CostumeAvatar({ isSpeaking }) {
  const canvasRef = useRef(null);
  const animationId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 200;
    const height = canvas.height = 200;
    const centerY = height / 2;

    const drawCostumeWave = () => {
      // Dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      
      // Yellow costume waveform
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFD700'; // Golden yellow
      ctx.beginPath();
      
      if (isSpeaking) {
        // Animated bars with costume effect
        const barCount = 16;
        const barWidth = width / barCount;
        const maxHeight = 60;
        
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + barWidth/2;
          const barHeight = Math.random() * maxHeight + 20;
          const yTop = centerY - barHeight/2;
          const yBottom = centerY + barHeight/2;
          
          // Draw vertical bar with costume-like ends
          ctx.moveTo(x, yTop);
          ctx.lineTo(x, yBottom);
          
          // Draw decorative top and bottom caps
          ctx.moveTo(x - 4, yTop);
          ctx.lineTo(x + 4, yTop);
          ctx.moveTo(x - 4, yBottom);
          ctx.lineTo(x + 4, yBottom);
        }
      } else {
        // Idle state - simple horizontal line
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
      }
      
      ctx.stroke();
      animationId.current = requestAnimationFrame(drawCostumeWave);
    };

    drawCostumeWave();

    return () => {
      cancelAnimationFrame(animationId.current);
    };
  }, [isSpeaking]);

  return (
    <div className="costume-avatar-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
