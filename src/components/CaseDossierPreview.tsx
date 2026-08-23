"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { forensicAudio } from "@/lib/forensicAudio";
import { Lightbulb, Eye, X, ZoomIn } from "lucide-react";

export interface CaseDossierPreviewProps {
  onFlipToMenu?: () => void;
  className?: string;
}

interface InspectedItem {
  id: string;
  title: string;
  image: string;
  tag: string;
  timestamp: string;
  notes: string;
  forensicSummary: string;
  microDetail?: string;
}

export default function CaseDossierPreview({
  onFlipToMenu,
  className = "",
}: CaseDossierPreviewProps) {
  // ── 1. Interactive UV Blacklight State ──
  const [isUvOn, setIsUvOn] = useState(false);
  const [isHoveringUvDetail, setIsHoveringUvDetail] = useState(false);

  // ── 2. Peeking Carbon-Copy Slips State ──
  const [activeCarbonSlip, setActiveCarbonSlip] = useState<"yellow" | "pink" | null>(null);

  // ── 3. High-Res Photo Loupe Inspection Modal State ──
  const [inspectedPhoto, setInspectedPhoto] = useState<InspectedItem | null>(null);

  // ── 4. Keyboard Shortcuts (U for UV Torch) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "u" || e.key === "U") {
        setIsUvOn((prev) => {
          const next = !prev;
          forensicAudio.playUvSwitch(next);
          return next;
        });
      }
      if (e.key === "Escape" && inspectedPhoto) {
        forensicAudio.playPhotoInspect();
        setInspectedPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectedPhoto]);

  const toggleUvTorch = () => {
    setIsUvOn((prev) => {
      const next = !prev;
      forensicAudio.playUvSwitch(next);
      return next;
    });
  };

  const handleOpenPhoto = (item: InspectedItem) => {
    forensicAudio.playPhotoInspect();
    setInspectedPhoto(item);
  };

  const handleClosePhoto = () => {
    forensicAudio.playPhotoInspect();
    setInspectedPhoto(null);
  };

  return (
    <div
      className={`relative w-full max-w-6xl min-h-[720px] rounded-lg overflow-hidden shadow-[0_45px_120px_rgba(0,0,0,0.98)] select-none border border-[#3b3226] ${
        isUvOn ? "ring-2 ring-purple-500/50 shadow-[0_0_80px_rgba(147,51,234,0.35)]" : ""
      } ${className}`}
      style={{
        perspective: 1800,
      }}
    >
      {/* ── SVG TURBULENCE FOR DEBOSSED STAMPS & LATENT RIDGES ── */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="deboss-stamp-preview">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="rough" />
            <feDisplacementMap in="SourceGraphic" in2="rough" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ── DESK LIGHTING: WARM RADIAL BANKER'S LAMP WITH UV OVERLAY ── */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          background: isUvOn
            ? "radial-gradient(circle at 45% 30%, rgba(139, 92, 246, 0.45) 0%, rgba(30, 10, 60, 0.95) 75%)"
            : "radial-gradient(circle at 25% 20%, rgba(255, 235, 190, 0.18) 0%, rgba(10, 8, 6, 0.6) 80%)",
          mixBlendMode: isUvOn ? "screen" : "normal",
        }}
      />

      {/* ── FLOATING UV TORCH TOGGLE ON DESK EDGE ── */}
      <div className="absolute top-4 right-6 z-50 flex items-center gap-3">
        <button
          onClick={toggleUvTorch}
          onMouseEnter={() => forensicAudio.playPenFriction()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer ${
            isUvOn
              ? "bg-purple-600 text-white shadow-[0_0_20px_#9333ea] border border-purple-300"
              : "bg-[#1f1a14]/90 text-amber-200/80 hover:text-white border border-[#4a3d2e] hover:border-amber-400/50"
          }`}
          title="Toggle Forensic UV Blacklight (Press U)"
        >
          <Lightbulb size={12} className={isUvOn ? "animate-pulse text-purple-200" : ""} />
          <span>{isUvOn ? "UV BLACKLIGHT [ACTIVE]" : "UV BLACKLIGHT [PRESS U]"}</span>
        </button>
      </div>

      {/* ── MAIN 2-PAGE SPREAD ── */}
      <div className="relative z-20 flex flex-col md:flex-row w-full h-full min-h-[720px] bg-[#1a140d]">
        
        {/* ══════════════════════════════════════════════════════════
            LEFT PAGE: EVIDENCE LOG (Aged Forensic Parchment)
           ══════════════════════════════════════════════════════════ */}
        <div
          className="relative w-full md:w-1/2 p-6 md:p-8 bg-[#ebe3cd] border-r border-[#2d2419] flex flex-col justify-between overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(255,255,255,0.4) 0%, transparent 60%),
              radial-gradient(circle at 85% 85%, rgba(60,40,20,0.15) 0%, transparent 70%)
            `,
            boxShadow: "inset -12px 0 28px rgba(0,0,0,0.35)",
          }}
        >
          {/* Header */}
          <div className="border-b-[3px] border-[#1a1612] pb-2 mb-4 flex justify-between items-end">
            <div>
              <h2 className="font-serif text-3xl font-black text-[#1a1612] tracking-wider uppercase">
                Evidence Log
              </h2>
              <p className="font-mono text-[10px] font-black tracking-widest text-[#4a3520]">
                DEPT. 09 · CASE #884-DELTA · FORENSIC DIVISION
              </p>
            </div>
            <span className="font-mono text-[10px] font-black text-[#1a1612]">PAGE 1 / 3</span>
          </div>

          {/* Grid Layout of Evidence Cards */}
          <div className="grid grid-cols-2 gap-4 flex-1 relative z-20">
            
            {/* Top Left: Evidence #11 Threat Note (With Paperclip) */}
            <motion.div
              whileHover={{ scale: 1.03, rotate: -3 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "ev-11",
                  title: "Handwritten Threat Note",
                  image: "/threat-note.jpg",
                  tag: "EVIDENCE #11 · VEHICLE WINDSHIELD",
                  timestamp: "10/14 01:55 HRS",
                  notes: "Recovered pinned to victim's windshield. Ink composition matches standard ballpoint black ink.",
                  forensicSummary: "Graphology index: 94.2% match with suspect's handwriting ledger.",
                  microDetail: "High-magnification scan shows tearing along top margin consistent with a spiral notepad.",
                })
              }
              className="relative bg-white/95 border border-[#4a0e0e] p-2.5 shadow-md -rotate-2 cursor-pointer group"
            >
              {/* Metallic Paperclip on top-left margin */}
              <div
                className="absolute -top-3 left-4 w-3.5 h-10 rounded-full border-2 border-zinc-400 z-30"
                style={{
                  background: "linear-gradient(45deg, rgba(255,255,255,0.7), rgba(100,100,100,0.2))",
                  filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.65))",
                }}
              />

              <div className="w-full aspect-[4/3] overflow-hidden mb-1 relative border border-black/20 bg-neutral-900">
                <img src="/threat-note.jpg" alt="Threat Note" className="w-full h-full object-cover contrast-125" />
                <div className="absolute inset-0 bg-red-950/0 group-hover:bg-red-950/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                    <ZoomIn size={8} /> [INSPECT]
                  </span>
                </div>
              </div>
              <p className="font-mono text-[8px] text-center text-red-950 font-black uppercase">
                EVIDENCE #11 🔍
              </p>
            </motion.div>

            {/* Top Right: Coroner's Report & Blood Serum with PEAKING CARBON COPIES */}
            <div className="row-span-2 relative flex flex-col">
              
              {/* PEEKING CANARY YELLOW CARBON COPY SLIP */}
              <motion.div
                animate={{
                  x: activeCarbonSlip === "yellow" ? 36 : 10,
                  y: activeCarbonSlip === "yellow" ? -6 : -4,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onMouseEnter={() => {
                  setActiveCarbonSlip("yellow");
                  forensicAudio.playPaperSlide();
                }}
                onMouseLeave={() => setActiveCarbonSlip(null)}
                className="absolute inset-0 bg-[#fff9c4] border border-[#d4c86a] p-3 text-[#332f1a] shadow-md z-10 -rotate-1 rounded-xs cursor-pointer"
                title="Hover to slide toxicologist carbon copy"
              >
                <span className="font-mono text-[7px] font-bold block border-b border-[#332f1a]/20 pb-0.5 text-amber-900">
                  DUPLICATE TOXICOLOGY RECEIPT
                </span>
                <p className="font-mono text-[7.5px] leading-tight mt-1 text-[#2d2419]">
                  <em>&ldquo;Coroner note: 3ml unaccounted for in sample B. Sedative administered post-mortem?&rdquo;</em>
                </p>
              </motion.div>

              {/* PEEKING PINK CARBON COPY SLIP */}
              <motion.div
                animate={{
                  x: activeCarbonSlip === "pink" ? -28 : -8,
                  y: activeCarbonSlip === "pink" ? 18 : 12,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onMouseEnter={() => {
                  setActiveCarbonSlip("pink");
                  forensicAudio.playPaperSlide();
                }}
                onMouseLeave={() => setActiveCarbonSlip(null)}
                className="absolute inset-0 bg-[#ffebee] border border-[#e0b0b8] p-3 text-[#4a1c24] shadow-md z-10 rotate-2 rounded-xs cursor-pointer"
                title="Hover to slide coroner carbon copy"
              >
                <span className="font-mono text-[7px] font-bold block border-b border-[#4a1c24]/20 pb-0.5 text-red-900">
                  AUTOPSY SUMMARY COPY
                </span>
                <p className="font-mono text-[7.5px] leading-tight mt-1 text-[#4a1c24]">
                  <em>&ldquo;Laceration depth confirms serrated combat blade (45° thrust angle).&rdquo;</em>
                </p>
              </motion.div>

              {/* PRIMARY CORONER REPORT CARD */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() =>
                  handleOpenPhoto({
                    id: "ev-coroner",
                    title: "Coroner Blood Toxicology Report",
                    image: "/coroner-report.jpg",
                    tag: "AUTOPSY-900 · FORENSIC PATHOLOGY",
                    timestamp: "10/14 04:30 HRS",
                    notes: "Confirmed blunt force trauma to temporal lobe prior to lacerations. Foreign blood type on victim's jacket.",
                    forensicSummary: "Blood: O-POS · Hemoglobin: 7.4 g/dL · Toxicology: 0.14 mg/L synthetic sedative.",
                    microDetail: "High-resolution view reveals chemical formula annotations written in invisible fluorescence.",
                  })
                }
                className="relative z-20 bg-white/95 border-2 border-[#1a1612] p-3 shadow-lg rotate-1 flex flex-col flex-1 cursor-pointer group"
              >
                {/* Rusty staple top center */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-zinc-600 border border-zinc-800 rounded-xs shadow-xs" />

                <div className="w-full aspect-square overflow-hidden mb-2 border border-black/20 relative bg-neutral-900">
                  <img src="/coroner-report.jpg" alt="Coroner Report" className="w-full h-full object-cover contrast-125 saturate-50" />
                  
                  {/* UV FLUORESCENT GREEN CHEMICAL NOTATIONS */}
                  {isUvOn && (
                    <div className="absolute inset-0 bg-purple-950/40 p-2 flex flex-col justify-between pointer-events-none animate-pulse">
                      <span className="font-mono text-[7.5px] text-[#22c55e] font-black tracking-widest bg-black/60 px-1 py-0.5">
                        [UV] DIGOXIN TRACE: 0.14mg/L
                      </span>
                      <span className="font-mono text-[7px] text-[#a3e635] font-black bg-black/60 px-1 py-0.5">
                        [UV] LATENT RESIDUE ON CAP
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                      <ZoomIn size={8} /> [INSPECT]
                    </span>
                  </div>
                </div>

                <h3 className="font-mono text-[10px] font-black border-b-2 border-[#1a1612] pb-1 mb-1 tracking-widest uppercase text-[#1a1612]">
                  Blood Serum #4920-B 🔍
                </h3>

                <table className="w-full font-mono text-[8px] text-[#1a1612]">
                  <tbody>
                    {[
                      ["BLOOD TYPE", "O-POS (MISMATCH)"],
                      ["HEMOGLOBIN", "7.4 g/dL"],
                      ["TOXICOLOGY", "0.14 mg/L (SEDATIVE)"],
                      ["DNA MATCH", "ALBRIGHT, M. (97.4%)"],
                      ["STATUS", "LETHAL HEMORRHAGE"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-[#1a1612]/20">
                        <td className="py-0.5 font-black pr-1 text-[#4a3520]">{k}</td>
                        <td className="py-0.5 font-black text-red-900 relative">
                          {/* Red grease pencil underline for sedative */}
                          {k === "TOXICOLOGY" && (
                            <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-red-600/70 -rotate-1 pointer-events-none" />
                          )}
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>

            {/* Middle Left: Incident Field Dispatch */}
            <div className="bg-[#fff9e6] border-2 border-[#1a1612] p-3 shadow-xs rotate-1">
              <h3 className="font-mono text-[9px] font-black border-b-2 border-[#1a1612] pb-1 mb-1 uppercase tracking-widest text-[#1a1612]">
                Incident Field Dispatch
              </h3>
              <p className="font-mono text-[8px] font-bold text-[#1a1612] leading-tight text-justify">
                02:14 HRS: Unit 4 dispatched to Grid E7. Victim located under pine canopy. 
                Blood splatter trajectory indicates blunt force trauma followed by lacerations at 45° angle. 
                Shell casings tagged at markers 4 &amp; 5. Perimeter secured at 03:00 HRS.
              </p>
            </div>

            {/* Bottom Left: Latent Print AFIS Card */}
            <motion.div
              whileHover={{ scale: 1.04, rotate: -2 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "ev-latent",
                  title: "Latent Fingerprint #884",
                  image: "/suspect1.jpg",
                  tag: "LATENT PRINT · WEAPON RECOVERY",
                  timestamp: "10/14 02:45 HRS",
                  notes: "Partial thumbprint lifted from brass revolver cylinder. AFIS database confirms 97.4% match with Subject A.",
                  forensicSummary: "14 minutiae points matched. No smudging on core delta whorl.",
                  microDetail: "UV inspection reveals unindexed secondary friction ridge patterns along lateral margin.",
                })
              }
              className="bg-white/95 border-2 border-[#1a1612] p-2 shadow-md -rotate-3 flex flex-col cursor-pointer group"
            >
              <h3 className="font-mono text-[9px] font-black border-b-2 border-[#1a1612] pb-1 mb-1 uppercase tracking-widest text-[#1a1612]">
                Latent Print #884 🔍
              </h3>
              <div className="relative w-full flex-1 overflow-hidden border border-[#1a1612]/40 min-h-[4rem] bg-neutral-900">
                <img
                  src="/suspect1.jpg"
                  alt="Latent Print"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] object-cover grayscale contrast-[3.0] brightness-90"
                />
                
                {/* UV CYAN / GREEN UNINDEXED FRICTION RIDGES */}
                {isUvOn && (
                  <div className="absolute inset-0 bg-purple-950/60 flex items-center justify-center p-1 pointer-events-none animate-pulse">
                    <span className="font-mono text-[7px] text-[#06b6d4] font-black tracking-widest bg-black/80 px-1 py-0.5 text-center">
                      [UV] UNINDEXED LATERAL RIDGE DETECTED
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-red-950/20 group-hover:bg-red-950/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-mono text-[7px] text-white bg-black/85 px-1 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                    <ZoomIn size={8} /> [INSPECT]
                  </span>
                </div>
              </div>
              <p className="font-mono text-[8px] mt-1 text-[#4a0000] font-black text-center">
                MATCH: 97.4% [AFIS CONFIRMED]
              </p>
            </motion.div>
          </div>

          {/* Signature & Debossed Authorization Stamp */}
          <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-end justify-between z-30 shrink-0">
            <div>
              <p className="font-serif text-2xl text-[#1a1612] font-black italic -rotate-2" style={{ fontFamily: "'Caveat', cursive, serif" }}>
                Det. R. Runewall
              </p>
              <div className="font-mono text-[9px] font-black uppercase tracking-widest text-[#4a3520]">
                Lead Investigator — Div. 09
              </div>
            </div>

            {/* DEBOSSED AUTHORIZATION STAMP WITH SVG TURBULENCE */}
            <div
              className="border-[3px] border-[#500000] px-3 py-1 -rotate-6 bg-red-950/10 text-[#500000] font-mono text-[9px] font-black tracking-widest uppercase leading-tight text-center select-none"
              style={{
                boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 1px rgba(255,255,255,0.12)",
                filter: "url(#deboss-stamp-preview)",
              }}
            >
              AUTHORIZATION<br />GRANTED
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PAGE: CONSPIRACY BOARD (Link Matrix & Sticky Notes)
           ══════════════════════════════════════════════════════════ */}
        <div
          className="relative w-full md:w-1/2 p-6 md:p-8 bg-[#d6ccb2] flex flex-col justify-between overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 75% 25%, rgba(255,255,255,0.3) 0%, transparent 60%),
              radial-gradient(circle at 25% 75%, rgba(40,30,15,0.2) 0%, transparent 70%)
            `,
            boxShadow: "inset 12px 0 28px rgba(0,0,0,0.35)",
          }}
        >
          {/* Header */}
          <div className="border-b-[3px] border-[#1a1612] pb-2 mb-4 flex justify-between items-end">
            <div>
              <h2 className="font-serif text-3xl font-black text-[#1a1612] tracking-wider uppercase">
                Conspiracy Board
              </h2>
              <p className="font-mono text-[10px] font-black tracking-widest text-[#8b0000]">
                LINK MATRIX — ACTIVE INVESTIGATION
              </p>
            </div>
            <span className="font-mono text-[10px] font-black text-[#1a1612]">PAGE 2 / 3</span>
          </div>

          {/* SVG CRIMSON THREAD WEB WITH CATENARY SAG BEZIERS */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.6))" }}>
            {[
              { d: "M 50 18 Q 32 30 18 36", delay: 0.1, dash: "none", w: 3 },
              { d: "M 50 18 Q 50 28 50 42", delay: 0.2, dash: "none", w: 3 },
              { d: "M 50 18 Q 68 30 82 36", delay: 0.3, dash: "none", w: 3 },
              { d: "M 18 36 Q 14 52 14 68", delay: 0.4, dash: "4 4", w: 2 },
              { d: "M 50 42 Q 44 58 40 72", delay: 0.5, dash: "none", w: 2.5 },
              { d: "M 50 42 Q 62 58 68 72", delay: 0.6, dash: "none", w: 2.5 },
              { d: "M 82 36 Q 86 52 86 68", delay: 0.7, dash: "none", w: 3 },
            ].map(({ d, delay, dash, w }, i) => (
              <motion.path
                key={i}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay }}
                d={d}
                fill="none"
                stroke="#8B0000"
                strokeWidth={w / 5}
                strokeDasharray={dash}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* UV FLUORESCENT SPATTER TRAIL FROM GROUND ZERO TO SUSPECT 3 */}
            {isUvOn && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                d="M 50 22 Q 65 30 82 38"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Nodes Matrix & Polaroid Cards */}
          <div className="relative flex-1 z-20">
            
            {/* Node 0: Ground Zero Crime Scene Node */}
            <motion.div
              drag
              dragConstraints={{ left: -10, right: 10, top: -10, bottom: 10 }}
              dragElastic={0.2}
              whileHover={{ scale: 1.04 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "ev-groundzero",
                  title: "Ground Zero — Primary Crime Scene",
                  image: "/forensic-body.jpg",
                  tag: "GROUND ZERO · GRID E7",
                  timestamp: "10/14 02:14 HRS",
                  notes: "Victim found in supine position with severe defensive trauma on both wrists. Clear drag marks originating 15ft north.",
                  forensicSummary: "Lividity matches estimated time of death 02:00-02:30 HRS. Two foreign fibers recovered from collar.",
                  microDetail: "High-magnification view reveals faint blood spatter impact angles indicating two separate weapon strikes.",
                })
              }
              className="absolute top-[2%] left-[50%] -translate-x-1/2 w-32 md:w-36 z-30 rotate-[-1deg] cursor-pointer"
            >
              <div className="bg-white p-1.5 pb-6 shadow-2xl border-4 border-red-950 relative">
                {/* 3D Acrylic Red Pushpin Left */}
                <div
                  className="absolute -top-1.5 left-2 w-3.5 h-3.5 rounded-full border border-red-900 z-40"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)",
                    boxShadow: "2px 4px 6px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.4)",
                  }}
                />
                {/* 3D Acrylic Red Pushpin Right */}
                <div
                  className="absolute -top-1.5 right-2 w-3.5 h-3.5 rounded-full border border-red-900 z-40"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)",
                    boxShadow: "2px 4px 6px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.4)",
                  }}
                />

                <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                  <img src="/forensic-body.jpg" alt="Body" className="w-full h-full object-cover contrast-150" />
                </div>
                <p className="mt-1 text-center font-mono text-[9px] font-black tracking-widest uppercase">
                  GROUND ZERO 🔍
                </p>
              </div>

              {/* DYNAMIC PEELING STICKY NOTE: "Who moved the body??" */}
              <motion.div
                whileHover={{ rotate: 16, y: -4 }}
                onMouseEnter={() => forensicAudio.playStickyPeel()}
                className="absolute -right-16 top-6 w-28 h-16 bg-[#fffdcf] shadow-md border border-[#e6e08a] rotate-[12deg] p-1.5 flex items-center justify-center cursor-grab active:cursor-grabbing z-40"
                style={{
                  boxShadow: "3px 5px 12px rgba(0,0,0,0.35)",
                }}
              >
                <p className="font-serif text-[13px] font-bold text-red-800 leading-none text-center" style={{ fontFamily: "'Caveat', cursive, serif" }}>
                  Who moved the body??
                </p>
              </motion.div>
            </motion.div>

            {/* Node 1: Suspect 1 (Marcus Albright) */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "subj-1",
                  title: "Subject 1 — Marcus Albright",
                  image: "/suspect1.jpg",
                  tag: "SUSPECT #1 · PERSON OF INTEREST",
                  timestamp: "LAST SEEN: 10/13 23:45 HRS",
                  notes: "Cell tower ping registers 0.4 miles from crime scene at 02:10 HRS. Severe financial motive.",
                  forensicSummary: "Latent print on revolver matched. Alibi unconfirmed.",
                  microDetail: "Fibers on left cuff match yarn recovered from scene perimeter.",
                })
              }
              className="absolute top-[26%] left-[4%] w-28 rotate-[4deg] cursor-pointer"
            >
              <div className="bg-white p-1.5 pb-5 shadow-xl border border-neutral-300 relative">
                {/* 3D Pushpin */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-red-900 z-40"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)",
                    boxShadow: "2px 3px 5px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.4)",
                  }}
                />
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <img src="/suspect1.jpg" alt="Suspect 1" className="w-full h-full object-cover grayscale contrast-125" />
                </div>
                <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ A 🔍</p>
              </div>

              {/* Dynamic Sticky Note: "Alibi for the 14th?" */}
              <motion.div
                whileHover={{ rotate: -12, y: -3 }}
                onMouseEnter={() => forensicAudio.playStickyPeel()}
                className="absolute -bottom-5 -right-10 w-24 h-12 bg-blue-100/95 shadow-md rotate-[-8deg] p-1 flex items-center justify-center border border-blue-300 z-30"
              >
                <p className="font-serif text-[12px] font-bold text-blue-900 leading-tight" style={{ fontFamily: "'Caveat', cursive, serif" }}>
                  Alibi for the 14th?
                </p>
              </motion.div>
            </motion.div>

            {/* Node 2: Evidence Weapon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -4 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "ev-weapon",
                  title: "Murder Weapon #1 — Caliber .38 Revolver",
                  image: "/evidence-weapon.jpg",
                  tag: "BALLISTICS · RECOVERED IN CREEK",
                  timestamp: "10/14 06:15 HRS",
                  notes: "Serial number filed off with coarse abrasive. 2 spent casings in cylinder.",
                  forensicSummary: "Striation marks match lead fragments extracted from crime scene timber.",
                  microDetail: "High-power macro reveals partial serial digits under chemical etching.",
                })
              }
              className="absolute top-[32%] left-[50%] -translate-x-1/2 w-28 rotate-[-5deg] cursor-pointer"
            >
              <div className="bg-white p-1.5 pb-5 shadow-xl border border-neutral-300 relative">
                {/* 3D Pushpin */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-red-900 z-40"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)",
                    boxShadow: "2px 3px 5px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.4)",
                  }}
                />
                <div className="relative w-full aspect-square overflow-hidden">
                  <img src="/evidence-weapon.jpg" alt="Weapon" className="w-full h-full object-cover contrast-125 saturate-150" />
                </div>
                <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest uppercase">
                  WEAPON #1 🔍
                </p>
              </div>

              {/* Dynamic Sticky Note: "Filed off serial?!" */}
              <motion.div
                whileHover={{ rotate: 10, y: -3 }}
                onMouseEnter={() => forensicAudio.playStickyPeel()}
                className="absolute -left-12 top-4 w-22 h-12 bg-yellow-100 shadow-md rotate-[5deg] p-1 flex items-center justify-center border border-yellow-400 z-30"
              >
                <p className="font-serif text-[11px] font-bold text-neutral-800 leading-tight" style={{ fontFamily: "'Caveat', cursive, serif" }}>
                  Filed off serial?!
                </p>
              </motion.div>
            </motion.div>

            {/* Node 3: Suspect 2 (Elena Vance) with RED WAX GREASE PENCIL LOOP */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              onClick={() =>
                handleOpenPhoto({
                  id: "subj-2",
                  title: "Subject 2 — Elena Vance",
                  image: "/suspect2.jpg",
                  tag: "SUSPECT #2 · CO-CONSPIRATOR",
                  timestamp: "INTERROGATED: 10/14 08:00 HRS",
                  notes: "Wife of primary victim. Toll booth records contradict her alibi statement.",
                  forensicSummary: "Vehicle spotted at North Turnpike 02:40 HRS.",
                  microDetail: "Passenger seat blood residue confirmed.",
                })
              }
              className="absolute top-[26%] right-[4%] w-28 rotate-[6deg] cursor-pointer"
            >
              <div className="bg-white p-1.5 pb-5 shadow-xl border border-neutral-300 relative">
                {/* RED WAX GREASE PENCIL LOOP AROUND FACE */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  <ellipse
                    cx="50%"
                    cy="40%"
                    rx="32%"
                    ry="28%"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                    transform="rotate(-8 50 40)"
                  />
                </svg>

                {/* 3D Pushpin */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-red-900 z-40"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)",
                    boxShadow: "2px 3px 5px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.4)",
                  }}
                />
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <img src="/suspect2.jpg" alt="Suspect 2" className="w-full h-full object-cover grayscale contrast-125" />
                </div>
                <p className="mt-1 text-center font-mono text-[8px] font-black tracking-widest">SUBJ B 🔍</p>
              </div>

              {/* Dynamic Sticky Note: "Why did she lie?" */}
              <motion.div
                whileHover={{ rotate: -14, y: -3 }}
                onMouseEnter={() => forensicAudio.playStickyPeel()}
                className="absolute -bottom-6 -left-10 w-24 h-12 bg-green-100 shadow-md rotate-[-12deg] p-1 flex items-center justify-center border border-green-300 z-30"
              >
                <p className="font-serif text-[12px] font-bold text-green-900 leading-tight" style={{ fontFamily: "'Caveat', cursive, serif" }}>
                  Why did she lie?
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Action: [FLIP TO MENU] -> */}
          <div className="border-t-2 border-black/20 pt-3 flex justify-end items-center z-30 shrink-0">
            <motion.button
              whileHover={{ scale: 1.06, x: 4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                forensicAudio.playPenFriction();
                if (onFlipToMenu) onFlipToMenu();
              }}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="group flex items-center gap-2 px-5 py-2 rounded-xs bg-[#24170d] hover:bg-[#3d2412] text-[#f4ecd8] border border-[#d4a227]/40 shadow-lg cursor-pointer transition-all"
            >
              <span className="font-mono text-xs font-black tracking-[0.25em] uppercase text-[#f4ecd8] group-hover:text-amber-200">
                [FLIP TO MENU] -&gt;
              </span>
            </motion.button>
          </div>
        </div>

        {/* ── CENTRAL BOOK SPINE GUTTER & CREASE SHADOW ── */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-30 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.45) 100%)",
            boxShadow: "0 0 10px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════
          HIGH-RES EVIDENCE PHOTO LOUPE / INSPECTION MODAL
         ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {inspectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClosePhoto}
          >
            <motion.div
              initial={{ scale: 0.75, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#f4ecd8] p-6 md:p-8 rounded shadow-2xl border-4 border-[#3a2512] text-[#1a140d]"
            >
              {/* Close Button */}
              <button
                onClick={handleClosePhoto}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#3a2512] text-[#f4ecd8] hover:bg-red-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#8b0000] block mb-1">
                {inspectedPhoto.tag}
              </span>
              <h3 className="font-serif text-2xl font-black text-[#1a140d] mb-4">
                {inspectedPhoto.title}
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 aspect-square bg-black border-2 border-[#3a2512] overflow-hidden shadow-inner relative">
                  <img
                    src={inspectedPhoto.image}
                    alt={inspectedPhoto.title}
                    className="w-full h-full object-cover contrast-125"
                  />
                </div>

                <div className="w-full md:w-1/2 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-[#6b553d] uppercase">TIMESTAMP:</span>
                    <p className="font-bold text-[#1a140d]">{inspectedPhoto.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#6b553d] uppercase">FIELD NOTES:</span>
                    <p className="text-[#2b2116] leading-relaxed">{inspectedPhoto.notes}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#6b553d] uppercase">FORENSIC ANALYSIS:</span>
                    <p className="text-[#4a0000] font-bold leading-relaxed">{inspectedPhoto.forensicSummary}</p>
                  </div>
                  {inspectedPhoto.microDetail && (
                    <div className="bg-[#e8dfc5] p-2.5 rounded border border-[#c4b595]">
                      <span className="text-[8px] font-bold text-[#8b0000] uppercase block">
                        🔬 HIGH-MAGNIFICATION LOUPE:
                      </span>
                      <p className="text-[10px] text-[#1a140d] italic leading-tight mt-0.5">
                        {inspectedPhoto.microDetail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
