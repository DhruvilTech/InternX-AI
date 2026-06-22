import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function FuturisticBackground() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Track mouse coordinates for CSS Spotlight Glow
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let animationFrameId = null;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    // Smooth interpolation (lerp) for cursor glow positioning
    const updateGlowPosition = () => {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;
      
      container.style.setProperty('--mouse-x', `${mouseX}px`);
      container.style.setProperty('--mouse-y', `${mouseY}px`);
      
      animationFrameId = requestAnimationFrame(updateGlowPosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateGlowPosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Neural Network Canvas Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Sparse particle setup (GPU optimized)
    const particleCount = Math.min(45, Math.floor((width * height) / 35000));
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    // Animation Loop
    const draw = () => {
      // Pause animation if browser tab is hidden to save CPU/GPU resources
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render theme-based grid lines
      const lineColor = isDark ? 'rgba(129, 140, 248, 0.05)' : 'rgba(99, 102, 241, 0.08)';
      const nodeColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.2)';

      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;

      // Update & Draw nodes
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-[0] bg-void overflow-hidden transition-colors duration-700"
      style={{
        '--mouse-x': '50vw',
        '--mouse-y': '50vh',
      }}
    >
      {/* 1. Animated Aurora Gradients (Radial colors shifting on CSS GPU keyframes) */}
      <div className="absolute inset-0 z-[1] opacity-40 mix-blend-screen dark:mix-blend-normal">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-radial from-accent/15 via-accent/5 to-transparent blur-[120px] animate-aurora-slow" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[90vw] h-[90vw] rounded-full bg-radial from-violet/10 via-violet/3 to-transparent blur-[140px] animate-aurora-delayed" />
        <div className="absolute top-[30%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-radial from-cyan/8 via-cyan/2 to-transparent blur-[100px] animate-aurora-fast" />
      </div>

      {/* 2. Interactive Spotlight Glow Overlay (Completely CSS computed, 0% CPU overhead) */}
      <div 
        className="absolute inset-0 z-[2]"
        style={{
          background: `radial-gradient(550px circle at var(--mouse-x) var(--mouse-y), ${
            isDark ? 'rgba(129, 140, 248, 0.08)' : 'rgba(99, 102, 241, 0.05)'
          }, transparent 80%)`,
        }}
      />

      {/* 3. AI HUD Grid Lines (Hardware-accelerated CSS Grid Pattern) */}
      <div 
        className={`absolute inset-0 z-[3] opacity-[0.25] ${isDark ? 'bg-grid-dark' : 'bg-grid-light'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15, 23, 42, 0.035)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15, 23, 42, 0.035)'} 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 4. Canvas particles representing Neural Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[4] opacity-70" />
    </div>
  );
}
