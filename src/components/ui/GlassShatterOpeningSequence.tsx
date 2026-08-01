"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Matter from "matter-js";
import { Delaunay } from "d3-delaunay";

// ── AUDIO ENGINE ──
const playGunshotAndTinnitus = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // 1. Heavy Gunshot (Noise + Low Frequency Drop)
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // 2. Glass Shatter (High pass filtered noise)
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(4000, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.5);

    // 3. Tinnitus Ringing
    const ring = ctx.createOscillator();
    ring.type = "sine";
    ring.frequency.setValueAtTime(6500, now);
    
    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0, now);
    ringGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    ringGain.gain.linearRampToValueAtTime(0.01, now + 3);
    
    ring.connect(ringGain);
    ringGain.connect(ctx.destination);
    ring.start(now);
    ring.stop(now + 3);

  } catch (e) {
    console.error("Audio skipped");
  }
};

// ── PROCEDURAL RAIN BACKGROUND ──
// We draw rain on a hidden canvas, then use it as a pattern for the glass shards.
function drawRainBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.fillStyle = "#080808"; // Dark tinted glass base
  ctx.fillRect(0, 0, width, height);
  
  // Ambient City Lights (Blurred)
  ctx.fillStyle = "rgba(0, 100, 150, 0.2)";
  ctx.beginPath();
  ctx.arc(width * 0.3, height * 0.8, 400, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "rgba(139, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.arc(width * 0.7, height * 0.6, 500, 0, Math.PI * 2);
  ctx.fill();

  // Rain Drops
  ctx.strokeStyle = "rgba(200, 200, 255, 0.15)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 200; i++) {
    // Pseudo-random deterministic based on ID and Time
    const speed = 15 + (i % 10);
    const length = 20 + (i % 15);
    const x = ((i * 37) % width);
    const y = ((time * speed + i * 117) % height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + speed * 0.2, y + length);
    ctx.stroke();
  }
}

