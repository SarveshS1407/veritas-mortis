"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DeskLampProps {
  className?: string;
  onToggle?: (isOn: boolean) => void;
}

export const DeskLamp = ({ className = "", onToggle }: DeskLampProps) => {
  const [isOn, setIsOn] = useState(true);
  const [flickerOpacity, setFlickerOpacity] = useState(1);

  // Random subtle voltage flicker effect when light is on
  useEffect(() => {
    if (!isOn) return;
    let timeoutId: NodeJS.Timeout;

    const scheduleNextFlicker = () => {
      const nextFlickerTime = Math.random() * 20000 + 15000;
      timeoutId = setTimeout(() => {
        if (!isOn) return;
        setFlickerOpacity(0.35);
        setTimeout(() => {
          setFlickerOpacity(1);
          scheduleNextFlicker();
        }, 120);
      }, nextFlickerTime);
    };

    scheduleNextFlicker();
    return () => clearTimeout(timeoutId);
  }, [isOn]);

  const handleLampClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isOn;
    setIsOn(nextState);
    onToggle?.(nextState);
  };

  return (
    <motion.div
      onClick={handleLampClick}
      className={`absolute cursor-pointer filter drop-shadow(0 18px 30px rgba(0,0,0,0.95)) pointer-events-auto ${className}`}
      style={{
        width: 90,
        height: 260,
        transformOrigin: "bottom center",
      }}
      animate={{ rotate: [-2, 2, -2] }}
      transition={{
        duration: 9,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title="Click to toggle desk lamp"
    >
      {/* ── High Contrast Warm Tungsten Light Cone (when ON) ── */}
      {isOn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: flickerOpacity }}
          transition={{ duration: 0.15 }}
          className="absolute top-12 -left-[160px] h-[450px] w-[410px] pointer-events-none"
          style={{
            background: "radial-gradient(circle at top, rgba(255, 195, 80, 0.24) 0%, rgba(200, 130, 40, 0.09) 45%, transparent 75%)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            transformOrigin: "top center",
            zIndex: -1,
            filter: "blur(3px)",
          }}
        />
      )}

      {/* ── SVG Lamp Drawing ── */}
      <svg
        width="90"
        height="260"
        viewBox="0 0 90 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none"
      >
        {/* Lamp Base */}
        <ellipse cx="45" cy="252" rx="30" ry="7" fill="#120E0B" />
        <path d="M15 252 C15 238, 75 238, 75 252 Z" fill="#2E241D" stroke="#4A3B30" strokeWidth="1.5" />

        {/* Pull chain switch */}
        <line x1="58" y1="75" x2="58" y2="105" stroke="#C9A227" strokeWidth="1.5" />
        <circle cx="58" cy="107" r="3.5" fill="#C9A227" stroke="#8A6820" strokeWidth="1" />

        {/* Lamp Arm/Pole */}
        <rect x="42" y="65" width="8" height="185" fill="#1C1611" stroke="#3A2E24" strokeWidth="1" />
        <rect x="45" y="65" width="2" height="185" fill="#5E4D3E" opacity="0.4" />
        
        {/* Joint */}
        <circle cx="45" cy="65" r="8" fill="#1C1611" stroke="#4A3B30" strokeWidth="1.5" />

        {/* Lamp Shade - Dark Emerald/Bronze Metal */}
        <path d="M20 60 Q45 10, 70 60 L85 75 L5 75 Z" fill="#1B2820" stroke="#3D4E43" strokeWidth="1.5" />
        <ellipse cx="45" cy="75" rx="40" ry="5" fill="#101A13" stroke="#8A755C" strokeWidth="2" />

        {/* Bulb Glow */}
        <circle
          cx="45"
          cy="73"
          r="8"
          fill={isOn ? "#FFE599" : "#4A4030"}
          opacity={isOn ? 0.95 : 0.4}
        />
      </svg>
    </motion.div>
  );
};
