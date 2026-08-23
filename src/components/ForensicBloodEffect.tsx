"use client";

import React, { useEffect, useRef, useCallback } from "react";

export interface ForensicBloodEffectProps {
  /** Trigger the splatter animation programmatically */
  trigger?: boolean;
  /** Overall intensity/density of the splatter (default: 'high') */
  intensity?: "low" | "medium" | "high";
  /** Number of downward gravity drip streams (default: 16) */
  dripCount?: number;
  /** Max vertical drip length in pixels (default: 250) */
  maxDripLength?: number;
  /** Primary blood color hex (default: '#400000') */
  bloodColor?: string;
  /** Callback fired when initial impact burst completes */
  onImpactComplete?: () => void;
  /** Optional custom CSS classes for absolute/relative container */
  className?: string;
}

// ── Physics Interfaces ──
interface SatelliteDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ClotVertex {
  angle: number;
  dist: number;
  noise: number;
}

interface ImpactSpatterCore {
  cx: number;
  cy: number;
  radius: number;
  vertices: ClotVertex[];
  spines: Array<{ angle: number; length: number; width: number; curve: number }>;
  alpha: number;
  growth: number;
  maxGrowth: number;
}

interface DetachedDroplet {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

interface GravityDripStream {
  startX: number;
  startY: number;
  currentY: number;
  currentX: number;
  targetLength: number;
  width: number;
  initialSpeed: number;
  currentSpeed: number;
  viscosityFriction: number;
  meanderAmp: number;
  meanderFreq: number;
  meanderPhase: number;
  delay: number;
  elapsed: number;
  isComplete: boolean;
  hasDetached: boolean;
  path: Array<{ x: number; y: number; width: number }>;
}

export default function ForensicBloodEffect({
  trigger = true,
  intensity = "high",
  dripCount = 16,
  maxDripLength = 250,
  bloodColor = "#400000",
  onImpactComplete,
  className = "",
}: ForensicBloodEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const impactCoresRef = useRef<ImpactSpatterCore[]>([]);
  const satellitesRef = useRef<SatelliteDroplet[]>([]);
  const dripsRef = useRef<GravityDripStream[]>([]);
  const detachedDropletsRef = useRef<DetachedDroplet[]>([]);
  const impactFinishedRef = useRef<boolean>(false);

  // Derive palette based on primary bloodColor
  const getPalette = useCallback(() => {
    return {
      core: "#280202", // Deep oxidized dark center
      body: bloodColor || "#400000", // Rich venous crimson
      edge: "#520404", // Thin biological perimeter
      specular: "rgba(255, 225, 225, 0.42)", // Wet liquid sheen
      specularDot: "rgba(255, 240, 240, 0.65)", // Pinpoint gloss
    };
  }, [bloodColor]);

  // Spawn an authentic high-velocity impact spatter at (cx, cy)
  const createImpact = useCallback(
    (cx: number, cy: number, w: number, h: number) => {
      const palette = getPalette();

      // Density multiplier based on intensity
      const densityMultiplier = intensity === "high" ? 1.0 : intensity === "medium" ? 0.65 : 0.4;
      const countSatellites = Math.floor((70 + Math.random() * 50) * densityMultiplier);

      // 1. Organic, Ragged Clot Core
      const baseRadius = 24 + Math.random() * 14;
      const vertices: ClotVertex[] = [];
      const numVertices = 20;
      for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        const noise = 0.65 + Math.random() * 0.75;
        vertices.push({ angle, dist: baseRadius * noise, noise });
      }

      // Feathered Spines
      const numSpines = Math.floor((10 + Math.random() * 8) * densityMultiplier);
      const spines: Array<{ angle: number; length: number; width: number; curve: number }> = [];
      for (let s = 0; s < numSpines; s++) {
        const angle = Math.random() * Math.PI * 2;
        const length = baseRadius * (1.3 + Math.random() * 2.4);
        const width = 1.4 + Math.random() * 2.2;
        const curve = (Math.random() - 0.5) * 0.3;
        spines.push({ angle, length, width, curve });
      }

      impactCoresRef.current.push({
        cx,
        cy,
        radius: baseRadius,
        vertices,
        spines,
        alpha: 0.98,
        growth: 0,
        maxGrowth: baseRadius * 1.15,
      });

      // 2. Radial Micro-Spray Satellites (60-120 droplets, 0-360 deg)
      for (let i = 0; i < countSatellites; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 11;
        const radius = 0.6 + Math.random() * 2.8;

        satellitesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (Math.random() * 0.8), // slight downward gravity bias
          radius,
          alpha: 0.85 + Math.random() * 0.15,
          life: 0,
          maxLife: 14 + Math.random() * 22,
          color: Math.random() > 0.4 ? palette.body : palette.core,
        });
      }

      // 3. Gravity Drip Streams with Non-Linear Viscosity Physics
      const effectiveDripCount = Math.floor(dripCount * densityMultiplier);
      const newDrips: GravityDripStream[] = [];

