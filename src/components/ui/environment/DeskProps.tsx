"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeskPropsComponentProps {
  className?: string;
  onInspectNotebook?: () => void;
}

/**
 * DeskProps — Realistic, tactile detective field props (uncluttered & perimeter-aligned).
 * • Detective Field Notebook: Positioned at mid-left (top 48%, left 2.5%).
 * • Brass Magnifying Glass: Positioned at bottom-left (bottom 4%, left 3%).
 */
export const DeskProps = ({ className = "", onInspectNotebook }: DeskPropsComponentProps) => {
  const [glintVisible, setGlintVisible] = useState(false);
  const [isMagnifierHovered, setIsMagnifierHovered] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setGlintVisible(true);
      setTimeout(() => setGlintVisible(false), 900);
    }, 7000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>

      {/* ══════════════════════════════════════════════════
          1. DETECTIVE FIELD NOTEBOOK (Aged Brown Leather & Ruled Paper)
          ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          top: "48%",
          left: "2.5%",
          width: "clamp(180px, 13.5vw, 215px)",
          filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.98))",
          transform: "rotate(-2deg)",
        }}
        whileHover={{ scale: 1.03, rotate: -0.5 }}
        onClick={onInspectNotebook}
        title="Detective Field Notebook — Case 900-B"
      >
        {/* Leather notebook cover */}
        <div style={{
          width: "100%",
          height: "clamp(235px, 18vw, 275px)",
          background: "linear-gradient(170deg, #3A2412 0%, #29180B 55%, #1A0E06 100%)",
          borderRadius: "3px 6px 6px 3px",
          boxShadow: "inset 0 0 0 1px rgba(255,200,100,0.15), 0 12px 28px rgba(0,0,0,0.95)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Leather spine with stitch marks */}
          <div className="absolute left-0 top-0 bottom-0 w-[11px]"
            style={{
              background: "linear-gradient(90deg, #150A04 0%, #2A170A 100%)",
              borderRight: "1px solid rgba(0,0,0,0.7)"
            }}
          />
          {/* Metal ring bindings */}
          <div className="absolute left-[3.5px] top-[20%] w-[11px] h-[11px] rounded-full border-2"
            style={{ borderColor: "#8A6830", background: "#100904", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)" }} />
          <div className="absolute left-[3.5px] top-[50%] w-[11px] h-[11px] rounded-full border-2"
            style={{ borderColor: "#8A6830", background: "#100904", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)" }} />
          <div className="absolute left-[3.5px] top-[80%] w-[11px] h-[11px] rounded-full border-2"
            style={{ borderColor: "#8A6830", background: "#100904", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)" }} />

          {/* Aged paper page area */}
          <div className="absolute left-[13px] top-0 right-0 bottom-0 overflow-hidden"
            style={{
              backgroundColor: "#EDE4CE",
              boxShadow: "inset 3px 0 8px rgba(0,0,0,0.35)"
            }}
          >
            {/* Ruled blue lines */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="absolute w-full h-[1px]"
                style={{ top: `${11 + i * 14}%`, backgroundColor: "rgba(70,100,160,0.22)" }} />
            ))}
            {/* Red left margin line */}
            <div className="absolute top-0 bottom-0 w-[1.5px] left-[16px]"
              style={{ backgroundColor: "rgba(200,40,40,0.4)" }} />

            {/* Handwritten case notes in authentic dark ink */}
            <div className="absolute inset-0 pl-5 pr-3 pt-3 pb-2 select-none"
              style={{ fontFamily: "'Caveat', cursive", color: "#1C140E", lineHeight: 1.55 }}>
              <p style={{ fontSize: "9.5px", fontWeight: 700, textDecoration: "underline", color: "#6B0000", marginBottom: "3px" }}>
                CASE #900-B · FIELD NOTES
              </p>
              <p style={{ fontSize: "8px", fontWeight: 600 }}>• V. discovered 02:14. No sign<br />  of forced entry at scene.</p>
              <p style={{ fontSize: "8px", fontWeight: 600, marginTop: "3px" }}>• Blood type O+ found on sleeve —<br />  DNA mismatch with victim.</p>
              <p style={{ fontSize: "8px", fontWeight: 700, marginTop: "3px", color: "#8B0000" }}>• Check Albright's alibi for 14th!</p>
              <p style={{ fontSize: "8px", fontWeight: 700, marginTop: "2px", color: "#1A2E50" }}>
                → AFIS Print #884 confirmed.
              </p>

              {/* Dried blood thumbprint at bottom */}
              <svg className="absolute" style={{ bottom: "5%", right: "6%" }}
                viewBox="0 0 30 35" width="28" height="32" xmlns="http://www.w3.org/2000/svg" opacity="0.85">
                <ellipse cx="15" cy="17" rx="11" ry="13" fill="none" stroke="#7A0C0C" strokeWidth="0.8" />
                <path d="M 10 8 Q 15 5 20 8" fill="none" stroke="#7A0C0C" strokeWidth="0.7" />
                <path d="M 7 14 Q 15 10 23 14" fill="none" stroke="#7A0C0C" strokeWidth="0.7" />
                <path d="M 5 19 Q 15 15 25 19" fill="none" stroke="#7A0C0C" strokeWidth="0.7" />
                <path d="M 6 24 Q 15 20 24 24" fill="none" stroke="#7A0C0C" strokeWidth="0.7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vintage wooden pencil resting against notebook */}
        <div className="absolute z-20"
          style={{ bottom: "-8px", right: "-30px", width: "10px", height: "95px", transform: "rotate(-32deg)", transformOrigin: "bottom center" }}>
          <svg viewBox="0 0 12 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="10" width="10" height="85" fill="#D49B28" />
            <rect x="2" y="10" width="2" height="85" fill="#F0C050" opacity="0.7" />
            <rect x="1" y="85" width="10" height="8" fill="#A8A29E" />
            <rect x="1" y="93" width="10" height="12" fill="#BE123C" />
            <path d="M 1 10 L 6 0 L 11 10Z" fill="#D4C5A9" />
            <path d="M 3 10 L 6 2 L 9 10Z" fill="#E8D5B5" />
            <path d="M 5 10 L 6 3 L 7 10Z" fill="#18181B" />
          </svg>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          2. BRASS MAGNIFYING GLASS (Tactile Lens Glint & Texture)
          ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          bottom: "4%",
          left: "3%",
          filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.98))",
          transform: "rotate(24deg)",
        }}
        whileHover={{ scale: 1.08, rotate: 28 }}
        onMouseEnter={() => setIsMagnifierHovered(true)}
        onMouseLeave={() => setIsMagnifierHovered(false)}
        title="Forensic Magnifying Glass"
      >
        <div style={{ position: "relative", width: "clamp(62px, 5vw, 76px)", height: "clamp(86px, 7vw, 104px)" }}>
          <svg viewBox="0 0 80 108" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="brassLensGrad" cx="35%" cy="32%" r="65%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="45%" stopColor="rgba(210,235,255,0.12)" />
                <stop offset="100%" stopColor="rgba(20,30,40,0.65)" />
              </radialGradient>
            </defs>
            {/* Wooden Handle with Brass Trim */}
            <rect x="35" y="62" width="10" height="44" fill="#2E180A" rx="4" />
            <rect x="36" y="62" width="2.5" height="44" fill="#4A2810" opacity="0.6" rx="3" />
            {[66, 74, 82, 90, 98].map((y) => (
              <rect key={y} x="35" y={y} width="10" height="2" fill="#D4A227" rx="1" />
            ))}
            {/* Brass Outer Rim */}
            <circle cx="40" cy="36" r="34" fill="#1A1006" stroke="#C9A227" strokeWidth="4" />
            <circle cx="40" cy="36" r="31" fill="#1A1006" stroke="#8A6820" strokeWidth="1.5" />
            {/* Convex Lens */}
            <circle cx="40" cy="36" r="28" fill="url(#brassLensGrad)" />
            {/* Magnified Text under Lens */}
            <text x="40" y="32" textAnchor="middle" fontSize="6.5" fontFamily="monospace"
              fontWeight="900" fill="rgba(255,255,255,0.6)">EVIDENCE</text>
            <text x="40" y="42" textAnchor="middle" fontSize="5.5" fontFamily="monospace"
              fontWeight="700" fill="rgba(220,38,38,0.85)">#900-B</text>
            {/* Glass Glint Animation */}
            <AnimatePresence>
              {(glintVisible || isMagnifierHovered) && (
                <motion.path
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  d="M 20 18 Q 32 12 44 20" stroke="rgba(255,255,255,0.85)" strokeWidth="2.8" fill="none" strokeLinecap="round"
                />
              )}
            </AnimatePresence>
            <path d="M 24 20 Q 33 15 42 21" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

    </div>
  );
};
