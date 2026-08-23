"use client";

import React from "react";
import { motion } from "framer-motion";
import { forensicAudio } from "../../lib/forensicAudio";

interface ForensicRubberStampProps {
  label?: string;
  date?: string;
  classification?: string;
  rotation?: number;
}

export const ForensicRubberStamp: React.FC<ForensicRubberStampProps> = ({
  label = "CONFIDENTIAL / CRIME SCENE",
  date = "OCT 14 1978",
  classification = "FORENSIC BIOHAZARD",
  rotation = -8,
}) => {
  return (
    <motion.div
      initial={{ scale: 2.2, opacity: 0, rotate: 0 }}
      animate={{ scale: 1, opacity: 0.92, rotate: rotation }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onAnimationStart={() => forensicAudio.playStampSlam()}
      className="inline-block relative p-3 border-4 border-[#820d0d] rounded-sm pointer-events-none select-none"
      style={{
        maskImage:
          "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.98) 90%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.98) 90%)",
        boxShadow: "inset 0 0 0 2px #6b0a0a, inset 0 0 6px rgba(100,0,0,0.45)",
      }}
    >
      {/* Rubber distress noise overlay */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0, transparent 2px, rgba(255,255,255,0.4) 3px, transparent 4px)",
        }}
      />

      <div className="text-center font-mono font-black text-[#820d0d] tracking-widest leading-none">
        <p className="text-[10px] uppercase tracking-widest text-[#941111] mb-1 font-bold">
          {classification}
        </p>
        <p className="text-xl md:text-2xl font-extrabold uppercase px-2 py-0.5 border-y-2 border-[#820d0d]">
          {label}
        </p>
        <div className="flex justify-between text-[9px] font-bold mt-1 text-[#6b0a0a]">
          <span>VERITAS MORTIS</span>
          <span>{date}</span>
        </div>
      </div>
    </motion.div>
  );
};
