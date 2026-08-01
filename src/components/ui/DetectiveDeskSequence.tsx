"use client";

import React, { useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import CaseDossierModal from "./CaseDossierModal";

export default function DetectiveDeskSequence() {
  const [opened, setOpened] = useState(false);
  
  // ── 3D Parallax Mouse Tracking ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax effect
  // Background moves opposite to mouse
  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 70, damping: 25 });
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 70, damping: 25 });
  
  // Foreground UI tilts slightly
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (opened) return; // Freeze parallax when open
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // ── Cinematic Audio Synthesizer (Deep Sub-Bass Thunder) ──
  const playCinematicImpact = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Deep Sub-Bass Boom
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 1.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);

      // Low Rumble Noise (Thunder)
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(20, now + 2);

      noise.connect(filter);
      filter.connect(gain);
      noise.start(now);
      noise.stop(now + 2);
    } catch (e) {
      console.error("Audio Context Error:", e);
    }
  }, []);

  const handleOpen = () => {
    if (opened) return;
    playCinematicImpact();
    
    // Snap parallax to center for clean zoom
    mouseX.set(0);
    mouseY.set(0);
    
    setOpened(true);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleOpen}
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-6 text-[#E8E3D9] selection:bg-[#8B0000] selection:text-white [perspective:1200px] ${!opened ? "cursor-pointer" : ""}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
      `}</style>
      {/* ═══════════════════════════════════════════
           BACKGROUND: AAA PHOTOREALISTIC PARALLAX
          ═══════════════════════════════════════════ */}
      
      <motion.div 
        style={{ x: bgX, y: bgY, scale: 1.05 }}
        animate={{ 
          y: opened ? "-15%" : "0%", // Pan down physically
          scale: opened ? 1.2 : 1.05
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <img 
          src="/detective-desk.jpg" 
          alt="Detective Desk" 
          className="w-full h-full object-cover contrast-110 saturate-[0.85]" // Sharpened and de-saturated for realism
        />
      </motion.div>

      {/* ═══════════════════════════════════════════
           POST-PROCESSING, DYNAMICS & OVERLAYS
          ═══════════════════════════════════════════ */}
      
      {/* Dynamic Lamp Flicker & Rain Lighting */}
      <motion.div 
        animate={{ opacity: [0.1, 0.15, 0.08, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 z-0 bg-[#FFD700] mix-blend-overlay" 
      />

      {/* Floating Dust Motes */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100],
              x: Math.random() * 40 - 20,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Subtle Cinematic Vignette (Greatly reduced for clarity) */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] opacity-30" />
      
      {/* Rack Focus Blur / Darkness on click */}
      <motion.div
        initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" }}
        animate={{ 
          backdropFilter: opened ? "blur(12px)" : "blur(0px)",
          backgroundColor: opened ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)" 
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-0 z-20"
      />

      {/* ═══════════════════════════════════════════
           FOREGROUND UI
          ═══════════════════════════════════════════ */}
      
      {/* Pre-Impact Prompt */}
      <AnimatePresence>
        {!opened && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ rotateX, rotateY }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center"
          >
            <p className="text-sm tracking-[0.4em] text-[#D4C5A9] animate-pulse drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
              [ CLICK TO OPEN DOSSIER ]
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE CASE FILE DOSSIER (Replaces the old menu) */}
      <CaseDossierModal opened={opened} />
    </div>
  );
}
