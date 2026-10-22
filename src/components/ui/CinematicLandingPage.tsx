"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { forensicAudio } from "@/lib/forensicAudio";

interface CinematicLandingPageProps {
  onBegin: () => void;
  onOpenSettings?: () => void;
}

export default function CinematicLandingPage({
  onBegin,
  onOpenSettings,
}: CinematicLandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleBeginClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setHasInteracted(true);
    forensicAudio.playFolderOpen();
    forensicAudio.startAmbientDrone();
    setTimeout(() => {
      onBegin();
    }, 700);
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] text-[#E8E3D9] overflow-hidden select-none flex flex-col justify-between">
      {/* ── 35mm Film Grain Overlay ── */}
      <div className="pointer-events-none absolute inset-0 z-40 opacity-[0.22] mix-blend-overlay">
        <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
          <filter id="noir-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noir-grain)" />
        </svg>
      </div>

      {/* ── Chiaroscuro Atmospheric Lighting ── */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${
            mousePos.y * 100
          }%, rgba(212, 197, 169, 0.12) 0%, rgba(10, 8, 8, 0.94) 70%, #050505 100%)`,
        }}
      />

      {/* ── Deep Peripheral Vignette ── */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          boxShadow: "inset 0 0 180px rgba(0, 0, 0, 0.98), inset 0 0 80px rgba(107, 0, 0, 0.2)",
        }}
      />

      {/* ── Subtle Background Environment Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <div
          className="absolute inset-0 bg-cover bg-center filter contrast-150 brightness-40 saturate-50"
          style={{ backgroundImage: "url('/detective-desk.jpg')" }}
        />
        {/* Soft rain/haze overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/90" />
      </div>

      {/* ── Top Header / Dispatch Banner ── */}
      <header className="relative z-30 w-full px-6 md:px-12 pt-8 flex items-center justify-between text-xs font-mono tracking-widest text-[#D4C5A9]/70">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse" />
          <span className="uppercase text-[10px] md:text-xs">
            HOMICIDE DIVISION · PRECINCT 1974
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] md:text-xs text-neutral-400">
          <span>CLASSIFIED DOSSIER</span>
          {onOpenSettings && (
            <button
              onClick={() => {
                forensicAudio.playPhotoInspect();
                onOpenSettings();
              }}
              className="text-[#D4C5A9]/80 hover:text-[#E8E3D9] uppercase transition-colors underline-offset-4 hover:underline"
            >
              [ CONFIG ]
            </button>
          )}
        </div>
      </header>

      {/* ── Central Cinematic Title Composition ── */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
        {/* Top Roman numeral mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="text-[#6B0000] font-mono text-[11px] md:text-xs uppercase tracking-[0.4em] font-semibold mb-4"
        >
          AN INTERACTIVE PSYCHOLOGICAL THRILLER
        </motion.div>

        {/* Master Film Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black tracking-[0.18em] uppercase text-[#E8E3D9] drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)]"
            style={{
              textShadow:
                "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(107,0,0,0.25)",
            }}
          >
            VERITAS
            <br />
            MORTIS
          </h1>

          {/* Dried-crimson accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
            className="h-[2px] w-36 md:w-56 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent mx-auto mt-4"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="mt-6 font-serif italic text-lg sm:text-xl md:text-2xl text-[#D4C5A9] tracking-wider font-light"
        >
          “The truth does not fear the light.”
        </motion.p>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.0 }}
          className="mt-3 text-xs sm:text-sm font-mono tracking-widest text-[#E8E3D9]/60 max-w-lg uppercase"
        >
          Every witness has a story. Every story has a fracture.
        </motion.p>

        {/* Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="mt-12 md:mt-16"
        >
          <button
            onClick={handleBeginClick}
            onMouseEnter={() => {
              setIsHovered(true);
              forensicAudio.playPenFriction();
            }}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isTransitioning}
            className="group relative px-8 md:px-12 py-4 md:py-5 bg-[#121010] hover:bg-[#1A1714] border-2 border-[#5C4A38] hover:border-[#8B0000] text-[#E8E3D9] rounded-sm transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 focus:ring-offset-[#050505] cursor-pointer"
          >
            {/* Ambient Red Glow on hover */}
            <div
              className={`absolute inset-0 bg-[#6B0000]/15 transition-opacity duration-300 rounded-sm pointer-events-none ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Corner brass rivets */}
            <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#8A6830]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#8A6830]" />
            <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#8A6830]" />
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#8A6830]" />

            <div className="relative flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] group-hover:scale-125 transition-transform" />
              <span className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-[#D4C5A9] group-hover:text-white transition-colors">
                {isTransitioning ? "ACCESSING PRECINCT..." : "BEGIN INVESTIGATION"}
              </span>
              <span className="font-mono text-xs text-[#8B0000] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </button>
        </motion.div>

        {/* Subtle Interactive Instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.6 }}
          className="mt-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#D4C5A9]/50 uppercase"
        >
          <span>[ PRESS BUTTON OR ENTER TO ENTER HEADQUARTERS ]</span>
        </motion.div>
      </main>

      {/* ── Bottom Ambient Dossier Footer ── */}
      <footer className="relative z-30 w-full px-6 md:px-12 pb-8 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#D4C5A9]/40 border-t border-[#1A1714] pt-4">
        <div className="flex items-center gap-4">
          <span>DETERMINISTIC CASE GENERATOR · MULBERRY32 PRNG</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">1970s DIEGETIC FORENSICS</span>
        </div>
        <div className="mt-2 sm:mt-0">
          <span>VERITAS MORTIS © MCMLXXIV</span>
        </div>
      </footer>

      {/* ── Transition Vignette Flash ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 bg-[#050505] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
