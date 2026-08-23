"use client";

import React from "react";
import { motion } from "framer-motion";

export const CigaretteTray = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: 80,
        height: 50,
        position: "relative",
      }}
    >
      {/* Smoke Effects */}
      <motion.div
        className="absolute bottom-10 left-[45px] w-[2px] bg-white rounded-full blur-[1px]"
        initial={{ y: 0, opacity: 0.1, x: 0 }}
        animate={{ y: -40, opacity: 0, x: -5 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: 0,
        }}
        style={{ height: 30 }}
      />
      <motion.div
        className="absolute bottom-10 left-[48px] w-[3px] bg-white rounded-full blur-[2px]"
        initial={{ y: 0, opacity: 0.08, x: 0 }}
        animate={{ y: -30, opacity: 0, x: 8 }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "linear",
          delay: 1.5,
        }}
        style={{ height: 25 }}
      />
      <motion.div
        className="absolute bottom-10 left-[43px] w-[2px] bg-white rounded-full blur-[1px]"
        initial={{ y: 0, opacity: 0.1, x: 0 }}
        animate={{ y: -35, opacity: 0, x: -2 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
          delay: 2.5,
        }}
        style={{ height: 35 }}
      />

      {/* Ashtray SVG */}
      <svg
        width="80"
        height="50"
        viewBox="0 0 80 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0"
      >
        {/* Outer Dish - dark grey metallic */}
        <ellipse cx="40" cy="35" rx="35" ry="12" fill="url(#dish-gradient)" />
        {/* Inner Dish */}
        <ellipse cx="40" cy="36" rx="28" ry="9" fill="#252525" />
        
        {/* Ash pile */}
        <path d="M35 37 Q40 34, 45 37 Q42 39, 35 37 Z" fill="#666666" />
        <path d="M38 35 Q43 33, 47 36 Q42 38, 38 35 Z" fill="#777777" />

        {/* Cigarette Stub */}
        <rect x="42" y="32" width="20" height="4" transform="rotate(-15 42 32)" fill="#D4C5A9" />
        {/* Burnt Tip */}
        <rect x="42" y="32" width="3" height="4" transform="rotate(-15 42 32)" fill="#1A1A1A" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="dish-gradient" x1="5" y1="23" x2="75" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3A3A3A" />
            <stop offset="1" stopColor="#1A1A1A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
