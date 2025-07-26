import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Web3-themed colors
    const colors = [
      'rgba(41, 121, 255, 0.5)',  // Ethereum blue
      'rgba(78, 204, 163, 0.5)',  // Polygon green
      'rgba(237, 108, 57, 0.5)',  // Arbitrum orange
      'rgba(130, 71, 255, 0.5)',  // Optimism purple
      'rgba(255, 56, 139, 0.5)',  // Solana pink
    ];

    // Floating objects
    const objects: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create initial objects
    for (let i = 0; i < 15; i++) {
      objects.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.02 - 0.01
      });
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(200, 200, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw floating objects
      objects.forEach(obj => {
        // Update position
        obj.x += obj.speedX;
        obj.y += obj.speedY;
        obj.rotation += obj.rotationSpeed;

        // Boundary check
        if (obj.x < -obj.size) obj.x = canvas.width + obj.size;
        if (obj.x > canvas.width + obj.size) obj.x = -obj.size;
        if (obj.y < -obj.size) obj.y = canvas.height + obj.size;
        if (obj.y > canvas.height + obj.size) obj.y = -obj.size;

        // Draw object with glow effect
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);

        // Glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.size * 1.5);
        gradient.addColorStop(0, obj.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // Draw different shapes
        if (Math.random() > 0.7) {
          // Hexagon (blockchain-like)
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const x = obj.size * Math.cos(angle);
            const y = obj.size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        } else {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, obj.size, 0, Math.PI * 2);
        }

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });

      // Draw subtle connection lines between close objects
      ctx.strokeStyle = 'rgba(200, 200, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          const dx = objects[i].x - objects[j].x;
          const dy = objects[i].y - objects[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(objects[i].x, objects[i].y);
            ctx.lineTo(objects[j].x, objects[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-blue-50/30 pointer-events-none" />
    </div>
  );
};

export default Background;