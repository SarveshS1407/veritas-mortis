"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function DyingBloodSplatter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Make canvas full size of its container
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Drip physics configuration
    const drips: {
      x: number;
      y: number;
      speed: number;
      maxLength: number;
      width: number;
      opacity: number;
      currentLength: number;
    }[] = [];

    // Create 12-18 random drip streams originating from under the title
    const dripCount = Math.floor(Math.random() * 7) + 12;
    for (let i = 0; i < dripCount; i++) {
      drips.push({
        x: canvas.width * 0.2 + Math.random() * (canvas.width * 0.6), // Distribute across title width
        y: canvas.height * 0.25 + Math.random() * 20, // Start slightly below title
        speed: 0.5 + Math.random() * 1.5,
        maxLength: 100 + Math.random() * 250,
        width: 1.5 + Math.random() * 3.5,
        opacity: 0.6 + Math.random() * 0.4,
        currentLength: 0,
      });
    }

    // Splatter configuration (procedural organic splatter to replace image)
    const splats: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radiusDist = Math.random() * Math.random() * (canvas.width * 0.55); // increased spread
      const isCore = radiusDist < canvas.width * 0.15;
      
      splats.push({
        x: canvas.width * 0.5 + Math.cos(angle) * radiusDist,
        y: canvas.height * 0.3 + Math.sin(angle) * radiusDist * (Math.random() * 0.6 + 0.2), // wider vertical spread
        r: isCore ? Math.random() * 5 + 3 : Math.random() * 3 + 0.8,
        o: Math.random() * 0.5 + 0.4,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw procedural background splatter (pure transparent background!)
      for (const splat of splats) {
        ctx.beginPath();
        ctx.arc(splat.x, splat.y, splat.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(90, 0, 0, ${splat.o})`;
        ctx.fill();
      }

      for (const drip of drips) {
        if (drip.currentLength < drip.maxLength) {
          drip.currentLength += drip.speed;
        }

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(drip.x, drip.y);
        ctx.lineTo(drip.x, drip.y + drip.currentLength);
        ctx.strokeStyle = `rgba(105, 0, 0, ${drip.opacity})`; // Match blood color
        ctx.lineWidth = drip.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw tear-drop bulb at the end
        const bulbY = drip.y + drip.currentLength;
        const bulbRadius = drip.width * 1.2;
        ctx.beginPath();
        ctx.arc(drip.x, bulbY, bulbRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 0, 0, ${drip.opacity + 0.1})`; // Slightly darker bulb
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start rendering
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col items-center pt-[15%] z-20">




      {/* GUARANTEED SVG COLOR MATRIX FILTER (THE ULTIMATE OVERRIDE) */}
      <svg width="0" height="0" className="absolute">
        <filter id="blood-crush">
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
          />
        </filter>
      </svg>

      {/* 2. "VERITAS MORTIS" Title Text — Reliable Solid Stamped Effect */}
      <motion.div
        initial={{ scale: 3, opacity: 0, rotate: 10 }}
        animate={{ scale: 1, opacity: 1, rotate: -12 }}
        transition={{ duration: 0.12, delay: 0.6, ease: "easeOut" }}
        className="z-30 mt-12 border-[4px] md:border-[8px] border-[#3B0000] rounded-xl px-6 py-2 md:px-8 md:py-3 flex items-center justify-center mix-blend-multiply drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)]"
        style={{
          boxShadow: "inset 0px 0px 6px rgba(59, 0, 0, 0.5)",
          transformOrigin: "center",
          backgroundColor: "transparent",
          isolation: "isolate",
          transform: "translateZ(0)",
          filter: "url(#blood-crush)",
        }}
      >
        <h1
          className="font-[family-name:var(--font-ibm-mono)] font-bold text-5xl md:text-7xl tracking-widest text-center"
          style={{
            color: "#3B0000", // Deep oxidized blood red
            WebkitTextFillColor: "#3B0000",
            WebkitTextStroke: "1.5px #1A0000", // Eliminate anti-aliasing pink edges
            textShadow: "0 1px 2px rgba(20, 0, 0, 0.9)", // Dark text shadow
            lineHeight: 1,
            transform: "translateZ(0)",
          }}
        >
          VERITAS MORTIS
        </h1>
      </motion.div>

      {/* 3. HTML5 Canvas Fluid Dripping Physics Overlay */}
      <motion.canvas
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-multiply z-10"
        style={{ filter: "blur(0.5px)" }}
      />
    </div>
  );
}
