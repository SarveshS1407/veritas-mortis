"use client";

import React from "react";
import { motion } from "framer-motion";
import { forensicAudio } from "@/lib/forensicAudio";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#121010] text-[#E8E3D9] border-2 border-[#5C4A38] rounded-sm shadow-2xl p-6 md:p-8 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3B2A1E] pb-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
            <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-[#E8E3D9]">
              VERITAS MORTIS · CREDITS
            </h2>
          </div>
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              onClose();
            }}
            className="px-3 py-1 bg-[#2A1808] hover:bg-red-900 font-mono text-xs text-[#EDE8D5] rounded-sm transition-colors cursor-pointer"
          >
            ✕ CLOSE [ESC]
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 font-mono text-xs text-neutral-300">
          <div>
            <span className="text-[10px] text-[#8A6830] font-bold block uppercase tracking-widest">
              Game Direction & Narrative Systems
            </span>
            <p className="text-sm font-serif font-bold text-[#E8E3D9] mt-0.5">
              S. Sarvesh
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Deterministic 3-Act Thriller Engine, Mulberry32 PRNG, Micro-Forensics
            </p>
          </div>

          <div className="pt-3 border-t border-[#2A1808]">
            <span className="text-[10px] text-[#8A6830] font-bold block uppercase tracking-widest">
              Aesthetic Direction & Art
            </span>
            <p className="text-sm font-serif font-bold text-[#E8E3D9] mt-0.5">
              1970s Neo-Noir Analog Gothic
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Chiaroscuro lighting, dark walnut desk environments, aged parchment typography
            </p>
          </div>

          <div className="pt-3 border-t border-[#2A1808]">
            <span className="text-[10px] text-[#8A6830] font-bold block uppercase tracking-widest">
              Audio Architecture & Sound Design
            </span>
            <p className="text-sm font-serif font-bold text-[#E8E3D9] mt-0.5">
              Pure Web Audio Synthesizer & Howler.js
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Analog low-frequency drone, mechanical typewriter clacks, 365nm UV hum, tape reel hiss
            </p>
          </div>

          <div className="pt-3 border-t border-[#2A1808]">
            <span className="text-[10px] text-[#8A6830] font-bold block uppercase tracking-widest">
              Technology Stack
            </span>
            <p className="text-[11px] text-[#D4C5A9] mt-1 leading-relaxed">
              Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Zustand
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#3B2A1E] flex justify-between items-center font-mono text-[10px] text-neutral-500">
          <span>MCMLXXIV · ALL RIGHTS RESERVED</span>
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              onClose();
            }}
            className="text-[#D4C5A9] hover:underline"
          >
            Return to Menu →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
