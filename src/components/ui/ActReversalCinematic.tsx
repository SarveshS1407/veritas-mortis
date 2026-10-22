"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

export default function ActReversalCinematic() {
  const isReversalOpen = useCaseStore((s) => s.isReversalOpen);
  const closeReversal = useCaseStore((s) => s.closeReversal);
  const currentCase = useCaseStore((s) => s.currentCase);

  useEffect(() => {
    if (isReversalOpen) {
      forensicAudio.playReversalImpact();
      forensicAudio.playHeartbeat();
    }
  }, [isReversalOpen]);

  if (!isReversalOpen || !currentCase) return null;

  const redHerring = currentCase.suspects[1];
  const trueCulprit = currentCase.suspects[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-lg">
        {/* Harsh Red Chiaroscuro Flash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, #8B0000 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#EDE8D5] text-[#1A1817] p-8 md:p-10 rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-4 border-[#2A1808]"
        >
          {/* Crimson Stamp */}
          <div className="absolute top-6 right-6 border-2 border-[#8B0000] text-[#8B0000] font-mono text-[11px] font-black px-3 py-1 uppercase tracking-widest -rotate-6">
            NARRATIVE REVERSAL
          </div>

          <div className="border-b-2 border-[#1A1817] pb-4 mb-6">
            <span className="font-mono text-[10px] font-black tracking-widest text-[#6B0000] uppercase">
              ACT II · THE VEIL SHATTERS
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-wide text-[#1A1817] mt-1">
              CIRCUMSTANTIAL FRAME BROKEN
            </h2>
          </div>

          <div className="font-mono text-xs md:text-sm text-neutral-800 leading-relaxed space-y-4">
            <p className="font-bold text-[#8B0000]">
              DISCOVERY ALERT: The initial working theory has collapsed.
            </p>
            <p>
              Forensic chromatography and verified gatehouse exit records confirm that{" "}
              <span className="font-bold text-neutral-900 underline">
                {redHerring?.name || "the prime suspect"}
              </span>{" "}
              departed the grounds at 22:15—well before the fatal window. The evidence against them was deliberately staged!
            </p>
            <p>
              A deeper conspiracy is now visible. Suspicion shifts to the inner circle. Switchboard wiretaps indicate{" "}
              <span className="font-bold text-[#8B0000]">
                {trueCulprit?.name || "an unsuspected associate"}
              </span>{" "}
              had prior knowledge of the victim's movements and access to the lethal instrument.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#1A1817]/25 flex items-center justify-between">
            <span className="font-mono text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
              ACT II FORENSIC CLUES UNLOCKED ON CORKBOARD
            </span>
            <button
              onClick={() => {
                forensicAudio.playPhotoInspect();
                closeReversal();
              }}
              className="px-6 py-2.5 bg-[#8B0000] hover:bg-red-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer shadow-md flex items-center gap-2"
            >
              <span>RESUME INVESTIGATION</span>
              <span>→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
