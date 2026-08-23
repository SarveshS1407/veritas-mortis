"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { forensicAudio } from "../../lib/forensicAudio";

interface RealisticFluidBloodCanvasProps {
  className?: string;
  enableClickSplatter?: boolean;
}

interface ClotSplatter {
  cx: number;
  cy: number;
  radius: number;
  points: Array<{ x: number; y: number }>;
  spines: Array<{ x1: number; y1: number; x2: number; y2: number; w: number }>;
  satellites: Array<{ x: number; y: number; r: number; o: number }>;
}

interface ViscousDrip {
  startX: number;
  startY: number;
  currentY: number;
  targetLength: number;
  speed: number;
  width: number;
  drift: number;
  driftFreq: number;
  isComplete: boolean;
  points: Array<{ x: number; y: number; w: number }>;
  delay: number;
  elapsed: number;
}

interface DynamicSplash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
}

export default function RealisticFluidBloodCanvas({
  className = "",
  enableClickSplatter = true,
}: RealisticFluidBloodCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const mainSplattersRef = useRef<ClotSplatter[]>([]);
  const dripsRef = useRef<ViscousDrip[]>([]);
  const splashParticlesRef = useRef<DynamicSplash[]>([]);

  // Generate an organic, irregular forensic impact pool
  const createSplatter = (
    cx: number,
    cy: number,
    radius: number,
    spineCount = 6,
    satelliteCount = 16
  ): ClotSplatter => {
    const points: Array<{ x: number; y: number }> = [];
    const numPoints = 16;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius * (0.75 + Math.sin(i * 3) * 0.15 + (Math.random() * 0.3 - 0.15));
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    const spines: Array<{ x1: number; y1: number; x2: number; y2: number; w: number }> = [];
    for (let s = 0; s < spineCount; s++) {
      const angle = (Math.PI * 0.15) + (s / spineCount) * Math.PI * 1.6 + (Math.random() * 0.3 - 0.15);
      const len = radius * (1.3 + Math.random() * 1.8);
      spines.push({
        x1: cx,
        y1: cy,
        x2: cx + Math.cos(angle) * len,
        y2: cy + Math.sin(angle) * len,
        w: 1.2 + Math.random() * 1.8,
      });
    }

    const satellites: Array<{ x: number; y: number; r: number; o: number }> = [];
    for (let m = 0; m < satelliteCount; m++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (1.1 + Math.random() * 2.2);
      satellites.push({
        x: cx + Math.cos(angle) * dist + (Math.random() * 6 - 3),
        y: cy + Math.sin(angle) * dist + (Math.random() * 6 - 3),
        r: 0.8 + Math.random() * (radius * 0.12),
        o: 0.75 + Math.random() * 0.25,
      });
    }

    return { cx, cy, radius, points, spines, satellites };
  };

  const createDrip = (
    startX: number,
    startY: number,
    targetLength: number,
    width: number,
    delay = 0
  ): ViscousDrip => {
    return {
      startX,
      startY,
      currentY: startY,
      targetLength,
      speed: 0.45 + Math.random() * 0.4,
      width,
      drift: (Math.random() - 0.5) * 1.5,
      driftFreq: 0.035,
      isComplete: false,
      points: [{ x: startX, y: startY, w: width }],
      delay,
      elapsed: 0,
    };
  };

  const spawnClickSplatter = useCallback((x: number, y: number) => {
    const newSplat = createSplatter(x, y, 14 + Math.random() * 10, 5, 15);
    mainSplattersRef.current.push(newSplat);

    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = 2 + Math.random() * 5;
      splashParticlesRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel + 0.5,
        r: 0.8 + Math.random() * 1.8,
        life: 0,
        maxLife: 15 + Math.random() * 15,
      });
    }

    dripsRef.current.push(
      createDrip(
        x + (Math.random() * 8 - 4),
        y + 4,
        50 + Math.random() * 90,
        2.2 + Math.random() * 1.4,
        0
      )
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 700;

    // ── CLEAN, FORENSIC CRIME SCENE COMPOSITION ──
    // 1. Primary Arterial Trauma Strike (Top-Right / Stamped Zone)
    // 2. Controlled, Viscous Drips running downward
    const splatters: ClotSplatter[] = [
      createSplatter(w * 0.72, h * 0.16, 28, 8, 28), // Heavy primary impact
      createSplatter(w * 0.82, h * 0.12, 18, 5, 18), // Secondary arterial spray
      createSplatter(w * 0.38, h * 0.22, 16, 4, 14), // Subtle spatter behind title
    ];

    mainSplattersRef.current = splatters;

    // 3 distinct, organic gravity drips flowing from the primary impact points
    const drips: ViscousDrip[] = [
      createDrip(w * 0.71, h * 0.17, 180, 3.4, 0),
      createDrip(w * 0.77, h * 0.15, 230, 2.8, 12),
      createDrip(w * 0.39, h * 0.23, 140, 2.4, 6),
      createDrip(w * 0.83, h * 0.13, 120, 2.0, 24),
    ];

    dripsRef.current = drips;

    // Animation Render Loop
    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // ── 1. DRAW IMPACT SPLATTERS ──
      mainSplattersRef.current.forEach((splat) => {
        ctx.save();

        // Main Clotted Pool
        if (splat.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(splat.points[0].x, splat.points[0].y);
          for (let p = 1; p < splat.points.length; p++) {
            const next = splat.points[(p + 1) % splat.points.length];
            const mx = (splat.points[p].x + next.x) / 2;
            const my = (splat.points[p].y + next.y) / 2;
            ctx.quadraticCurveTo(splat.points[p].x, splat.points[p].y, mx, my);
          }
          ctx.closePath();

          // Authentic Oxidized Coagulated Radial Gradient
          const grad = ctx.createRadialGradient(
            splat.cx,
            splat.cy,
            2,
            splat.cx,
            splat.cy,
            splat.radius * 1.15
          );
          grad.addColorStop(0, "rgba(36, 2, 2, 0.98)"); // Oxidized dark clotted core
          grad.addColorStop(0.6, "rgba(55, 4, 4, 0.95)"); // Deep venous red
          grad.addColorStop(0.9, "rgba(75, 8, 8, 0.88)"); // Fresh arterial border
          grad.addColorStop(1, "rgba(30, 1, 1, 0.92)"); // Edge pooling meniscus

          ctx.fillStyle = grad;
          ctx.fill();

          // Wet specular sheen highlight
          ctx.beginPath();
          ctx.ellipse(
            splat.cx - splat.radius * 0.25,
            splat.cy - splat.radius * 0.25,
            splat.radius * 0.35,
            splat.radius * 0.2,
            -0.25,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "rgba(255, 225, 225, 0.35)";
          ctx.fill();
        }

        // Radiating Spines
        splat.spines.forEach((sp) => {
          ctx.beginPath();
          ctx.moveTo(sp.x1, sp.y1);
          ctx.lineTo(sp.x2, sp.y2);
          ctx.strokeStyle = "rgba(48, 3, 3, 0.94)";
          ctx.lineWidth = sp.w;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sp.x2, sp.y2, sp.w * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(40, 2, 2, 0.96)";
          ctx.fill();
        });

        // Satellite Droplets
        splat.satellites.forEach((sat) => {
          ctx.beginPath();
          ctx.arc(sat.x, sat.y, sat.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45, 3, 3, ${sat.o})`;
          ctx.fill();

          if (sat.r > 2) {
            ctx.beginPath();
            ctx.arc(sat.x - 0.3, sat.y - 0.3, sat.r * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 230, 230, 0.4)";
            ctx.fill();
          }
        });

        ctx.restore();
      });

      // ── 2. DRAW PARTICLES FROM CLICKS ──
      for (let i = splashParticlesRef.current.length - 1; i >= 0; i--) {
        const p = splashParticlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.86;
        p.vy *= 0.86;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45, 2, 2, 0.92)";
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          splashParticlesRef.current.splice(i, 1);
        }
      }

      // ── 3. DRAW VISCOUS GRAVITY DRIPS ──
      dripsRef.current.forEach((drip) => {
        drip.elapsed++;
        if (drip.elapsed < drip.delay) return;

        if (!drip.isComplete) {
          drip.currentY += drip.speed;
          const progress = (drip.currentY - drip.startY) / drip.targetLength;

          const currentX =
            drip.startX + Math.sin((drip.currentY - drip.startY) * drip.driftFreq) * drip.drift * 6;
          const currentW = Math.max(1.2, drip.width * (1 - progress * 0.35));

          drip.points.push({ x: currentX, y: drip.currentY, w: currentW });

          if (drip.currentY >= drip.startY + drip.targetLength) {
            drip.isComplete = true;
          }
        }

        if (drip.points.length > 1) {
          ctx.save();

          // Main Viscous Stream
          ctx.beginPath();
          ctx.moveTo(drip.points[0].x, drip.points[0].y);
          for (let pt = 1; pt < drip.points.length; pt++) {
            ctx.lineTo(drip.points[pt].x, drip.points[pt].y);
          }
          ctx.strokeStyle = "rgba(42, 2, 2, 0.96)";
          ctx.lineWidth = drip.points[drip.points.length - 1].w;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();

          // Specular wet sheen line
          ctx.beginPath();
          ctx.moveTo(drip.points[0].x - 0.3, drip.points[0].y);
          for (let pt = 1; pt < drip.points.length; pt++) {
            ctx.lineTo(drip.points[pt].x - 0.3, drip.points[pt].y);
          }
          ctx.strokeStyle = "rgba(255, 215, 215, 0.32)";
          ctx.lineWidth = Math.max(0.6, drip.points[drip.points.length - 1].w * 0.25);
          ctx.stroke();

          // Teardrop Bulb at tip
          const tip = drip.points[drip.points.length - 1];
          const bulbR = tip.w * 1.35;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, bulbR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(35, 2, 2, 0.98)";
          ctx.fill();

          // Specular glint on teardrop
          ctx.beginPath();
          ctx.arc(tip.x - bulbR * 0.3, tip.y - bulbR * 0.3, bulbR * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 230, 230, 0.55)";
          ctx.fill();

          ctx.restore();
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enableClickSplatter || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    forensicAudio.playStampSlam();
    spawnClickSplatter(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className={`absolute inset-0 w-full h-full pointer-events-auto mix-blend-multiply z-20 select-none ${className}`}
      style={{
        filter: "contrast(1.25) brightness(0.9)",
      }}
    />
  );
}
