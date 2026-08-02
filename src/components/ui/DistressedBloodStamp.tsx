"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface DistressedBloodStampProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function DistressedBloodStamp({ text, size = "lg", className = "" }: DistressedBloodStampProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Size mapping
  const sizeStyles = {
    sm: "text-3xl border-4 px-4 py-1",
    md: "text-5xl border-[6px] px-6 py-2",
    lg: "text-6xl md:text-8xl border-[8px] md:border-[12px] px-8 py-3",
    xl: "text-7xl md:text-9xl border-[10px] md:border-[16px] px-12 py-4",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const drips: { x: number; y: number; speed: number; length: number; max: number; width: number }[] = [];

    // Move stamp position to upper third of the screen
    const stampY = h * 0.25; 
    const stampWidth = w > 768 ? 800 : w * 0.9; // Approximate width of the stamp

    // Initialize drips falling strictly from the bottom of the stamp box
    for (let i = 0; i < 40; i++) {
      drips.push({
        x: w / 2 + (Math.random() - 0.5) * stampWidth * 0.9, // Spread across the stamp width
        y: stampY + 60 + (Math.random() * 20), // Start from the stain
        speed: Math.random() * 2 + 1,
        length: 0,
        max: Math.random() * (h * 0.7) + 50, // Drip down to the bottom
        width: Math.random() * 3 + 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#4A0000"; // Deep oxidized blood

      // Draw organic clustered splatters to form a non-geometric stain behind the stamp
      for (let i = 0; i < 200; i++) {
        const sx = w / 2 + (Math.random() - 0.5) * stampWidth * 0.8;
        const sy = stampY + 50 + (Math.random() - 0.5) * 80;
        
        // Concentrate splatters heavily in the center to form a stain
        const density = Math.exp(-(Math.pow((sx - w/2)/(stampWidth/3), 2) + Math.pow((sy - (stampY+50))/40, 2)));
        if (Math.random() < density) {
            const sr = Math.random() * 8 + 2; // larger globs for the stain
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // Physics drips (Flowing realistic blood droplets)
      drips.forEach((drip) => {
        if (drip.length < drip.max) {
          drip.length += drip.speed;
        }
        ctx.beginPath();
        ctx.roundRect(drip.x, drip.y, drip.width, drip.length, drip.width);
        ctx.fill();
        // Bulb at the end
        ctx.beginPath();
        ctx.arc(drip.x + drip.width / 2, drip.y + drip.length, drip.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-start pt-[15vh] md:pt-[20vh] w-full h-full pointer-events-none ${className}`}>
      
      {/* HTML5 Canvas Fluid Dripping Physics Overlay */}
      <motion.canvas
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-multiply z-10"
      />

      {/* GUARANTEED SVG COLOR MATRIX FILTER & GRUNGE MASK */}
      <svg width="0" height="0" className="absolute">
        <filter id="distressed-stamp">
          {/* 1. Generate grunge noise */}
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 4 -1.5" in="noise" result="alphaNoise" />
          
          {/* 2. Punch holes in the source graphic */}
          <feComposite operator="in" in="SourceGraphic" in2="alphaNoise" result="distressed" />
          
          {/* 3. Strip all Green/Blue channels to mathematically prevent pink edges */}
          <feColorMatrix
            in="distressed"
            type="matrix"
            values="
              1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
          />
        </filter>
      </svg>

      {/* 2. "VERITAS MORTIS" Title Text — Bordered Stamped Effect */}
      <motion.div
        initial={{ scale: 3, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: -7 }}
        transition={{ duration: 0.15, delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
        className={`z-30 border-[6px] md:border-[10px] border-[#4A0000] rounded-xl px-8 py-3 md:px-12 md:py-4 flex items-center justify-center mix-blend-multiply drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)]`}
        style={{
          isolation: "isolate",
          transform: "translateZ(0)",
          filter: "url(#distressed-stamp)",
          transformOrigin: "center",
        }}
      >
        <h1
          className="font-[family-name:var(--font-ibm-mono)] font-black tracking-widest text-center text-6xl md:text-8xl"
          style={{
            color: "#4A0000", // Same deep oxidized blood red as the border box
            WebkitTextFillColor: "#4A0000",
            textShadow: "0 1px 2px rgba(20, 0, 0, 0.9)", // Dark text shadow
            lineHeight: 1,
            transform: "translateZ(0)",
          }}
        >
          {text}
        </h1>
      </motion.div>
    </div>
  );
}
