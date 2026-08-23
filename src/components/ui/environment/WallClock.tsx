"use client";

import React from "react";

interface WallClockProps {
  className?: string;
}

export function WallClock({ className = "" }: WallClockProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow(0 14px 25px rgba(0,0,0,0.9)) ${className}`}
      style={{ width: 120, height: 120 }}
    >
      <style>{`
        @keyframes clock-second {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .second-hand-120 {
          transform-origin: 60px 60px;
          animation: clock-second 60s steps(60) infinite;
        }
      `}</style>
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Dark Walnut Frame */}
        <circle cx="60" cy="60" r="58" fill="#1C120B" stroke="#3D2A1D" strokeWidth="4" />
        {/* Brass Bevel Ring */}
        <circle cx="60" cy="60" r="54" fill="none" stroke="#A38B6C" strokeWidth="2.5" />
        
        {/* High-Contrast Cream Face */}
        <circle cx="60" cy="60" r="51" fill="#F4EDE0" />

        {/* 12 Hour Markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 60 + 40 * Math.sin(angle);
          const y1 = 60 - 40 * Math.cos(angle);
          const x2 = 60 + 47 * Math.sin(angle);
          const y2 = 60 - 47 * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1C1611"
              strokeWidth={i % 3 === 0 ? "3.5" : "1.8"}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour Hand (10:47 -> ~323 deg) */}
        <g transform="rotate(323, 60, 60)">
          <line x1="60" y1="60" x2="60" y2="36" stroke="#120E0B" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Minute Hand (47 min -> 282 deg) */}
        <g transform="rotate(282, 60, 60)">
          <line x1="60" y1="60" x2="60" y2="24" stroke="#120E0B" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Second Hand (Red) */}
        <g className="second-hand-120">
          <line x1="60" y1="68" x2="60" y2="20" stroke="#C81414" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="60" r="3.5" fill="#C81414" />
        </g>

        {/* Center Brass Cap */}
        <circle cx="60" cy="60" r="2" fill="#120E0B" />
      </svg>
    </div>
  );
}
