"use client";

import React from "react";
import { motion } from "framer-motion";

interface InvestigationWallProps {
  className?: string;
}

/**
 * Photorealistic Evidence Board / Investigation Wall
 * Color-graded with dark pastel tones (Dark Umber, Muted Bronze, Aged Paper, Dried Maroon).
 * Includes push pins, evidence strings, latent prints, maps, ticket stubs, and subtle depth-of-field.
 */
export function InvestigationWall({ className = "" }: InvestigationWallProps) {
  return (
    <div
      className={`pointer-events-none absolute z-0 ${className}`}
      style={{
        width: "220px",
        height: "400px",
        right: "2%",
        top: "12%",
        backgroundColor: "#523C26",
        backgroundImage: `
          radial-gradient(#2E1E12 1px, transparent 1px),
          radial-gradient(#1F140A 1px, transparent 1px)
        `,
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0, 6px 6px",
        boxShadow: "inset 0 0 35px rgba(5, 3, 2, 0.95), 0 20px 45px rgba(0,0,0,0.85)",
        border: "7px solid #1E120A",
        borderRadius: "4px",
        overflow: "hidden",
        filter: "contrast(0.95) brightness(0.9)",
      }}
    >
      {/* ── Oxidized Red Strings (SVG Overlay) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {/* Connect Newspaper (50, 60) to Photo (140, 100) */}
        <motion.line
          x1="50" y1="60" x2="140" y2="100"
          stroke="#3D0C0C" strokeWidth="1.8"
          animate={{ y: [0, 0.8, -0.8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Connect Photo (140, 100) to Map (75, 215) */}
        <motion.line
          x1="140" y1="100" x2="75" y2="215"
          stroke="#3D0C0C" strokeWidth="1.8"
          animate={{ y: [0, -0.8, 0.8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Connect Map (75, 215) to Phone Record (165, 275) */}
        <motion.line
          x1="75" y1="215" x2="165" y2="275"
          stroke="#3D0C0C" strokeWidth="1.8"
          animate={{ y: [0, 1, -0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Connect Fingerprint (50, 310) to Map (75, 215) */}
        <motion.line
          x1="50" y1="310" x2="75" y2="215"
          stroke="#3D0C0C" strokeWidth="1.8"
          animate={{ y: [0, -1, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Connect Phone Record (165, 275) to Ticket (125, 360) */}
        <motion.line
          x1="165" y1="275" x2="125" y2="360"
          stroke="#3D0C0C" strokeWidth="1.8"
          animate={{ y: [0, 0.8, -0.8, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* ── Pinned Items Container ── */}
      <div className="relative w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        
        {/* 1. Newspaper Clipping */}
        <div 
          className="absolute"
          style={{
            backgroundColor: "#C5B8A5",
            width: "70px", height: "80px",
            top: "20px", left: "15px",
            transform: "rotate(-4deg)",
            padding: "4px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.8)",
            border: "1px solid #A89B88"
          }}
        >
          {/* Headline */}
          <div className="w-full h-[7px] mb-2 bg-[#2D231B]" />
          {/* Columns */}
          <div className="flex gap-1">
            <div className="flex-1 space-y-1">
              <div className="w-full h-[2px] bg-[#635546]" />
              <div className="w-full h-[2px] bg-[#635546]" />
              <div className="w-[80%] h-[2px] bg-[#635546]" />
              <div className="w-full h-[2px] bg-[#635546]" />
              <div className="w-[90%] h-[2px] bg-[#635546]" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="w-full h-[2px] bg-[#635546]" />
              <div className="w-[70%] h-[2px] bg-[#635546]" />
              <div className="w-full h-[2px] bg-[#635546]" />
              <div className="w-[85%] h-[2px] bg-[#635546]" />
            </div>
          </div>
          {/* Tag */}
          <div className="absolute -bottom-2 -left-1 bg-[#1A130E] text-[#B8AA96] font-mono text-[6px] px-1 font-bold">EV-01</div>
        </div>

        {/* 2. Victim Photo (Polaroid) */}
        <div
          className="absolute"
          style={{
            backgroundColor: "#D9D0C1",
            width: "75px", height: "90px",
            top: "60px", right: "15px",
            transform: "rotate(5deg)",
            padding: "5px 5px 16px 5px",
            boxShadow: "0 8px 18px rgba(0,0,0,0.85)",
            border: "1px solid #B0A593"
          }}
        >
          <div className="w-full h-[60px] bg-[#1A1612] relative overflow-hidden flex items-center justify-center">
            {/* Silhouette */}
            <div className="w-8 h-8 rounded-full bg-[#2E2822] mb-[-12px]" />
            <div className="absolute top-2 left-2 font-mono text-[7px] text-[#A69785]">SUBJECT #4</div>
          </div>
          <div className="font-handwriting text-[9px] text-[#28211B] mt-1 text-center font-bold">Vance, A.</div>
          <div className="absolute -top-2 -right-1 bg-[#3D0C0C] text-[#D9C8B0] font-mono text-[6px] px-1 font-bold">EV-02</div>
        </div>

        {/* 3. Map Fragment */}
        <div
          className="absolute"
          style={{
            backgroundColor: "#A8B29E", // Muted dusty olive
            width: "85px", height: "70px",
            top: "175px", left: "20px",
            transform: "rotate(-2deg)",
            padding: "4px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.8)",
            border: "1px dashed #525B49"
          }}
        >
          <div className="w-full h-full relative border border-[#525B49]/40 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border-collapse">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-[#525B49]/30" />
              ))}
            </div>
            {/* X Marker */}
            <div className="absolute top-[35%] left-[40%] text-[#3D0C0C] font-mono font-bold text-xs">✕</div>
            <div className="absolute bottom-1 right-1 font-mono text-[6px] text-[#242A1F]">GRID E7</div>
          </div>
          <div className="absolute -top-2 -left-2 bg-[#2D231B] text-[#C5B8A5] font-mono text-[6px] px-1 font-bold">EV-03</div>
        </div>

        {/* 4. Fingerprint Card */}
        <div
          className="absolute"
          style={{
            backgroundColor: "#C2B6A3",
            width: "65px", height: "65px",
            top: "275px", left: "15px",
            transform: "rotate(6deg)",
            padding: "4px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.8)",
            border: "1px solid #9E9280"
          }}
        >
          <div className="font-mono text-[6px] text-[#241D17] font-bold border-b border-[#241D17]/40 pb-0.5 mb-1">LATENT PRINT</div>
          <div className="w-8 h-10 mx-auto bg-[#1C1611] rounded-full flex items-center justify-center opacity-85">
            <div className="w-6 h-8 border border-[#5C4F41] rounded-full opacity-60" />
          </div>
          <div className="font-mono text-[5px] text-[#3D0C0C] text-center font-bold mt-0.5">MATCH: 97.4%</div>
        </div>

        {/* 5. Phone Record */}
        <div
          className="absolute"
          style={{
            backgroundColor: "#BDB09A",
            width: "70px", height: "75px",
            top: "235px", right: "15px",
            transform: "rotate(-5deg)",
            padding: "4px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.8)",
            border: "1px solid #998D79"
          }}
        >
          <div className="font-mono text-[6px] text-[#211A14] font-bold border-b border-[#211A14]/40 pb-0.5 mb-1 uppercase">Call Log — 10/14</div>
          <div className="space-y-0.5 font-mono text-[5px] text-[#2B231D]">
            <div>02:14 - (555) 0192</div>
            <div className="text-[#3D0C0C] font-bold">02:18 - UNKNOWN</div>
            <div>03:05 - (555) 0144</div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#1A130E] text-[#B8AA96] font-mono text-[6px] px-1 font-bold">EV-04</div>
        </div>

        {/* 6. Train Ticket Stub */}
        <div
          className="absolute"
          style={{
            backgroundColor: "#8C7B65", // Weathered bronze ticket
            width: "80px", height: "35px",
            top: "340px", left: "65px",
            transform: "rotate(3deg)",
            padding: "3px 6px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.85)",
            borderLeft: "2px dashed #4A3F32",
            borderRight: "1px solid #4A3F32"
          }}
        >
          <div className="font-mono text-[6px] text-[#1C1610] font-bold tracking-widest">ONE WAY — NORTH</div>
          <div className="font-mono text-[5px] text-[#2E241B]">DEPART: 23:45 HRS</div>
          <div className="font-mono text-[5px] text-[#3D0C0C] font-bold">STATUS: USED</div>
          <div className="absolute -top-2 left-2 bg-[#2D231B] text-[#C5B8A5] font-mono text-[6px] px-1 font-bold">EV-05</div>
        </div>

        {/* ── Push Pins ── */}
        <div className="absolute top-[58px] left-[48px] w-2.5 h-2.5 rounded-full bg-[#3D0C0C] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#6E1C1C]" />
        <div className="absolute top-[98px] right-[48px] w-2.5 h-2.5 rounded-full bg-[#3D0C0C] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#6E1C1C]" />
        <div className="absolute top-[212px] left-[72px] w-2.5 h-2.5 rounded-full bg-[#8C6B30] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#B38D46]" />
        <div className="absolute top-[272px] right-[48px] w-2.5 h-2.5 rounded-full bg-[#3D0C0C] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#6E1C1C]" />
        <div className="absolute top-[308px] left-[48px] w-2.5 h-2.5 rounded-full bg-[#2B3527] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#44543E]" />
        <div className="absolute top-[358px] left-[122px] w-2.5 h-2.5 rounded-full bg-[#3D0C0C] shadow-[1px_2px_4px_rgba(0,0,0,0.9)] z-20 border border-[#6E1C1C]" />

      </div>
    </div>
  );
}
