"use client";

import React from "react";
import { motion } from "framer-motion";
import RealisticFluidBloodCanvas from "./RealisticFluidBloodCanvas";

export default function DyingBloodSplatter() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col items-center pt-[15%] z-20 overflow-hidden select-none">
      {/* 1. Realistic Fluid Dripping Physics Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      >
        <RealisticFluidBloodCanvas enableClickSplatter={true} />
      </motion.div>

      {/* 2. "VERITAS MORTIS" Oxidized Stamped Title */}
      <motion.div
        initial={{ scale: 3.2, opacity: 0, rotate: 12 }}
        animate={{ scale: 1, opacity: 0.95, rotate: -8 }}
        transition={{ type: "spring", stiffness: 480, damping: 26, delay: 0.1 }}
        className="z-30 mt-12 border-[4px] md:border-[7px] border-[#4a0404] rounded-sm px-6 py-2 md:px-10 md:py-3 flex flex-col items-center justify-center mix-blend-multiply drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
        style={{
          boxShadow: "inset 0 0 0 2px #2d0202, inset 0 0 10px rgba(50,2,2,0.6)",
          maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.98) 95%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.98) 95%)",
        }}
      >
        <span className="font-mono text-[9px] md:text-[10px] font-black tracking-[0.3em] text-[#6b0808] uppercase mb-1">
          CASE ARCHIVE: MORTIS-78-09
        </span>
        <h1
          className="font-mono font-black text-5xl md:text-7xl tracking-widest text-center text-[#380202]"
          style={{
            WebkitTextStroke: "1px #1a0101",
            textShadow: "0 1px 2px rgba(10,0,0,0.9)",
            lineHeight: 1,
          }}
        >
          VERITAS MORTIS
        </h1>
      </motion.div>
    </div>
  );
}