      for (let d = 0; d < effectiveDripCount; d++) {
        // Distribute drip origin points along the bottom half of the impact clot
        const startAngle = Math.PI * 0.15 + (d / effectiveDripCount) * Math.PI * 0.7;
        const originX = cx + Math.cos(startAngle) * (baseRadius * (0.6 + Math.random() * 0.45));
        const originY = cy + Math.sin(startAngle) * (baseRadius * (0.6 + Math.random() * 0.45));

        const targetLength = (0.35 + Math.random() * 0.65) * maxDripLength;
        const width = 1.6 + Math.random() * 3.0; // 1.6px to 4.6px
        const initialSpeed = 0.9 + Math.random() * 1.4;
        const viscosityFriction = 0.982 - Math.random() * 0.012; // gradual deceleration as volume thins out

        newDrips.push({
          startX: originX,
          startY: originY,
          currentX: originX,
          currentY: originY,
          targetLength,
          width,
          initialSpeed,
          currentSpeed: initialSpeed,
          viscosityFriction,
          meanderAmp: (Math.random() - 0.5) * 1.8,
          meanderFreq: 0.025 + Math.random() * 0.03,
          meanderPhase: Math.random() * Math.PI * 2,
          delay: Math.floor(d * 2.5 + Math.random() * 8),
          elapsed: 0,
          isComplete: false,
          hasDetached: false,
          path: [{ x: originX, y: originY, width }],
        });
      }

