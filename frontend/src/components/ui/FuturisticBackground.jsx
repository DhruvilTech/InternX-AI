import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';

export default function FuturisticBackground() {
  const { isDark } = useTheme();
  const location = useLocation();
  const path = location.pathname;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Track scroll for subtle parallax
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Parallax translation styling (5-10px maximum smooth scroll displacement)
  const parallaxStyle = {
    transform: `translateY(${Math.min(10, scrollY * 0.02)}px)`,
    transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: 'transform',
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-[0] bg-void overflow-hidden transition-colors duration-700"
      style={{
        '--mouse-x': '50vw',
        '--mouse-y': '50vh',
      }}
    >
      {/* Layer 1: Animated Aurora Gradients (Radial colors shifting on CSS GPU keyframes, 5-8% opacity) */}
      <div 
        className="absolute inset-0 z-[1] dark:mix-blend-normal mix-blend-screen"
        style={parallaxStyle}
      >
        {/* Top Left: Large floating glow */}
        <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-radial from-accent/15 via-accent/5 to-transparent blur-[120px] pointer-events-none opacity-[0.06] animate-aurora-slow" />
        
        {/* Top Right: Secondary floating glow */}
        <div className="absolute top-[-15%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-radial from-violet/15 via-violet/5 to-transparent blur-[120px] pointer-events-none opacity-[0.05] animate-aurora-delayed" />
        
        {/* Bottom Center: Soft ambient glow */}
        <div className="absolute bottom-[-25%] left-[50%] -translate-x-1/2 w-[70vw] h-[70vw] rounded-full bg-radial from-cyan/15 via-cyan/5 to-transparent blur-[140px] pointer-events-none opacity-[0.06] animate-aurora-fast" />
      </div>

      {/* Layer 2: Subtle Grid Pattern (Light AI/SaaS style grid, net opacity 2-4% - barely visible) */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none select-none opacity-[0.03]"
        style={{
          backgroundImage: isDark 
            ? `linear-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.8) 1px, transparent 1px)`
            : `linear-gradient(rgba(15, 23, 42, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.8) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Layer 3: Noise Texture (Subtle grain overlay, 1-2% opacity) */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none mix-blend-overlay opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 4: Route-Specific Ambient Glows */}
      <div className="absolute inset-0 z-[4]" style={parallaxStyle}>
        {/* Dashboard: Soft glow behind analytics section */}
        {path.startsWith('/student/dashboard') && (
          <div className="absolute top-[25%] left-[50%] -translate-x-1/2 w-[60vw] h-[400px] rounded-full bg-radial from-accent/8 via-cyan/2 to-transparent blur-[120px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Interview Module: Very subtle spotlight behind AI avatar */}
        {(path.includes('/interview') || path.includes('/interview_simulator')) && (
          <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[45vw] h-[350px] rounded-full bg-radial from-violet/8 via-accent/2 to-transparent blur-[100px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Task Dashboard: Subtle glow around active task area */}
        {path.startsWith('/kanban') && (
          <div className="absolute top-[30%] left-[30%] w-[50vw] h-[400px] rounded-full bg-radial from-accent/6 via-violet/2 to-transparent blur-[120px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Recruiter Dashboard: Ambient glow behind candidate analytics */}
        {path.startsWith('/recruiter') && (
          <div className="absolute top-[20%] left-[60%] -translate-x-1/2 w-[55vw] h-[400px] rounded-full bg-radial from-cyan/8 via-accent/2 to-transparent blur-[110px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* College Dashboard: Soft glow behind statistics section */}
        {path.startsWith('/college') && (
          <div className="absolute top-[25%] left-[40%] w-[60vw] h-[450px] rounded-full bg-radial from-emerald/6 via-accent/2 to-transparent blur-[130px] pointer-events-none transition-opacity duration-1000" />
        )}
      </div>

      {/* Hero Section Enhancement: Large blurred top glow behind page titles (5% opacity) */}
      {['/student/dashboard', '/skill_gap', '/my-career', '/dashboard/interview'].some(p => path.startsWith(p)) && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[250px] rounded-full bg-radial from-accent/5 via-violet/2 to-transparent blur-[90px] pointer-events-none transition-opacity duration-1000 z-[1]"
          style={parallaxStyle}
        />
      )}

      {/* Interactive Spotlight Glow Overlay (Completely CSS computed, 0% CPU overhead) */}
      <div 
        className="absolute inset-0 z-[5]"
        style={{
          background: `radial-gradient(550px circle at var(--mouse-x) var(--mouse-y), ${
            isDark ? 'rgba(129, 140, 248, 0.08)' : 'rgba(99, 102, 241, 0.05)'
          }, transparent 80%)`,
        }}
      />

      {/* Canvas particles representing Neural Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[6] opacity-70" />
    </div>
  );
}
