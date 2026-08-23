"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import type { Accusation } from "@/types/case";

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccusationModal({ isOpen, onClose }: AccusationModalProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const submitAccusation = useCaseStore((s) => s.submitAccusation);
  const verdict = useCaseStore((s) => s.verdict);
  const resetGame = useCaseStore((s) => s.resetGame);

  const [selectedKiller, setSelectedKiller] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [selectedMotiveIndex, setSelectedMotiveIndex] = useState<number>(-1);

  if (!currentCase) return null;

  const suspects = currentCase.suspects;
  const weaponEvidence = currentCase.evidence.filter((e) => e.category === "weapon");

  const motives = [
    "Financial Gain / Inheritance",
    "Revenge for a Ruined Career",
    "Covering Up Fraud or Crime",
    "Jealousy / Crimes of Passion",
    "Self-Defense Gone Wrong",
  ];

  const handleSubmit = () => {
    if (selectedKiller && selectedWeapon && selectedMotiveIndex >= 0) {
      const accusation: Accusation = {
        accusedSuspectId: selectedKiller,
        selectedWeaponEvidenceId: selectedWeapon,
        selectedMotiveIndex: selectedMotiveIndex,
        reconstructedSequence: [],
      };
      submitAccusation(accusation);
    }
  };

  const handleNewCase = () => {
    resetGame();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,1)" }}
        >
          {/* ── VERDICT VIEW ── */}
          {verdict ? (
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-parchment p-12 relative border border-ink/20 shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
            >
              {/* Grade Stamp */}
              <div className="absolute top-10 right-10 -rotate-12 border-4 border-red-800 text-red-800 opacity-75 mix-blend-multiply p-4 flex flex-col items-center justify-center min-w-[110px]">
                <span className="font-mono text-[10px] tracking-widest uppercase border-b-2 border-red-800/50 mb-1 w-full text-center">
                  RATING
                </span>
                <span className="font-serif text-6xl font-black">{verdict.grade}</span>
              </div>

              <h2 className="font-serif text-3xl font-black text-ink uppercase mb-8 border-b-2 border-ink/30 pb-4">
                Case Concluded
              </h2>

              <div className="space-y-3 font-mono text-sm text-ink mb-8">
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <span className="font-bold">SUSPECT IDENTIFICATION:</span>
                  <span className={verdict.correctKiller ? "text-green-800" : "text-red-800"}>
                    {verdict.correctKiller ? "[CONFIRMED]" : "[ERRONEOUS]"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <span className="font-bold">MURDER WEAPON:</span>
                  <span className={verdict.correctWeapon ? "text-green-800" : "text-red-800"}>
                    {verdict.correctWeapon ? "[CONFIRMED]" : "[ERRONEOUS]"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <span className="font-bold">ESTABLISHED MOTIVE:</span>
                  <span className={verdict.correctMotive ? "text-green-800" : "text-red-800"}>
                    {verdict.correctMotive ? "[CONFIRMED]" : "[ERRONEOUS]"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <span className="font-bold">EVIDENCE EXAMINED:</span>
                  <span>{Math.round(verdict.evidenceExaminedPercent)}%</span>
                </div>
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <span className="font-bold">INTERROGATIONS:</span>
                  <span>{verdict.interrogationsCompleted}</span>
                </div>
              </div>

              <div className="bg-ink/5 p-4 border-l-4 border-ink/30 mb-8 font-serif italic text-ink/70 text-sm leading-relaxed">
                {verdict.narrativeSummary}
              </div>

              <button
                onClick={handleNewCase}
                className="w-full py-4 bg-ink text-parchment font-mono font-bold tracking-widest uppercase hover:bg-ink/85 transition-colors"
              >
                Commence New Investigation
              </button>
            </motion.div>
          ) : (
            /* ── INDICTMENT FORM ── */
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl bg-parchment p-10 relative shadow-[0_30px_80px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
              >
                [CANCEL]
              </button>

              <div className="text-center border-b-2 border-ink/80 pb-5 mb-8">
                <h1 className="font-serif text-2xl font-black text-ink uppercase tracking-tight">
                  Official Indictment Request
                </h1>
                <p className="font-mono text-[10px] text-ink/50 mt-1.5 uppercase tracking-widest">
                  Department of Forensic Investigation · Div. 09
                </p>
              </div>

              <div className="space-y-8">
                {/* Step 1: Select Killer */}
                <section>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase mb-4 border-b border-ink/20 pb-1">
                    I. Primary Suspect Identification
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {suspects.map((suspect) => (
                      <button
                        key={suspect.id}
                        onClick={() => setSelectedKiller(suspect.id)}
                        className={`p-4 text-left border-2 transition-all ${
                          selectedKiller === suspect.id
                            ? "border-blood bg-blood/10"
                            : "border-ink/15 hover:border-ink/40 bg-white/20"
                        }`}
                      >
                        <div className="w-full h-14 bg-charcoal/10 mb-2 border border-ink/10 flex items-center justify-center">
                          <span className="text-[9px] font-mono text-ink/30 uppercase">Mugshot</span>
                        </div>
                        <div className="font-serif font-bold text-ink text-sm leading-tight">{suspect.name}</div>
                        <div className="font-mono text-[9px] text-ink/50 uppercase">{suspect.role}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Step 2: Select Weapon */}
                <section>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase mb-4 border-b border-ink/20 pb-1">
                    II. Murder Weapon Declaration
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {weaponEvidence.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedWeapon(item.id)}
                        className={`p-3 text-left border-2 font-mono text-xs uppercase transition-all ${
                          selectedWeapon === item.id
                            ? "border-blood bg-blood/10 text-ink"
                            : "border-ink/15 hover:border-ink/40 bg-white/20 text-ink/60"
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                    {weaponEvidence.length === 0 && (
                      <div className="col-span-full font-mono text-xs text-ink/40 italic">
                        No weapons recovered in evidence.
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 3: Select Motive */}
                <section>
                  <h3 className="font-mono text-sm font-bold text-ink uppercase mb-4 border-b border-ink/20 pb-1">
                    III. Established Motive
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {motives.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedMotiveIndex(i)}
                        className={`p-3 text-left border-2 font-serif text-sm transition-all ${
                          selectedMotiveIndex === i
                            ? "border-blood bg-blood/10 text-ink"
                            : "border-ink/15 hover:border-ink/40 bg-white/20 text-ink/70"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-10 pt-6 border-t-2 border-ink/80 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedKiller || !selectedWeapon || selectedMotiveIndex < 0}
                  className="px-8 py-4 bg-blood text-bone font-mono font-bold tracking-widest uppercase hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                >
                  File Indictment
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