      dripsRef.current = newDrips;
    },
    [getPalette, intensity, dripCount, maxDripLength]
  );

  // Initialize or trigger animation
  useEffect(() => {
    if (!trigger) return;

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
    const h = rect.height || 600;

    // Reset collections
    impactCoresRef.current = [];
    satellitesRef.current = [];
    dripsRef.current = [];
    detachedDropletsRef.current = [];
    impactFinishedRef.current = false;

    // Primary Impact origin (positioned prominently in upper-center-right)
    createImpact(w * 0.58, h * 0.22, w, h);

    const palette = getPalette();

    // ── 60 FPS Fluid Physics Engine Loop ──
    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // ── A. DRAW IMPACT CORES ──
      impactCoresRef.current.forEach((core) => {
        if (core.growth < core.maxGrowth) {
          core.growth += 2.2;
        }

        ctx.save();

        // 1. Core Contour Spline
        if (core.vertices.length > 2) {
          ctx.beginPath();
          const firstX = core.cx + Math.cos(core.vertices[0].angle) * (core.vertices[0].dist * (core.growth / core.maxGrowth));
          const firstY = core.cy + Math.sin(core.vertices[0].angle) * (core.vertices[0].dist * (core.growth / core.maxGrowth));
          ctx.moveTo(firstX, firstY);

          for (let i = 0; i < core.vertices.length; i++) {
            const nextIdx = (i + 1) % core.vertices.length;
            const current = core.vertices[i];
            const next = core.vertices[nextIdx];

            const currentDist = current.dist * (core.growth / core.maxGrowth);
            const nextDist = next.dist * (core.growth / core.maxGrowth);

            const currX = core.cx + Math.cos(current.angle) * currentDist;
            const currY = core.cy + Math.sin(current.angle) * currentDist;
            const nextX = core.cx + Math.cos(next.angle) * nextDist;
            const nextY = core.cy + Math.sin(next.angle) * nextDist;

            const midX = (currX + nextX) / 2;
            const midY = (currY + nextY) / 2;
            ctx.quadraticCurveTo(currX, currY, midX, midY);
          }
          ctx.closePath();

          // Multi-Stop Coagulation Gradient
          const grad = ctx.createRadialGradient(core.cx, core.cy, 1, core.cx, core.cy, core.radius * 1.25);
          grad.addColorStop(0, palette.core);
          grad.addColorStop(0.55, palette.body);
          grad.addColorStop(0.88, palette.edge);
          grad.addColorStop(1, "rgba(40, 2, 2, 0.95)");

          ctx.fillStyle = grad;
          ctx.fill();

          // Wet Specular Core Arc (3D Liquid Sheen)
          ctx.beginPath();
          ctx.ellipse(
            core.cx - core.radius * 0.28,
            core.cy - core.radius * 0.26,
            core.radius * 0.38,
            core.radius * 0.22,
            -0.28,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = palette.specular;
          ctx.fill();
        }

        // 2. Feathered Arterial Spines
        core.spines.forEach((spine) => {
          const spineLen = spine.length * (core.growth / core.maxGrowth);
          const endX = core.cx + Math.cos(spine.angle + spine.curve) * spineLen;
          const endY = core.cy + Math.sin(spine.angle + spine.curve) * spineLen;

          ctx.beginPath();
          ctx.moveTo(core.cx, core.cy);
          ctx.quadraticCurveTo(
            core.cx + Math.cos(spine.angle) * (spineLen * 0.5),
            core.cy + Math.sin(spine.angle) * (spineLen * 0.5),
            endX,
            endY
          );
          ctx.strokeStyle = palette.body;
          ctx.lineWidth = spine.width;
          ctx.lineCap = "round";
          ctx.stroke();

          // Spine tip micro-bulb
          ctx.beginPath();
          ctx.arc(endX, endY, spine.width * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = palette.core;
          ctx.fill();
        });

        ctx.restore();
      });

      // ── B. DRAW RADIAL SATELLITE DROPLETS ──
      for (let i = satellitesRef.current.length - 1; i >= 0; i--) {
        const sat = satellitesRef.current[i];
        sat.life++;
        sat.x += sat.vx;
        sat.y += sat.vy;
        sat.vx *= 0.88; // air resistance deceleration
        sat.vy *= 0.88;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, sat.radius, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.fill();

        // Pinpoint specular glint
        if (sat.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(sat.x - 0.4, sat.y - 0.4, sat.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = palette.specularDot;
          ctx.fill();
        }
        ctx.restore();

        if (sat.life >= sat.maxLife) {
          // Flatten into permanent static paper stain
          detachedDropletsRef.current.push({
            x: sat.x,
            y: sat.y,
            radius: sat.radius,
            alpha: sat.alpha,
          });
          satellitesRef.current.splice(i, 1);
        }
      }

      // Check onImpactComplete callback
      if (!impactFinishedRef.current && satellitesRef.current.length < 5) {
        impactFinishedRef.current = true;
        if (onImpactComplete) onImpactComplete();
      }

      // ── C. DRAW DETACHED / STATIC DROPLETS ──
      detachedDropletsRef.current.forEach((drop) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fillStyle = palette.body;
        ctx.fill();
        ctx.restore();
      });

      // ── D. DRAW VISCOUS GRAVITY DRIPS (Non-linear fluid physics) ──
      dripsRef.current.forEach((drip) => {
        drip.elapsed++;
        if (drip.elapsed < drip.delay) return;

        if (!drip.isComplete) {
          // Decelerate non-linearly as volume thins out (surface tension friction)
          drip.currentSpeed = Math.max(0.18, drip.currentSpeed * drip.viscosityFriction);
          drip.currentY += drip.currentSpeed;

          const elapsedDist = drip.currentY - drip.startY;
          const progress = Math.min(1, elapsedDist / drip.targetLength);

          // Sinusoidal lateral wander across paper grain
          const meanderOffset = Math.sin(elapsedDist * drip.meanderFreq + drip.meanderPhase) * drip.meanderAmp;
          drip.currentX = drip.startX + meanderOffset;

          // Width tapers progressively
          const currentWidth = Math.max(1.0, drip.width * (1 - progress * 0.45));

          drip.path.push({
            x: drip.currentX,
            y: drip.currentY,
            width: currentWidth,
          });

          // Droplet Detachment: 25% chance a leading bulb detaches into a static droplet
          if (progress > 0.82 && !drip.hasDetached && Math.random() < 0.08) {
            drip.hasDetached = true;
            detachedDropletsRef.current.push({
              x: drip.currentX + (Math.random() * 4 - 2),
              y: drip.currentY + (drip.width * 2.2),
              radius: drip.width * 0.7,
              alpha: 0.95,
            });
          }

          if (drip.currentY >= drip.startY + drip.targetLength) {
            drip.isComplete = true;
          }
        }

        // Render Drip Path & Tear-Drop Bulb
        if (drip.path.length > 1) {
          ctx.save();

          // 1. Viscous Trailing Neck
          ctx.beginPath();
          ctx.moveTo(drip.path[0].x, drip.path[0].y);
          for (let p = 1; p < drip.path.length; p++) {
            ctx.lineTo(drip.path[p].x, drip.path[p].y);
          }
          ctx.strokeStyle = palette.body;
          ctx.lineWidth = drip.path[drip.path.length - 1].width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();

          // 2. Wet Specular Highlight Running Along Centerline
          ctx.beginPath();
          ctx.moveTo(drip.path[0].x - 0.35, drip.path[0].y);
          for (let p = 1; p < drip.path.length; p++) {
            ctx.lineTo(drip.path[p].x - 0.35, drip.path[p].y);
          }
          ctx.strokeStyle = palette.specular;
          ctx.lineWidth = Math.max(0.6, drip.path[drip.path.length - 1].width * 0.28);
          ctx.stroke();

          // 3. Elliptical Leading Tear-Drop Bulb (wider than trailing neck)
          const tip = drip.path[drip.path.length - 1];
          const bulbRadiusX = tip.width * 1.35;
          const bulbRadiusY = tip.width * 1.55;

          ctx.beginPath();
          ctx.ellipse(tip.x, tip.y, bulbRadiusX, bulbRadiusY, 0, 0, Math.PI * 2);
          ctx.fillStyle = palette.core;
          ctx.fill();

          // Specular glint on tear-drop bulb
          ctx.beginPath();
          ctx.ellipse(
            tip.x - bulbRadiusX * 0.3,
            tip.y - bulbRadiusY * 0.3,
            bulbRadiusX * 0.45,
            bulbRadiusY * 0.35,
            -0.2,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = palette.specularDot;
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
  }, [trigger, createImpact, getPalette, onImpactComplete]);

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ isolation: "isolate" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          mixBlendMode: "multiply",
          filter: "contrast(1.28) brightness(0.92)",
        }}
      />
    </div>
  );
}
