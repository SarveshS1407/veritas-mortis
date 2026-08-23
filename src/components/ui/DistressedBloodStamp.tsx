"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ForensicBloodLayer from "@/components/ForensicBloodLayer";

interface DistressedBloodStampProps {
  showStamp?: boolean;
  showBlood?: boolean;
  className?: string;
}

export default function DistressedBloodStamp({
  showStamp = true,
  showBlood = true,
  className = "",
}: DistressedBloodStampProps) {
  return (
    <div className={`relative w-full h-full pointer-events-none overflow-hidden select-none ${className}`}>
      {/* ── High-Velocity Forensic Blood Splatter & Full-Viewport Fluid Dripping Layer (z-10) ── */}
      <AnimatePresence>
        {showBlood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          >
            <ForensicBloodLayer
              trigger={showBlood}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Authentic Stamped "VERITAS MORTIS" Title (z-20 Foreground — NEVER Masked by Blood) ── */}
      <AnimatePresence>
        {showStamp && (
          <motion.div
            initial={{ scale: 2.8, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 0.98, rotate: -8.5 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 28, delay: 0.04 }}
            className="absolute top-[12%] left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[90%] max-w-[460px] md:max-w-[500px]"
          >
            {/* Outer Box Frame */}
            <div
              className="border-[4px] md:border-[5px] border-[#380404] rounded-xs p-2 bg-[#EADBC4]/92 relative shadow-[0_6px_22px_rgba(20,0,0,0.55)]"
              style={{
                boxShadow:
                  "inset 0 0 14px rgba(40,4,4,0.3), 0 4px 10px rgba(15,0,0,0.45)",
              }}
            >
              {/* Inner Box Border */}
              <div className="border-[1.5px] border-[#480808] px-5 py-3 md:px-7 md:py-4 flex flex-col items-center justify-center relative bg-[#ECE0CD]/85">
                {/* Header: CLASSIFIED EVIDENCE ARCHIVE */}
                <span
                  className="text-[8.5px] md:text-[10.5px] font-black tracking-[0.36em] text-[#300505] uppercase block text-center mb-1"
                  style={{ fontFamily: "'Special Elite', 'Courier Prime', monospace" }}
                >
                  CLASSIFIED EVIDENCE ARCHIVE
                </span>

                {/* Main Two-Line Title: VERITAS MORTIS (High contrast, bold, crystal clear) */}
                <div className="flex flex-col items-center justify-center leading-[0.88] my-1">
                  <h1
                    className="font-black text-4xl md:text-5xl tracking-[0.24em] text-[#150000] uppercase text-center"
                    style={{
                      fontFamily: "'Special Elite', 'Courier Prime', monospace",
                      textShadow: "0 1px 1px rgba(0,0,0,0.6)",
                      WebkitTextStroke: "1px #100000",
                    }}
                  >
                    VERITAS
                  </h1>
                  <h1
                    className="font-black text-4xl md:text-5xl tracking-[0.24em] text-[#150000] uppercase text-center mt-1"
                    style={{
                      fontFamily: "'Special Elite', 'Courier Prime', monospace",
                      textShadow: "0 1px 1px rgba(0,0,0,0.6)",
                      WebkitTextStroke: "1px #100000",
                    }}
                  >
                    MORTIS
                  </h1>
                </div>

                {/* Footer divider line & metadata */}
                <div
                  className="w-full flex justify-between items-center text-[8px] md:text-[9.5px] font-bold text-[#3a0606] mt-2 border-t-[1.5px] border-[#3a0606]/70 pt-1.5 px-1"
                  style={{ fontFamily: "'Special Elite', 'Courier Prime', monospace" }}
                >
                  <span>DIV. 09 FORENSICS</span>
                  <span>OCT 14 1978</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
