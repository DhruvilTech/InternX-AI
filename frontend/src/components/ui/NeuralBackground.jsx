import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// ─── Page Mode Detection ───────────────────────────────────────────────────
function getPageMode(pathname) {
  if (pathname.startsWith('/student/dashboard') || pathname.startsWith('/college/dashboard') ||
      pathname.startsWith('/recruiter/dashboard') || pathname.startsWith('/admin/dashboard') ||
      pathname === '/dashboard') return 'dashboard';
  if (pathname.startsWith('/skill_gap')) return 'skill';
  if (pathname.includes('/interview')) return 'interview';
  if (pathname.startsWith('/generator') || pathname.startsWith('/company')) return 'generator';
  if (pathname.startsWith('/career')) return 'career';
  if (pathname.startsWith('/kanban') || pathname.startsWith('/task')) return 'task';
  if (pathname.startsWith('/analytics') || pathname.startsWith('/college/skills')) return 'analytics';
  if (pathname === '/' || pathname === '/landing') return 'landing';
  return 'default';
}

// ─── Page Mode Colors ──────────────────────────────────────────────────────
const MODE_PALETTES = {
  dashboard:  { primary: [129, 140, 248], secondary: [34, 211, 238],  accent: [139, 92, 246], activity: 1.4 },
  skill:      { primary: [34,  211, 238], secondary: [52,  211, 153], accent: [129, 140, 248], activity: 1.1 },
  interview:  { primary: [139,  92, 246], secondary: [129, 140, 248], accent: [251, 113, 133], activity: 1.2 },
  generator:  { primary: [129, 140, 248], secondary: [251, 191, 36],  accent: [34,  211, 238], activity: 1.6 },
  career:     { primary: [52,  211, 153], secondary: [34,  211, 238], accent: [129, 140, 248], activity: 1.0 },
  task:       { primary: [129, 140, 248], secondary: [139,  92, 246], accent: [34,  211, 238], activity: 1.3 },
  analytics:  { primary: [34,  211, 238], secondary: [129, 140, 248], accent: [52,  211, 153], activity: 1.2 },
  landing:    { primary: [129, 140, 248], secondary: [34,  211, 238], accent: [139,  92, 246], activity: 0.9 },
  default:    { primary: [129, 140, 248], secondary: [139,  92, 246], accent: [34,  211, 238], activity: 0.8 },
};

// ─── Easing ────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

