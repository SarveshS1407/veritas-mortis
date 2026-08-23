"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MicroCassette from "./MicroCassette";
import ForensicBloodEffect from "./ForensicBloodEffect";
import { forensicAudio } from "@/lib/forensicAudio";

interface CaseDossierProps {
  onBeginInvestigation?: () => void;
  onResumeDossier?: () => void;
}

export default function CaseDossier({
  onBeginInvestigation,
  onResumeDossier,
}: CaseDossierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stringUnlooped, setStringUnlooped] = useState(false);
  const [hasGunshot, setHasGunshot] = useState(false);
  const [bloodTrigger, setBloodTrigger] = useState(false);
  const [hoveredMenuIdx, setHoveredMenuIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // String unlooping and folder open sequence
  const handleOpenFolder = () => {
    if (isOpen || stringUnlooped) return;
    forensicAudio.playPenFriction(); // Twine friction
    setStringUnlooped(true);

    setTimeout(() => {
      forensicAudio.playFolderOpen();
      setIsOpen(true);
      // Gunshot & blood reveal after folder opens
      setTimeout(() => {
        setHasGunshot(true);
        setBloodTrigger(true);
        forensicAudio.playStampSlam();
      }, 550);
    }, 400);
  };

  const handleMenuClick = (idx: number) => {
    if (idx === 0) {
      // Begin Investigation transition
      setIsTransitioning(true);
      forensicAudio.playStampSlam();
      setTimeout(() => {
        if (onBeginInvestigation) {
          onBeginInvestigation();
        }
      }, 1200);
    } else if (idx === 1 && onResumeDossier) {
      onResumeDossier();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070605] overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 select-none">
      {/* ── SVG TURBULENCE FILTERS FOR TRUE DEBOSSED STAMPS & PULP ── */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="pulp-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#f4ece1" surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>

          <filter id="debossed-stamp">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="rough" />
            <feDisplacementMap in="SourceGraphic" in2="rough" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ── AMBIENT INTERROGATION DESK LIGHTING & 35MM GRAIN ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 35%, rgba(210, 195, 160, 0.15) 0%, rgba(5, 5, 8, 0.98) 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ boxShadow: "inset 0 0 160px rgba(0,0,0,0.95)" }}
      />

      {/* ── MAIN WORKSPACE: CASEFILE + MICROCASSÈTTE PROP ── */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl w-full">
        
        {/* ── TACTILE 300 GSM KRAFT PRESSBOARD CASEFILE ── */}
        <motion.div
          animate={hasGunshot ? { x: [-12, 12, -8, 8, -4, 4, 0], y: [-4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[580px] min-h-[640px] rounded-lg cursor-pointer"
          style={{
            perspective: 1200,
          }}
          onClick={!isOpen ? handleOpenFolder : undefined}
        >
          {/* FOLDER BASE / INSIDE LEFT SPREAD */}
          <div
            className="relative w-full h-full min-h-[640px] rounded-lg p-6 md:p-8 flex flex-col justify-between"
            style={{
              backgroundColor: "#2c241b",
              backgroundImage: `
                radial-gradient(circle at 75% 20%, rgba(60, 45, 30, 0.4) 0%, transparent 60%),
                radial-gradient(circle at 25% 80%, rgba(30, 20, 10, 0.6) 0%, transparent 70%)
              `,
              boxShadow: "2px 8px 30px rgba(0,0,0,0.85), inset 1px 1px 2px rgba(255,255,255,0.08), inset -2px -2px 6px rgba(0,0,0,0.6)",
              border: "1px solid #4a3d2e",
            }}
          >
            {/* Coffee Ring Watermark on Kraft Folder */}
            <div
              className="absolute top-12 right-16 w-28 h-28 rounded-full pointer-events-none opacity-20 border-[3px] border-[#181109]"
              style={{
                filter: "blur(0.8px)",
                boxShadow: "inset 0 0 12px rgba(24,17,9,0.8)",
                transform: "rotate(-15deg)",
              }}
            />

            {/* Dog-Eared Top-Right Corner Highlight */}
            <div
              className="absolute -top-1 -right-1 w-8 h-8 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, transparent 50%, #1c150e 50%)",
                boxShadow: "-2px 2px 4px rgba(0,0,0,0.5)",
              }}
            />

            {/* ── LAYERED EVIDENCE ARTIFACTS INSIDE FOLDER ── */}
            {isOpen && (
              <div className="relative w-full h-full flex flex-col justify-between">
                
                {/* METALLIC RUSTY PAPERCLIPS (TOP MARGIN) */}
                <div className="absolute -top-4 left-10 z-40 flex items-center gap-6">
                  {/* Paperclip 1 */}
                  <div
                    className="w-4 h-12 rounded-full border-2 border-zinc-400 relative"
                    style={{
                      background: "linear-gradient(45deg, rgba(255,255,255,0.6), rgba(120,120,120,0.2))",
                      filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.7))",
                    }}
                  />
                  {/* Rusty Staple */}
                  <div className="w-6 h-1.5 bg-zinc-600 border border-zinc-800 rounded-xs shadow-sm transform -rotate-6" />
                </div>

                {/* LAYERED CARBON-COPY SLIPS (CANARY YELLOW & PINK DUPLICATES) */}
                {/* Canary Yellow Carbon Copy */}
                <div
                  className="absolute -top-2 left-6 right-8 bg-[#fff9c4] text-[#332f1a] p-4 font-mono text-[9px] leading-tight shadow-md transform -rotate-2 pointer-events-none border border-[#e0d890] opacity-90"
                  style={{
                    boxShadow: "2px 4px 10px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="block font-bold border-b border-[#332f1a]/20 pb-0.5 mb-1">
                    DUPLICATE COPY · DIV. 09 FORENSICS
                  </span>
                  <span>CASE #09-884 · SCENE: BLACKWOOD RESIDENCE · STATUS: HOMICIDE</span>
                </div>

                {/* Pale Pink Carbon Copy Slip */}
                <div
                  className="absolute top-8 left-4 right-10 bg-[#ffebee] text-[#4a1c24] p-4 font-mono text-[9px] leading-tight shadow-md transform rotate-1 pointer-events-none border border-[#e0b0b8] opacity-90"
                  style={{
                    boxShadow: "2px 4px 12px rgba(0,0,0,0.45)",
                  }}
                >
                  <span className="block font-bold border-b border-[#4a1c24]/20 pb-0.5 mb-1">
                    CORONER TRANSCRIPT RECEIPT
                  </span>
                  <span>VICTIM: EDGAR V. BLACKWOOD · TRAUMA: MULTIPLE LACERATIONS</span>
                </div>

                {/* PRIMARY MAIN AUTOPSY SHEET */}
                <div
                  className="relative z-20 mt-16 bg-[#f4ede1] p-6 text-[#1a1612] shadow-2xl border border-[#c4b9a3] rounded-xs"
                  style={{
                    boxShadow: "0 10px 30px rgba(0,0,0,0.7), inset 0 0 40px rgba(180, 160, 130, 0.15)",
                  }}
                >
                  {/* DEBOSSED CONFIDENTIAL STAMP */}
                  <div
                    className="absolute top-6 right-6 -rotate-12 px-3 py-1 border-2 border-[#500000] text-[#500000] font-mono text-sm font-black tracking-widest uppercase pointer-events-none select-none opacity-85"
                    style={{
                      boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.6), inset -1px -1px 1px rgba(255,255,255,0.15)",
                      filter: "url(#debossed-stamp)",
                    }}
                  >
                    CONFIDENTIAL
                  </div>

                  {/* HEADER */}
                  <div className="border-b-2 border-[#1a1612]/30 pb-3 mb-4">
                    <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-[#1a1612]/60 block mb-1">
                      Department of Forensic Investigation · Division 09
                    </span>
                    <h1 className="font-serif text-2xl font-black uppercase text-[#1a1612] tracking-tight">
                      Homicide Dossier #884-D
                    </h1>
                  </div>

                  {/* FORENSIC CASE SUMMARY */}
                  <div className="font-mono text-xs text-[#1a1612]/85 leading-relaxed space-y-2 mb-6">
                    <p>
                      <strong>SCENE:</strong> Primary study, Blackwood Manor (02:14 HRS).
                    </p>
                    <p>
                      <strong>PRELIMINARY FINDING:</strong> High-velocity trauma inflicted with sharp cold-steel blade. Evidence wiretap audio tape recovered on desk.
                    </p>
                  </div>

                  {/* TRANSLUCENT GLASSINE EVIDENCE ENVELOPE */}
                  <div
                    className="relative w-full bg-[#f5f0e1]/35 backdrop-blur-[1.5px] p-3 border border-dashed border-[#8a7f6c] rounded-xs mb-6 overflow-hidden flex items-center justify-between"
                    style={{
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Spent Brass Casing / Matchstick Prop under frosted wax paper */}
                      <div className="w-8 h-3 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-md border border-amber-900 transform -rotate-12" />
                      <div>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#3d362a] block">
                          ITEM 04-B: SPENT .38 BRASS CASING
                        </span>
                        <span className="text-[7px] font-mono text-[#5c5240] block">
                          RECOVERED BENEATH DESK PRESSBOARD
                        </span>
                      </div>
                    </div>
                    <span className="text-[7px] font-mono bg-[#3d362a]/10 px-1.5 py-0.5 uppercase text-[#3d362a]">
                      SECURED
                    </span>
                  </div>

                  {/* WET FOUNTAIN PEN CURSIVE MENU OPTIONS */}
                  <div className="border-t-2 border-[#1a1612]/20 pt-4 space-y-2">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#1a1612]/50 block mb-2">
                      DETECTIVE ACTIONS:
                    </span>

                    {[
                      "BEGIN INVESTIGATION",
                      "RESUME DOSSIER",
                      "REPLAY SEEDS & CONFIG",
                    ].map((label, idx) => (
                      <motion.button
                        key={label}
                        onClick={() => handleMenuClick(idx)}
                        onMouseEnter={() => {
                          setHoveredMenuIdx(idx);
                          forensicAudio.playPenFriction();
                        }}
                        onMouseLeave={() => setHoveredMenuIdx(null)}
                        whileHover={{ x: 6 }}
                        className="flex items-center gap-2 text-left w-full group py-0.5"
                      >
                        <span
                          className={`font-serif text-lg font-bold transition-colors ${
                            hoveredMenuIdx === idx ? "text-[#990000]" : "text-[#500000]"
                          }`}
                          style={{
                            fontFamily: "'Caveat', cursive, serif",
                            textShadow: hoveredMenuIdx === idx ? "0 0 10px rgba(153,0,0,0.4)" : "none",
                          }}
                        >
                          &gt; {label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CLOSED FOLDER FLAP COVER WITH TIED TWINE CLOSURE ── */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  initial={{ rotateY: 0 }}
                  exit={{ rotateY: -115 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformOrigin: "left center" }}
                  className="absolute inset-0 bg-[#3a2f23] rounded-lg p-8 flex flex-col justify-between z-30 shadow-[4px_12px_35px_rgba(0,0,0,0.9)] border border-[#524433]"
                >
                  {/* FOLDER TOP TAB */}
                  <div className="absolute -top-4 left-6 bg-[#3a2f23] px-6 py-1 rounded-t-md border-t border-l border-r border-[#524433] text-[9px] font-mono font-bold tracking-widest text-[#d8cbb8]">
                    CONFIDENTIAL EVIDENCE · DIV 09
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#a69781] block mb-2">
                      POLICE DEPARTMENT · METROPOLITAN
                    </span>
                    <h2 className="font-serif text-4xl font-black text-[#eae0d0] tracking-tight uppercase border-b-2 border-[#524433] pb-4">
                      Veritas Mortis
                    </h2>
                    <p className="font-mono text-xs text-[#a69781] mt-2">
                      CASE FILE NO. 884-DELTA · UNIFIED DOSSIER
                    </p>
                  </div>

                  {/* RETRO KRAFT STRING-AND-BUTTON FIGURE-8 CLOSURE */}
                  <div className="relative my-8 flex flex-col items-center justify-center">
                    {/* Top Washer with Brass Rivet */}
                    <div className="w-8 h-8 rounded-full bg-[#8c7457] border-2 border-[#5c4a35] shadow-md flex items-center justify-center relative z-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
                    </div>

                    {/* Red Evidence Twine Figure-8 SVG */}
                    <svg className="w-16 h-20 my-[-6px] z-10 overflow-visible pointer-events-none">
                      <motion.path
                        d="M 32 8 C 48 20, 48 40, 32 48 C 16 56, 16 72, 32 80 C 48 72, 48 56, 32 48 C 16 40, 16 20, 32 8"
                        fill="none"
                        stroke="#8B0000"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 1 }}
                        animate={{ pathLength: stringUnlooped ? 0 : 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </svg>

                    {/* Bottom Washer with Brass Rivet */}
                    <div className="w-8 h-8 rounded-full bg-[#8c7457] border-2 border-[#5c4a35] shadow-md flex items-center justify-center relative z-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-inner" />
                    </div>

                    <span className="font-mono text-[9px] text-[#c4b59f] tracking-widest uppercase mt-4 animate-pulse">
                      [ CLICK TO UNTIE & OPEN DOSSIER ]
                    </span>
                  </div>

                  <div className="text-center border-t border-[#524433] pt-4">
                    <span className="text-[8px] font-mono text-[#8a7a65] uppercase tracking-widest">
                      CLASSIFIED EVIDENCE · UNLAWFUL TO REMOVE
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── HTML5 CANVAS RADIAL BLOOD BURST & GRAVITY DRIPS ── */}
            {bloodTrigger && (
              <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-lg">
                <ForensicBloodEffect trigger={bloodTrigger} intensity="high" dripCount={18} maxDripLength={260} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── INTERACTIVE SONY MICRO-CASSETTE PROP (DESK COMPANION) ── */}
        <div className="flex flex-col items-center">
          <MicroCassette />
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mt-2">
            EVIDENCE TAPE RECORDER #09
          </span>
        </div>
      </div>

      {/* ── ATMOSPHERIC TRANSITION: OVERHEAD LAMP POP & WORKSPACE REVEAL ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="text-center font-mono text-zinc-500 text-xs uppercase tracking-[0.3em] animate-pulse">
              Entering Interrogation Precinct...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
