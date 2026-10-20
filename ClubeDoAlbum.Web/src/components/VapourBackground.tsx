import React, { useEffect, useRef } from 'react';

interface VapourBackgroundProps {
  intensity?: 'subtle' | 'medium' | 'high';
  showParticles?: boolean;
}

export const VapourBackground: React.FC<VapourBackgroundProps> = ({
  intensity = 'medium',
  showParticles = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for reactive vapor drift
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovering: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Ambient vapor clouds (blobs of smooth gradient drifting through Perlin-like motion)
    const clouds = [
      { x: width * 0.25, y: height * 0.2, vx: 0.18, vy: 0.12, radius: 450, color: 'rgba(225, 29, 72, 0.075)', baseRadius: 450 },
      { x: width * 0.75, y: height * 0.35, vx: -0.15, vy: 0.16, radius: 520, color: 'rgba(159, 18, 57, 0.06)', baseRadius: 520 },
      { x: width * 0.5, y: height * 0.75, vx: 0.12, vy: -0.14, radius: 600, color: 'rgba(88, 28, 135, 0.05)', baseRadius: 600 },
      { x: width * 0.85, y: height * 0.8, vx: -0.14, vy: -0.11, radius: 480, color: 'rgba(217, 119, 6, 0.04)', baseRadius: 480 },
      { x: width * 0.15, y: height * 0.65, vx: 0.16, vy: 0.13, radius: 420, color: 'rgba(244, 63, 94, 0.05)', baseRadius: 420 },
    ];

    // Atmospheric micro-particles (smoke wisps / ash embers)
    const particleCount = showParticles ? 38 : 0;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.3, // gently rising like vapor smoke
      size: 1 + Math.random() * 2.2,
      alpha: 0.1 + Math.random() * 0.35,
      life: Math.random() * 100,
      maxLife: 60 + Math.random() * 100,
      color: Math.random() > 0.4 ? 'rgba(255, 255, 255,' : 'rgba(244, 63, 94,',
    }));

    let time = 0;

    const render = () => {
      time += 0.008;

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw drifting vapor clouds
      clouds.forEach((cloud, i) => {
        cloud.x += cloud.vx + Math.sin(time + i) * 0.25;
        cloud.y += cloud.vy + Math.cos(time * 0.8 + i) * 0.25;

        // Wrap around boundaries
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius;
        if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius;

        // Subtle mouse repulsion/attraction
        const dx = mouse.x - cloud.x;
        const dy = mouse.y - cloud.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 600 && mouse.isHovering) {
          cloud.x -= (dx / dist) * 0.6;
          cloud.y -= (dy / dist) * 0.6;
        }

        const pulse = Math.sin(time * 1.2 + i * 1.5) * 40;
        const currentRadius = Math.max(100, cloud.baseRadius + pulse);

        const gradient = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          currentRadius
        );
        gradient.addColorStop(0, cloud.color);
        gradient.addColorStop(0.5, cloud.color.replace(/[\d.]+\)$/, '0.02)'));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw rising smoke & ember particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time * 2 + p.y * 0.01) * 0.25;
        p.y += p.vy;
        p.life += 0.25;

        // Mouse wake effect
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          p.x -= (dx / dist) * 1.2;
          p.y -= (dy / dist) * 1.2;
        }

        if (p.y < -10 || p.life >= p.maxLife) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.life = 0;
        }

        const fade = Math.sin((p.life / p.maxLife) * Math.PI);
        ctx.fillStyle = `${p.color} ${p.alpha * fade})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, showParticles]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none">
      {/* Dynamic Vapour Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90 transition-opacity duration-1000"
      />

      {/* Subtle Radial Vignette to keep content readable */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,#06070a_92%]" />

      {/* Micro-grid overlay inspired by Linear & Lambda AI */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
