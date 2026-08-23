"use client";

import React from "react";

interface BloodSpatterProps {
  className?: string;
  size?: number;
  dripLength?: number;
}

export const ForensicBloodSpatter: React.FC<BloodSpatterProps> = ({
  className = "",
  size = 180,
  dripLength = 80,
}) => {
  return (
    <div
      className={`relative pointer-events-none select-none blood-oxidized-layer ${className}`}
      style={{ width: size, height: size + dripLength }}
    >
      <svg
        viewBox="0 0 200 280"
        className="w-full h-full filter drop-shadow(0 1px 2px rgba(20,0,0,0.8))"
      >
        <defs>
          {/* Oxidized Clotted Blood Core Gradient */}
          <radialGradient id="clottedBlood" cx="45%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#4a0404" />
            <stop offset="35%" stopColor="#380000" />
            <stop offset="70%" stopColor="#290000" />
            <stop offset="100%" stopColor="#150000" stopOpacity="0.95" />
          </radialGradient>

          {/* Wet Specular Surface Shine */}
          <radialGradient id="specularGloss" cx="38%" cy="32%" r="25%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ff9999" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#380000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- High-Velocity Micro Satellite Mist --- */}
        <circle cx="28" cy="45" r="1.8" fill="#380000" opacity="0.85" />
        <circle cx="16" cy="72" r="1.2" fill="#2d0000" opacity="0.75" />
        <circle cx="42" cy="18" r="2.2" fill="#380000" opacity="0.9" />
        <circle cx="168" cy="38" r="1.5" fill="#380000" opacity="0.8" />
        <circle cx="182" cy="70" r="2.0" fill="#2a0000" opacity="0.95" />
        <circle cx="155" cy="130" r="1.4" fill="#380000" opacity="0.7" />
        <circle cx="22" cy="115" r="1.6" fill="#380000" opacity="0.8" />

        {/* --- Central Impact Coagulation Mass --- */}
        <path
          d="M 95 35 
             C 125 30, 155 50, 150 82 
             C 145 110, 168 125, 142 145 
             C 118 162, 102 140, 85 148 
             C 65 155, 48 135, 45 105 
             C 42 75, 65 40, 95 35 Z"
          fill="url(#clottedBlood)"
        />

        {/* Secondary Impact Lobes */}
        <path
          d="M 52 90 C 35 85, 25 102, 38 112 C 48 120, 58 108, 52 90 Z"
          fill="#300000"
        />
        <path
          d="M 140 75 C 162 70, 172 90, 158 98 C 146 105, 138 90, 140 75 Z"
          fill="#300000"
        />

        {/* --- Viscous Downward Gravity Runs --- */}
        <path
          d="M 90 145 
             C 93 175, 87 210, 89 240 
             C 90 252, 98 252, 97 240 
             C 95 210, 98 175, 102 145 Z"
          fill="url(#clottedBlood)"
        />
        <circle cx="93" cy="245" r="4.5" fill="#250000" />

        <path
          d="M 125 138 
             C 128 160, 132 185, 130 205 
             C 129 214, 135 214, 134 205 
             C 133 185, 136 160, 132 138 Z"
          fill="#2b0000"
        />
        <circle cx="132" cy="208" r="3.2" fill="#220000" />

        {/* --- Specular Wet Surface Reflection --- */}
        <ellipse cx="88" cy="72" rx="35" ry="24" fill="url(#specularGloss)" />
        <ellipse cx="94" cy="180" rx="3.5" ry="15" fill="url(#specularGloss)" opacity="0.6" />
      </svg>
    </div>
  );
};
