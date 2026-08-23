"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EvidenceProps — Bottom-right investigative workspace props.
 * Positioned BELOW the Investigation Wall (top-[20%]) so nothing overlaps.
 * Police badge, stopped wristwatch (02:14), brass bullet casings, film negatives,
 * sealed evidence bag. Small, compact, art-directed with contact shadows.
 */
export const EvidenceProps = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`pointer-events-none absolute overflow-visible ${className}`}
      style={{
        /* Bottom-right zone: below investigation wall, above bottom edge */
        bottom: "3%",
        right: "2%",
        width: "clamp(180px, 16vw, 220px)",
        height: "clamp(170px, 18vh, 220px)",
      }}
    >
      {/* ─────────────────────────────────────────────
          LAYOUT: horizontal strip, 2 rows
          Top row:   Badge · Watch
          Bottom row: Casings · Film strip
          Right:     Evidence bag (tall)
          ───────────────────────────────────────────── */}

      {/* ── Police Badge (Aged Brass) ── */}
      <div
        className="absolute"
        style={{
          top: "2%", left: "2%",
          width: "clamp(52px, 5vw, 64px)", height: "clamp(52px, 5vw, 64px)",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.9))",
        }}
      >
        <svg viewBox="0 0 60 60" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 4 L52 14 L52 36 Q52 50 30 56 Q8 50 8 36 L8 14Z" fill="#1A1508" stroke="#C9A227" strokeWidth="1.8" />
          <path d="M30 8 L48 17 L48 36 Q48 48 30 53 Q12 48 12 36 L12 17Z" fill="#221C0A" stroke="#A38520" strokeWidth="1" />
          <path d="M15 22 Q12 18 10 20 Q13 24 15 22Z" fill="#C9A227" />
          <path d="M45 22 Q48 18 50 20 Q47 24 45 22Z" fill="#C9A227" />
          <polygon points="30,14 32,20 38,20 33,24 35,30 30,26 25,30 27,24 22,20 28,20" fill="#C9A227" stroke="#8A6820" strokeWidth="0.5" />
          <text x="30" y="40" textAnchor="middle" fontSize="6" fontFamily="monospace" fontWeight="900" fill="#C9A227">#4471</text>
          <text x="30" y="47" textAnchor="middle" fontSize="3.5" fontFamily="monospace" fontWeight="bold" fill="#8A7040">FORENSIC DIV.</text>
        </svg>
        <div className="absolute bottom-[-6px] left-[10%] right-[10%] h-2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 80%)", filter: "blur(3px)" }} />
      </div>

      {/* ── Stopped Wristwatch (02:14) ── */}
      <div
        className="absolute"
        style={{
          top: "0%", left: "35%",
          width: "clamp(58px, 5.5vw, 70px)", height: "clamp(58px, 5.5vw, 70px)",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.9))",
          transform: "rotate(-12deg)",
        }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="28" y="0" width="24" height="16" fill="#1E1814" rx="3" />
          <rect x="28" y="64" width="24" height="16" fill="#1E1814" rx="3" />
          <circle cx="40" cy="40" r="24" fill="#2A2520" stroke="#4A4540" strokeWidth="3" />
          <circle cx="40" cy="40" r="18" fill="#F0EAD8" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={40 + 14 * Math.sin(angle)} y1={40 - 14 * Math.cos(angle)} x2={40 + 17 * Math.sin(angle)} y2={40 - 17 * Math.cos(angle)} stroke="#1E1814" strokeWidth={i % 3 === 0 ? "2" : "1"} />;
          })}
          {/* Hour hand ~65° (2:14) */}
          <line x1="40" y1="40" x2={40 + 8 * Math.sin(65 * Math.PI / 180)} y2={40 - 8 * Math.cos(65 * Math.PI / 180)} stroke="#0E0C0A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Minute hand ~84° (14min) */}
          <line x1="40" y1="40" x2={40 + 12 * Math.sin(84 * Math.PI / 180)} y2={40 - 12 * Math.cos(84 * Math.PI / 180)} stroke="#0E0C0A" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="40" cy="40" r="1.5" fill="#2A2520" />
          <path d="M 28 30 Q 35 26 42 28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="font-mono text-[6px] font-black text-[#A89070] tracking-widest">02:14</span>
        </div>
      </div>

      {/* ── Evidence Bag (Sealed, Blood Transfer) ── */}
      <div
        className="absolute"
        style={{
          top: "0%", right: "2%",
          width: "clamp(54px, 5vw, 65px)", height: "clamp(68px, 7vh, 84px)",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.85))",
        }}
      >
        <svg viewBox="0 0 65 84" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="16" width="59" height="64" fill="#2A3528" rx="3" opacity="0.9" />
          <rect x="3" y="16" width="59" height="64" fill="none" stroke="#3D4E38" strokeWidth="2" rx="3" />
          <rect x="3" y="8" width="59" height="10" fill="#4A5A40" rx="2" />
          <path d="M 9 13 L 56 13" stroke="#5A6E50" strokeWidth="1.5" strokeDasharray="3 2" />
          <rect x="8" y="20" width="49" height="12" fill="#E8E0C8" rx="1" />
          <text x="32" y="30" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="900" fill="#1A1814">EVIDENCE — CASE #900</text>
          <path d="M 16 48 L 50 40 L 55 44 L 50 48 L 42 48 L 42 56 L 26 56 L 22 52 Z" fill="#1A1814" opacity="0.3" />
          <ellipse cx="46" cy="63" rx="7" ry="4.5" fill="#3A0A0A" opacity="0.7" />
          <ellipse cx="50" cy="61" rx="3.5" ry="2.5" fill="#3A0A0A" opacity="0.45" />
        </svg>
        <div
          className="absolute -bottom-2 -right-2 bg-[#E8DEAD] border border-[#8A7850] rounded-sm px-1 flex items-center justify-center"
          style={{ width: "32px", height: "22px", transform: "rotate(8deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.7)", animation: "evidence-tag-wobble 8s ease-in-out infinite" }}
        >
          <span className="font-mono text-[5px] font-black text-[#3A2E1C] text-center leading-none">EV<br />#007</span>
        </div>
      </div>

      {/* ── Brass Bullet Casings ×2 ── */}
      <div
        className="absolute"
        style={{
          bottom: "12%", left: "4%",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.9))",
        }}
      >
        <svg viewBox="0 0 40 18" className="w-16 h-7" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="8" height="12" fill="#8A6820" rx="1" />
          <ellipse cx="6" cy="4" rx="4" ry="2" fill="#C9A227" />
          <ellipse cx="6" cy="16" rx="4.5" ry="1.5" fill="#6A5018" />
          <rect x="3" y="4" width="1.5" height="12" fill="#A38520" opacity="0.5" />
          <g transform="rotate(-15, 22, 10)">
            <rect x="18" y="3" width="8" height="12" fill="#7A5E18" rx="1" />
            <ellipse cx="22" cy="3" rx="4" ry="2" fill="#B89020" />
            <ellipse cx="22" cy="15" rx="4.5" ry="1.5" fill="#5A4010" />
            <rect x="19" y="3" width="1.5" height="12" fill="#9A7820" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* ── Film Negative Strip ── */}
      <div
        className="absolute"
        style={{
          bottom: "4%", left: "25%",
          width: "clamp(80px, 7vw, 96px)", height: "clamp(30px, 3vh, 38px)",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.8))",
          transform: "rotate(8deg)",
        }}
      >
        <svg viewBox="0 0 96 38" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="96" height="38" fill="#0A0A0C" rx="2" />
          {[6, 18, 30, 42, 54, 66, 78, 90].map((x) => (
            <rect key={x} x={x} y="2" width="6" height="5" fill="#1A1A1E" rx="1" />
          ))}
          {[6, 18, 30, 42, 54, 66, 78, 90].map((x) => (
            <rect key={`b${x}`} x={x} y="31" width="6" height="5" fill="#1A1A1E" rx="1" />
          ))}
          {[4, 34, 64].map((x) => (
            <rect key={x} x={x} y="9" width="26" height="20" fill="#141416" stroke="#2A2A2E" strokeWidth="0.5" rx="1" />
          ))}
          <ellipse cx="17" cy="19" rx="6" ry="7" fill="#1A1A1E" opacity="0.8" />
          <ellipse cx="47" cy="19" rx="7" ry="6" fill="#1A1A1E" opacity="0.7" />
        </svg>
      </div>

    </div>
  );
};
