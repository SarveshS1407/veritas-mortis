"use client";

import React from "react";

/**
 * Photorealistic Dark Walnut Detective Desk Surface
 * 6-layer wood grain system with realistic imperfections, warm lamp falloff,
 * worn desk edges, paper indentation ghosts, and dust accumulation.
 */
export const DeskSurface = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        backgroundColor: "#130C08",
        backgroundImage: `
          radial-gradient(ellipse 140% 80% at 18% 12%, rgba(235, 175, 90, 0.18) 0%, rgba(130, 88, 45, 0.09) 40%, rgba(8, 5, 2, 0.92) 100%),
          linear-gradient(172deg, rgba(40, 27, 19, 0.97) 0%, rgba(28, 18, 12, 0.98) 42%, rgba(16, 10, 6, 1) 100%)
        `,
      }}
    >
      {/* ── Primary Cross-Grain Wood Texture (SVG) ── */}
      <svg className="absolute inset-0 w-full h-full opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <filter id="wood-blur">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
        {/* Long-grain primary lines */}
        {[...Array(28)].map((_, i) => (
          <line
            key={`g${i}`}
            x1={`${(i / 28) * 100}%`} y1="0%"
            x2={`${(i / 28) * 100 + (Math.sin(i * 1.3) * 4)}%`} y2="100%"
            stroke={i % 4 === 0 ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.07)"}
            strokeWidth={i % 4 === 0 ? "2" : "1"}
            filter="url(#wood-blur)"
          />
        ))}
        {/* Short cross-grain knot lines */}
        {[...Array(12)].map((_, i) => (
          <path
            key={`k${i}`}
            d={`M ${15 + i * 8}% ${20 + i * 5}% Q ${20 + i * 8}% ${22 + i * 5}% ${25 + i * 8}% ${20 + i * 5}%`}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#wood-blur)"
          />
        ))}
      </svg>

      {/* ── Warm Tungsten Lamp Falloff (top-left → bottom-right fade) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 18%, rgba(220, 165, 85, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 30% 35% at 80% 15%, rgba(160, 190, 220, 0.05) 0%, transparent 60%),
            linear-gradient(145deg, transparent 35%, rgba(6, 4, 2, 0.65) 100%)
          `,
        }}
      />

      {/* ── Ambient Occlusion Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 42%, transparent 20%, rgba(6,4,2,0.72) 72%, rgba(3,2,1,0.95) 100%)",
        }}
      />

      {/* ── Worn Desk Edges (physical wear at screen edges) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(4,2,1,0.85) 0%, transparent 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(4,2,1,0.5) 0%, transparent 100%)" }} />

      {/* ── Physical Desk Imperfections (Scratches & Dents) ── */}
      <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Scratch 1 — top left area */}
        <path d="M 8% 22% L 18% 25%" stroke="rgba(255,220,160,0.5)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M 8% 22% L 18% 25%" stroke="rgba(0,0,0,0.7)" strokeWidth="1.4" strokeLinecap="round" />
        {/* Scratch 2 — mid right */}
        <path d="M 72% 55% L 85% 51%" stroke="rgba(255,220,160,0.35)" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M 72% 55% L 85% 51%" stroke="rgba(0,0,0,0.55)" strokeWidth="1.1" strokeLinecap="round" />
        {/* Scratch 3 — bottom area */}
        <path d="M 28% 75% L 44% 79%" stroke="rgba(255,220,160,0.3)" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M 28% 75% L 44% 79%" stroke="rgba(0,0,0,0.5)" strokeWidth="1" strokeLinecap="round" />
        {/* Small dent mark */}
        <ellipse cx="55%" cy="68%" rx="12" ry="4" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        {/* Paper impression from repeated folder placement */}
        <rect x="36%" y="12%" width="27%" height="72%" rx="2" fill="none"
          stroke="rgba(180,140,90,0.06)" strokeWidth="4" />
      </svg>

      {/* ── Dried Coffee Ring Stains (on desk, not on folder) ── */}
      {/* Left desk area stain */}
      <div className="absolute pointer-events-none mix-blend-multiply"
        style={{ top: "31%", left: "11%", width: "72px", height: "72px" }}>
        <div className="w-full h-full rounded-full border-[5px] border-[#2A180E]/50 filter blur-[0.4px]" />
        <div className="absolute inset-2 rounded-full border-[3px] border-[#2A180E]/30" />
      </div>
      {/* Right desk area faint stain */}
      <div className="absolute pointer-events-none mix-blend-multiply"
        style={{ top: "58%", right: "18%", width: "48px", height: "48px" }}>
        <div className="w-full h-full rounded-full border-[4px] border-[#2A180E]/35 filter blur-[0.3px]" />
      </div>

      {/* ── Dust Accumulation (lamp-side highlight, subtle) ── */}
      <div
        className="absolute inset-0 opacity-14 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(240, 220, 185, 0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 55% 45% at 22% 15%, rgba(0,0,0,1) 0%, transparent 80%)",
        }}
      />
    </div>
  );
};
