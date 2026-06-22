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
        <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-radial from-accent/20 via-accent/8 to-transparent blur-[100px] pointer-events-none opacity-[0.18] animate-aurora-slow" />
        
        {/* Top Right: Secondary floating glow */}
        <div className="absolute top-[-10%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-radial from-violet/20 via-violet/8 to-transparent blur-[100px] pointer-events-none opacity-[0.14] animate-aurora-delayed" />
        
        {/* Bottom Center: Soft ambient glow */}
        <div className="absolute bottom-[-20%] left-[50%] -translate-x-1/2 w-[75vw] h-[75vw] rounded-full bg-radial from-cyan/18 via-cyan/6 to-transparent blur-[120px] pointer-events-none opacity-[0.16] animate-aurora-fast" />

        {/* Mid-page: Extra accent glow for depth */}
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-radial from-violet/12 via-accent/4 to-transparent blur-[140px] pointer-events-none opacity-[0.10] animate-aurora-delayed" />
      </div>

      {/* Layer 2: Dot-Grid Pattern (Light AI/SaaS style grid with intersections, net opacity 3-5%) */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none select-none"
        style={{
          backgroundImage: isDark 
            ? `radial-gradient(rgba(129, 140, 248, 0.18) 1.2px, transparent 1.2px), 
               linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px), 
               linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px)`
            : `radial-gradient(rgba(99, 102, 241, 0.15) 1.2px, transparent 1.2px), 
               linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), 
               linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Layer 3: Noise Texture (Subtle grain overlay, 2-3% opacity) */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Layer 4: Route-Specific Ambient Glows */}
      <div className="absolute inset-0 z-[4]" style={parallaxStyle}>
        {/* Dashboard: Soft glow behind analytics section */}
        {path.startsWith('/student/dashboard') && (
          <div className="absolute top-[25%] left-[50%] -translate-x-1/2 w-[70vw] h-[500px] rounded-full bg-radial from-accent/12 via-cyan/4 to-transparent blur-[100px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Interview Module: Spotlight behind AI avatar */}
        {(path.includes('/interview') || path.includes('/interview_simulator')) && (
          <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[50vw] h-[400px] rounded-full bg-radial from-violet/14 via-accent/4 to-transparent blur-[90px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Task Dashboard: Glow around active task area */}
        {path.startsWith('/kanban') && (
          <div className="absolute top-[30%] left-[30%] w-[55vw] h-[450px] rounded-full bg-radial from-accent/10 via-violet/3 to-transparent blur-[110px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* Recruiter Dashboard: Ambient glow behind candidate analytics */}
        {path.startsWith('/recruiter') && (
          <div className="absolute top-[20%] left-[60%] -translate-x-1/2 w-[60vw] h-[450px] rounded-full bg-radial from-cyan/12 via-accent/4 to-transparent blur-[100px] pointer-events-none transition-opacity duration-1000" />
        )}
        
        {/* College Dashboard: Soft glow behind statistics section */}
        {path.startsWith('/college') && (
          <div className="absolute top-[25%] left-[40%] w-[65vw] h-[500px] rounded-full bg-radial from-emerald/10 via-accent/3 to-transparent blur-[120px] pointer-events-none transition-opacity duration-1000" />
        )}

        {/* Skill Gap: Purple-cyan analytics glow */}
        {path.startsWith('/skill_gap') && (
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[65vw] h-[450px] rounded-full bg-radial from-violet/14 via-cyan/4 to-transparent blur-[110px] pointer-events-none transition-opacity duration-1000" />
        )}

        {/* Profile / Career Coach: Warm accent glow */}
        {(path.startsWith('/career_coach') || path.startsWith('/profile')) && (
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60vw] h-[400px] rounded-full bg-radial from-amber/8 via-accent/4 to-transparent blur-[120px] pointer-events-none transition-opacity duration-1000" />
        )}
      </div>

      {/* Hero Section Enhancement: Large blurred top glow behind page titles (5% opacity) */}
      {['/student/dashboard', '/skill_gap', '/my-career', '/dashboard/interview'].some(p => path.startsWith(p)) && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[250px] rounded-full bg-radial from-accent/5 via-violet/2 to-transparent blur-[90px] pointer-events-none transition-opacity duration-1000 z-[1]"
          style={parallaxStyle}
        />
      )}

      {/* Layer 5: Premium SVG Vector Wave Paths (Curved design lines for visual interest) */}
      <div className="absolute inset-0 z-[5]" style={parallaxStyle}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 C300,450 600,100 1200,350 C1600,500 1800,200 2200,450" fill="none" stroke="url(#gradient-line-1)" strokeWidth="1.5" />
          <path d="M-50,350 C500,150 700,600 1300,250 C1700,400 1900,100 2300,350" fill="none" stroke="url(#gradient-line-2)" strokeWidth="1" strokeDasharray="6 6" />
          <defs>
            <linearGradient id="gradient-line-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="gradient-line-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Interactive Spotlight Glow Overlay (Completely CSS computed, 0% CPU overhead) */}
      <div 
        className="absolute inset-0 z-[6]"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${
            isDark ? 'rgba(129, 140, 248, 0.10)' : 'rgba(99, 102, 241, 0.07)'
          }, transparent 80%)`,
        }}
      />

      {/* Canvas particles representing Neural Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[6] opacity-70" />
    </div>
  );
}