export default function GlassShatterOpeningSequence() {
  const [shattered, setShattered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [bloodPos, setBloodPos] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize Matter.js Physics Engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1.2; // Heavy gravity for falling glass
    engineRef.current = engine;

    // Floor to catch shards (way below screen)
    const floor = Matter.Bodies.rectangle(canvas.width / 2, canvas.height + 1000, canvas.width * 3, 100, { isStatic: true });
    Matter.World.add(engine.world, [floor]);

    let time = 0;
    
    const renderLoop = () => {
      time++;
      Matter.Engine.update(engine, 1000 / 60);
      
      // If not shattered, just draw the rain background
      if (!shattered) {
        drawRainBackground(ctx, canvas.width, canvas.height, time);
      } else {
        // If shattered, clear and draw shards
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the background behind the shards (dimmer)
        ctx.globalAlpha = 0.3;
        drawRainBackground(ctx, canvas.width, canvas.height, time);
        ctx.globalAlpha = 1.0;

        // Draw each shard
        const bodies = Matter.Composite.allBodies(engine.world).filter(b => b !== floor);
        
        for (const body of bodies) {
          ctx.save();
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);
          
          // Draw Polygon Path
          ctx.beginPath();
          ctx.moveTo(body.vertices[0].x - body.position.x, body.vertices[0].y - body.position.y);
          for (let j = 1; j < body.vertices.length; j++) {
            ctx.lineTo(body.vertices[j].x - body.position.x, body.vertices[j].y - body.position.y);
          }
          ctx.closePath();
          
          // Clip to the shard
          ctx.clip();
          
          // Inverse translate to draw the background mapping correctly
          ctx.rotate(-body.angle);
          ctx.translate(-body.position.x, -body.position.y);
          
          // Draw the live rain background INSIDE the shard (creates refraction illusion)
          drawRainBackground(ctx, canvas.width, canvas.height, time);
          
          // Re-translate for edge highlights
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);
          
          // Specular Edge Highlights for AAA look
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.restore();
        }
      }
      
      renderRef.current = requestAnimationFrame(renderLoop);
    };
    
    renderRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (renderRef.current) cancelAnimationFrame(renderRef.current);
      Matter.Engine.clear(engine);
    };
  }, [shattered]);

  const handleShatter = (e: React.MouseEvent) => {
    if (shattered || !engineRef.current || !canvasRef.current) return;
    
    const x = e.clientX;
    const y = e.clientY;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    setShattered(true);
    setBloodPos({ x, y });
    setShake(true);
    setTimeout(() => setShake(false), 150);

    playGunshotAndTinnitus();

    // ── VORONOI FRACTURE GENERATION ──
    const points: [number, number][] = [];
    
    // Add grid points (outer edges)
    for (let i = 0; i <= width; i += 200) {
      points.push([i, 0], [i, height]);
    }
    for (let i = 0; i <= height; i += 200) {
      points.push([0, i], [width, i]);
    }

    // Add high-density points around the click (bullet hole)
    for (let i = 0; i < 60; i++) {
      const radius = Math.random() * Math.random() * 600;
      const angle = Math.random() * Math.PI * 2;
      points.push([
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      ]);
    }

    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    
    const bodies: Matter.Body[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const polygon = voronoi.cellPolygon(i);
      if (!polygon) continue;
      
      // Calculate center of polygon
      let cx = 0, cy = 0;
      for (const p of polygon) {
        cx += p[0]; cy += p[1];
      }
      cx /= polygon.length;
      cy /= polygon.length;
      
      // Map polygon to local vertices
      const vertices = polygon.map(p => ({ x: p[0] - cx, y: p[1] - cy }));
      
      const body = Matter.Bodies.fromVertices(cx, cy, [vertices], {
        restitution: 0.1,
        friction: 0.8,
        density: 0.05
      });
      
      if (body) {
        // Explode outward from the bullet hole
        const dx = cx - x;
        const dy = cy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = 100 / (dist + 50); // Stronger near the center
        
        Matter.Body.applyForce(body, { x: cx, y: cy }, {
          x: (dx / dist) * force,
          y: (dy / dist) * force
        });
        
        bodies.push(body);
      }
    }
    
    Matter.World.add(engineRef.current.world, bodies);

    // Reveal Menu
    setTimeout(() => setShowMenu(true), 1200);
  };

  return (
    <motion.div 
      animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0, y: shake ? [10, -10, 10, -10, 0] : 0 }}
      transition={{ duration: 0.15 }}
      className="relative min-h-screen w-full bg-black overflow-hidden font-serif selection:bg-[#8B0000] selection:text-white"
    >
      {/* Interactive Physics Canvas */}
      <canvas 
        ref={canvasRef}
        onClick={handleShatter}
        className={`absolute inset-0 z-10 w-full h-full cursor-crosshair transition-all duration-1000 ${
          showMenu ? "blur-xl opacity-40 scale-105" : "blur-none opacity-100 scale-100"
        }`}
      />

      {/* ── VOLUMETRIC BLOOD SPLATTER ── */}
      <AnimatePresence>
        {shattered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            style={{ 
              left: bloodPos.x, 
              top: bloodPos.y,
              transform: "translate(-50%, -50%)" 
            }}
            className="absolute z-20 pointer-events-none mix-blend-multiply"
          >
            {/* Using radial gradients and drop shadows to fake thick, wet blood */}
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 rounded-full bg-[#5A0000] blur-xl opacity-80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[#3B0000] shadow-[0_10px_30px_rgba(90,0,0,0.8)]" />
              
              {/* Dripping effects */}
              <motion.div 
                animate={{ height: [0, 200] }}
                transition={{ duration: 3, ease: "easeIn" }}
                className="absolute top-[60%] left-1/2 w-2 bg-[#3B0000] rounded-b-full shadow-[0_5px_10px_rgba(90,0,0,0.5)]" 
              />
              <motion.div 
                animate={{ height: [0, 120] }}
                transition={{ duration: 2.5, ease: "easeIn", delay: 0.2 }}
                className="absolute top-[55%] left-[45%] w-1.5 bg-[#5A0000] rounded-b-full shadow-[0_5px_10px_rgba(90,0,0,0.5)]" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HOLD STATE PROMPT ── */}
      <AnimatePresence>
        {!shattered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <p className="text-sm tracking-[0.4em] text-[#D4C5A9] animate-pulse drop-shadow-md">
              [ CLICK TO INITIATE CASE DOSSIER ]
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MENU STAGING ── */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-6xl md:text-8xl font-black tracking-widest text-[#E8E3D9] mb-16 drop-shadow-[0_0_25px_rgba(232,227,217,0.3)]"
            >
              VERITAS
            </motion.h1>

            <div className="w-full max-w-sm space-y-4">
              {[
                "BEGIN INVESTIGATION",
                "EXAMINE EVIDENCE",
                "SYSTEM SETTINGS"
              ].map((label, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    x: 10, 
                    backgroundColor: "rgba(139, 0, 0, 0.15)",
                    borderColor: "#8B0000",
                    color: "#ffffff"
                  }}
                  className="w-full text-center py-5 px-6 border border-[#2A1212] bg-[#050505]/60 backdrop-blur-md rounded-sm text-xs font-bold tracking-[0.3em] text-[#D4C5A9] transition-all duration-300"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
