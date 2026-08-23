"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CeilingFanShadowProps {
  className?: string;
}

/**
 * CeilingFanShadow Component
 * 
 * A purely decorative environmental element that casts a slowly rotating, 
 * very subtle shadow overlay resembling a ceiling fan.
 * 
 * Part of the neo-noir/analog gothic aesthetic for Veritas Mortis.
 */
export function CeilingFanShadow({ className = "" }: CeilingFanShadowProps) {
  // Respect user preference for reduced motion
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[5] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <motion.div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background: `conic-gradient(
            transparent 0deg,
            rgba(0,0,0,0.15) 5deg,
            transparent 25deg,
            transparent 90deg,
            rgba(0,0,0,0.15) 95deg,
            transparent 115deg,
            transparent 180deg,
            rgba(0,0,0,0.15) 185deg,
            transparent 205deg,
            transparent 270deg,
            rgba(0,0,0,0.15) 275deg,
            transparent 295deg
          )`,
        }}
        // Scale to 1.5 to ensure the corners of the screen are covered during rotation
        initial={{ rotate: 0, scale: 1.5 }}
        animate={{ 
          rotate: shouldReduceMotion ? 0 : 360, 
          scale: 1.5 
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}