export default function NeuralBackground() {
  const canvasRef    = useRef(null);
  const stateRef     = useRef(null);
  const rafRef       = useRef(null);
  const location     = useLocation();
  const modeRef      = useRef('default');
  const { activeTheme } = useTheme();
  const themeRef     = useRef(activeTheme);

  // ─── Build / Rebuild the neural world ─────────────────────────────────
  const buildWorld = useCallback((canvas, width, height, mode) => {
    const palette  = MODE_PALETTES[mode] || MODE_PALETTES.default;
    const activity = palette.activity;

    // ── Layer 1 – Far background network (blurred, slow) ──────────────
    const FAR_COUNT  = Math.min(60, Math.floor((width * height) / 22000));
    const farNodes   = [];
    for (let i = 0; i < FAR_COUNT; i++) {
      farNodes.push({
        x:   Math.random() * width,
        y:   Math.random() * height,
        vx:  (Math.random() - 0.5) * 0.12 * activity,
        vy:  (Math.random() - 0.5) * 0.12 * activity,
        r:   Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
      });
    }

    // ── Layer 2 – Mid network (main visible layer) ─────────────────────
    const MID_COUNT  = Math.min(90, Math.floor((width * height) / 14000));
    const midNodes   = [];
    for (let i = 0; i < MID_COUNT; i++) {
      midNodes.push({
        x:        Math.random() * width,
        y:        Math.random() * height,
        vx:       (Math.random() - 0.5) * 0.22 * activity,
        vy:       (Math.random() - 0.5) * 0.22 * activity,
        r:        Math.random() * 2 + 1,
        pulse:    Math.random() * Math.PI * 2,
        pulseSpeed:0.015 + Math.random() * 0.02,
        glow:     Math.random() < 0.15,  // some nodes are brighter "hubs"
        hubR:     Math.random() * 4 + 3, // hub radius if hub
        lastActivation: 0,
        activationTimer: 600 + Math.random() * 1200, // frames between pulses
        activationFrame: 0,
      });
    }

    // ── Layer 3 – Data streams (information particles on edges) ────────
    const MAX_STREAMS = 30;
    const streams     = [];

    // ── Cursor state ───────────────────────────────────────────────────
    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    // ── Scroll offset ──────────────────────────────────────────────────
    const scroll = { y: 0, ty: 0 };

    // ── Palette (can transition) ───────────────────────────────────────
    const pal = {
      primary:   [...palette.primary],
      secondary: [...palette.secondary],
      accent:    [...palette.accent],
      tPrimary:  [...palette.primary],
      tSecondary:[...palette.secondary],
      tAccent:   [...palette.accent],
    };

    return { farNodes, midNodes, streams, mouse, scroll, pal, activity, width, height, frame: 0, MAX_STREAMS };
  }, []);

  // ─── Spawn a data stream between two nodes ─────────────────────────────
  const spawnStream = (state, fromNode, toNode) => {
    if (state.streams.length >= state.MAX_STREAMS) return;
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    state.streams.push({
      fromX: fromNode.x, fromY: fromNode.y,
      toX:   toNode.x,   toY:   toNode.y,
      t:     0,
      speed: 0.004 + Math.random() * 0.006,
      size:  Math.random() * 1.5 + 0.5,
      done:  false,
    });
  };

  // ─── Main draw loop ────────────────────────────────────────────────────
  const drawFrame = useCallback((ctx, state) => {
    const { width, height, farNodes, midNodes, streams, mouse, scroll, pal, activity } = state;
    const frame = ++state.frame;

    // Smooth cursor & scroll
    mouse.x  = lerp(mouse.x,  mouse.tx,  0.07);
    mouse.y  = lerp(mouse.y,  mouse.ty,  0.07);
    scroll.y = lerp(scroll.y, scroll.ty, 0.04);

    // Smooth palette transition
    for (let i = 0; i < 3; i++) {
      pal.primary[i]   = lerp(pal.primary[i],   pal.tPrimary[i],   0.008);
      pal.secondary[i] = lerp(pal.secondary[i], pal.tSecondary[i], 0.008);
      pal.accent[i]    = lerp(pal.accent[i],    pal.tAccent[i],    0.008);
    }

    const p = pal.primary;
    const s = pal.secondary;
    const a = pal.accent;

    // ── Background ──────────────────────────────────────────────────────
    ctx.clearRect(0, 0, width, height);
    const isLight = themeRef.current === 'light';
    ctx.fillStyle = isLight ? '#f4f7ff' : '#050814';
    ctx.fillRect(0, 0, width, height);

    // Very subtle blueprint grid
    ctx.save();
    ctx.strokeStyle = isLight
      ? `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.08)`
      : `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.025)`;
    ctx.lineWidth   = 0.5;
    const gSize     = 80;
    for (let x = 0; x < width; x += gSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = -height + (scroll.y * 0.15) % gSize; y < height; y += gSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();

    // ── FAR LAYER (blurred, low opacity) ──────────────────────────────
    ctx.save();
    ctx.globalAlpha = isLight ? 0.25 : 0.35;
    for (let i = 0; i < farNodes.length; i++) {
      const n = farNodes[i];
      n.x += n.vx;
      n.y += n.vy + scroll.y * 0.0015;
      if (n.x < -50) n.x = width + 50;
      if (n.x > width + 50) n.x = -50;
      if (n.y < -50) n.y = height + 50;
      if (n.y > height + 50) n.y = -50;
      n.pulse += n.pulseSpeed;

      const glow = 0.3 + Math.sin(n.pulse) * 0.15;

      // Draw far connections
      for (let j = i + 1; j < farNodes.length; j++) {
        const n2 = farNodes[j];
        const dx = n.x - n2.x, dy = n.y - n2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          const alpha = (1 - dist / 200) * 0.08;
          ctx.strokeStyle = `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }

      // Draw far node
      ctx.fillStyle = `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${glow * 0.4})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── MID LAYER (main network) ──────────────────────────────────────
    const mxDist = 180;
    const connAlphaBase = isLight ? 0.22 : 0.18;

    for (let i = 0; i < midNodes.length; i++) {
      const n = midNodes[i];
      n.x += n.vx;
      n.y += n.vy + scroll.y * 0.003;
      if (n.x < -80) n.x = width + 80;
      if (n.x > width + 80) n.x = -80;
      if (n.y < -80) n.y = height + 80;
      if (n.y > height + 80) n.y = -80;
      n.pulse += n.pulseSpeed;

      // Mouse influence — nearby nodes drift toward cursor
      const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist < 200) {
        const force = (1 - mdist / 200) * 0.015;
        n.vx += mdx * force * 0.001;
        n.vy += mdy * force * 0.001;
      }

      // Dampen velocity
      n.vx *= 0.995;
      n.vy *= 0.995;

      // Node activation timer
      n.activationFrame++;
      if (n.activationFrame > n.activationTimer) {
        n.lastActivation = frame;
        n.activationFrame = 0;
        n.activationTimer = 400 + Math.random() * 1000;

        // Spawn a stream from this activated node to a nearby node
        for (let j = 0; j < midNodes.length; j++) {
          if (i === j) continue;
          const dx2 = n.x - midNodes[j].x, dy2 = n.y - midNodes[j].y;
          if (Math.hypot(dx2, dy2) < mxDist * 0.9) {
            spawnStream(state, n, midNodes[j]);
            break;
          }
        }
      }

      const activationAge = frame - n.lastActivation;
      const isActive = activationAge < 60;
      const activationPulse = isActive ? Math.max(0, 1 - activationAge / 60) : 0;

      // Draw connections
      for (let j = i + 1; j < midNodes.length; j++) {
        const n2 = midNodes[j];
        const dx = n.x - n2.x, dy = n.y - n2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mxDist) {
          const alpha = (1 - dist / mxDist) * connAlphaBase;

          // Mouse proximity highlights connection
          const midX = (n.x + n2.x) / 2, midY = (n.y + n2.y) / 2;
          const mouseDistToEdge = Math.hypot(mouse.x - midX, mouse.y - midY);
          const mouseBoost = mouseDistToEdge < 130 ? (1 - mouseDistToEdge / 130) * 0.35 : 0;

          // Use secondary color for some connections
          const useSecondary = (i + j) % 5 === 0;
          const c = useSecondary ? s : p;
          const finalAlpha = Math.min(0.55, alpha + mouseBoost + activationPulse * 0.4);

          ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${finalAlpha})`;
          ctx.lineWidth   = 0.6 + mouseBoost * 1.2 + activationPulse * 0.8;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }

      // Draw node
      const pulseFactor = 0.7 + Math.sin(n.pulse) * 0.3;
      const mouseProx = mdist < 120 ? (1 - mdist / 120) * 0.8 : 0;
      const nodeAlpha = pulseFactor * 0.6 + mouseProx + activationPulse;

      if (n.glow) {
        // Hub node — glowing ring + core
        ctx.save();
        const hubGradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.hubR * 3);
        hubGradient.addColorStop(0, `rgba(${a[0]}, ${a[1]}, ${a[2]}, ${Math.min(0.9, nodeAlpha * 0.8)})`);
        hubGradient.addColorStop(0.4, `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${Math.min(0.5, nodeAlpha * 0.4)})`);
        hubGradient.addColorStop(1, `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0)`);
        ctx.fillStyle = hubGradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hubR * 3, 0, Math.PI * 2);
        ctx.fill();
        // Core dot
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, nodeAlpha * 0.9)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hubR * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Regular node
        const nodeGradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.5);
        nodeGradient.addColorStop(0, `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${Math.min(0.9, nodeAlpha)})`);
        nodeGradient.addColorStop(1, `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0)`);
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, nodeAlpha * 0.7)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── DATA STREAMS (Layer 5 — particles moving along connections) ───
    for (let i = streams.length - 1; i >= 0; i--) {
      const st = streams[i];
      st.t += st.speed;
      if (st.t >= 1) { st.done = true; continue; }

      const x = lerp(st.fromX, st.toX, st.t);
      const y = lerp(st.fromY, st.toY, st.t);

      // Trail
      const trailLen = 8;
      for (let k = 0; k < trailLen; k++) {
        const trailT = Math.max(0, st.t - k * 0.015);
        const tx2 = lerp(st.fromX, st.toX, trailT);
        const ty2 = lerp(st.fromY, st.toY, trailT);
        const trailAlpha = (1 - k / trailLen) * 0.6;
        const trailSize  = st.size * (1 - k / trailLen);
        ctx.fillStyle = `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(tx2, ty2, Math.max(0.3, trailSize), 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, st.size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Glow around head
      const headGrad = ctx.createRadialGradient(x, y, 0, x, y, st.size * 5);
      headGrad.addColorStop(0, `rgba(${s[0]}, ${s[1]}, ${s[2]}, 0.5)`);
      headGrad.addColorStop(1, `rgba(${s[0]}, ${s[1]}, ${s[2]}, 0)`);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(x, y, st.size * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Remove finished streams
    for (let i = streams.length - 1; i >= 0; i--) {
      if (streams[i].done) streams.splice(i, 1);
    }

    // ── Cursor spotlight (volumetric-style) ─────────────────────────
    const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
    spotGrad.addColorStop(0,   `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.06)`);
    spotGrad.addColorStop(0.5, `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.02)`);
    spotGrad.addColorStop(1,   `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0)`);
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 280, 0, Math.PI * 2);
    ctx.fill();

    // ── Edge vignette (depth, framing) ────────────────────────────────
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, height * 0.9);
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, isLight ? 'rgba(220, 228, 248, 0.6)' : 'rgba(3, 5, 16, 0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // ── Page-mode specific overlays ────────────────────────────────────
    if (modeRef.current === 'interview') {
      // Subtle waveform at bottom
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = `rgba(${a[0]}, ${a[1]}, ${a[2]}, 1)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveY = height * 0.75;
      for (let x = 0; x < width; x += 2) {
        const y2 = waveY + Math.sin((x * 0.015) + frame * 0.04) * 18
                         + Math.sin((x * 0.008) + frame * 0.025) * 28;
        x === 0 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (modeRef.current === 'generator') {
      // Pulse rings from center — "generation" effect
      ctx.save();
      ctx.globalAlpha = 0.04;
      const pulseRadius = ((frame * 1.2) % 400);
      const pulseAlpha  = Math.max(0, 1 - pulseRadius / 400);
      ctx.strokeStyle = `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${pulseAlpha})`;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      const pulseRadius2 = ((frame * 1.2 + 200) % 400);
      const pulseAlpha2  = Math.max(0, 1 - pulseRadius2 / 400);
      ctx.strokeStyle = `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${pulseAlpha2})`;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseRadius2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  // ─── Main effect: setup canvas + start loop ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mode = getPageMode(location.pathname);
    modeRef.current = mode;
    stateRef.current = buildWorld(canvas, width, height, mode);

    // ── Resize ──────────────────────────────────────────────────────────
    const onResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const newState = buildWorld(canvas, width, height, modeRef.current);
      // Keep mouse position
      newState.mouse.x = newState.mouse.tx = stateRef.current.mouse.tx;
      newState.mouse.y = newState.mouse.ty = stateRef.current.mouse.ty;
      stateRef.current = newState;
    };

    // ── Mouse ────────────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      if (!stateRef.current) return;
      stateRef.current.mouse.tx = e.clientX;
      stateRef.current.mouse.ty = e.clientY;
    };

    // ── Scroll ───────────────────────────────────────────────────────────
    const onScroll = () => {
      if (!stateRef.current) return;
      stateRef.current.scroll.ty = window.scrollY * 0.03;
    };

    // ── Animation loop ────────────────────────────────────────────────────
    const loop = () => {
      if (document.hidden) { rafRef.current = requestAnimationFrame(loop); return; }
      drawFrame(ctx, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('resize',    onResize,    { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll',    onScroll,    { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll',    onScroll);
    };
  }, [buildWorld, drawFrame]);

  // ─── React to page changes — transition palette & behavior ─────────────
  useEffect(() => {
    const mode    = getPageMode(location.pathname);
    modeRef.current = mode;

    if (!stateRef.current) return;
    const palette = MODE_PALETTES[mode] || MODE_PALETTES.default;
    const { pal } = stateRef.current;

    // Set target palette — smoothly interpolated in draw loop
    pal.tPrimary   = [...palette.primary];
    pal.tSecondary = [...palette.secondary];
    pal.tAccent    = [...palette.accent];

    // Adjust node velocities for the new activity level
    const ratio = palette.activity / stateRef.current.activity;
    stateRef.current.activity = palette.activity;
    stateRef.current.midNodes.forEach(n => {
      n.vx *= ratio;
      n.vy *= ratio;
      n.activationTimer = Math.max(200, n.activationTimer / ratio);
    });
    stateRef.current.farNodes.forEach(n => {
      n.vx *= ratio;
      n.vy *= ratio;
    });
  }, [location.pathname]);

  // ─── Sync theme ref so draw loop picks it up without re-mounting ──────────
  useEffect(() => {
    themeRef.current = activeTheme;
  }, [activeTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
    />
  );
}
