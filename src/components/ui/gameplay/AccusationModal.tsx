"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import type { Accusation, EvidenceNode } from "@/types/case";

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToMenu?: () => void;
}

export default function AccusationModal({
  isOpen,
  onClose,
  onReturnToMenu,
}: AccusationModalProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const submitAccusation = useCaseStore((s) => s.submitAccusation);
  const verdict = useCaseStore((s) => s.verdict);
  const resetGame = useCaseStore((s) => s.resetGame);

  const [selectedKiller, setSelectedKiller] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [selectedMotiveIndex, setSelectedMotiveIndex] = useState<number>(-1);

  if (!isOpen || !currentCase) return null;

  const suspects = currentCase.suspects || [];
  const evidenceList: EvidenceNode[] = currentCase.evidenceNodes || currentCase.evidence || [];
  const weaponEvidence = evidenceList.filter(
    (e) => e.category === "weapon" || e.type === "PHYSICAL" || e.type === "BIO"
  );

  const motives = [
    currentCase.secretTruth?.motiveSummary || "Preventing exposure of offshore embezzlement trust",
    "Retribution for an engineered bankruptcy and corporate betrayal",
    "Covering up illicit black-market antiquities before disclosure",
    "Eliminating a blackmailer before criminal indictment",
    "Securing the estate valuation and inheritance commission exclusively"
  ];

  const handleSubmit = () => {
    if (selectedKiller && selectedWeapon && selectedMotiveIndex >= 0) {
      const accusation: Accusation = {
        accusedSuspectId: selectedKiller,
        selectedWeaponEvidenceId: selectedWeapon,
        selectedMotiveIndex: selectedMotiveIndex,
        selectedMotive: motives[selectedMotiveIndex],
        reconstructedSequence: [],
      };
      forensicAudio.playStampSlam();
      submitAccusation(accusation);
    }
  };

  const handleNewCase = () => {
    resetGame();
    onClose();
    if (onReturnToMenu) onReturnToMenu();
  };

  const isFormComplete = selectedKiller && selectedWeapon && selectedMotiveIndex >= 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/92 backdrop-blur-md select-none">
        {/* ── VERDICT VIEW ── */}
        {verdict ? (
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#EDE8D5] text-[#1A1817] p-8 md:p-12 relative border-4 border-[#2A1808] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-sm"
          >
            {/* Grade Stamp */}
            <div className="absolute top-8 right-8 -rotate-12 border-4 border-[#8B0000] text-[#8B0000] p-3 flex flex-col items-center justify-center min-w-[100px] shadow-sm">
              <span className="font-mono text-[9px] tracking-widest uppercase border-b-2 border-[#8B0000]/40 mb-0.5 w-full text-center font-bold">
                RATING
              </span>
              <span className="font-serif text-5xl md:text-6xl font-black">{verdict.grade}</span>
            </div>

            <div className="border-b-2 border-[#1A1817] pb-3 mb-6">
              <span className="font-mono text-[10px] font-black tracking-widest text-[#8B0000] uppercase">
                OFFICIAL INDICTMENT REPORT · CASE CLOSED
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-black text-[#1A1817] uppercase tracking-wide mt-1">
                {currentCase.title}
              </h2>
            </div>

            {/* Forensic Scores Breakdown */}
            <div className="space-y-2.5 font-mono text-xs text-neutral-800 mb-6">
              <div className="flex justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">CULPRIT IDENTIFICATION:</span>
                <span className={verdict.isKillerCorrect ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                  {verdict.isKillerCorrect ? "[CONFIRMED · CULPRIT SECURED]" : "[ERRONEOUS · WRONGFUL ARREST]"}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">MURDER WEAPON MATCH:</span>
                <span className={verdict.isWeaponCorrect ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                  {verdict.isWeaponCorrect ? "[BALLISTIC / CHEMICAL MATCH]" : "[MISIDENTIFIED INSTRUMENT]"}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">ESTABLISHED MOTIVE:</span>
                <span className={verdict.isMotiveCorrect ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                  {verdict.isMotiveCorrect ? "[PROVEN MOTIVE]" : "[UNSUBSTANTIATED MOTIVE]"}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">FORENSIC EVIDENCE EXAMINED:</span>
                <span className="font-semibold">{Math.round(verdict.evidenceExaminedPercent)}% OF LEADS</span>
              </div>
              <div className="flex justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">TOTAL INTERROGATIONS LOGGED:</span>
                <span className="font-semibold">{verdict.interrogationsCompleted} SESSIONS</span>
              </div>
            </div>

            {/* Narrative Epilogue Chronicle */}
            <div className="bg-[#E4DBC5] p-4 border-l-4 border-[#8B0000] mb-8 font-serif text-xs md:text-sm text-neutral-800 leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-mono text-[9px] font-bold text-[#8B0000] uppercase mb-1">
                SECRET CASE CHRONICLE & EPILOGUE:
              </p>
              {verdict.narrativeSummary || currentCase.secretTruth?.fullNarrativeChronicle}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNewCase}
                className="flex-1 py-3 bg-[#1A1817] hover:bg-[#8B0000] text-[#EDE8D5] font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer shadow-md text-center"
              >
                Commence New Case
              </button>
              {onReturnToMenu && (
                <button
                  onClick={() => {
                    onClose();
                    onReturnToMenu();
                  }}
                  className="py-3 px-6 bg-[#D8CEB6] hover:bg-[#C5BAA0] text-[#1A1817] font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer text-center"
                >
                  Return to Precinct Menu
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── INDICTMENT FORM ── */
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-3xl bg-[#EDE8D5] text-[#1A1817] p-8 md:p-10 relative shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-4 border-[#2A1808] max-h-[90vh] overflow-y-auto rounded-sm"
          >
            <button
              onClick={() => {
                forensicAudio.playPhotoInspect();
                onClose();
              }}
              className="absolute top-6 right-6 font-mono text-xs font-bold text-neutral-600 hover:text-black uppercase cursor-pointer"
            >
              ✕ CANCEL [ESC]
            </button>

            <div className="border-b-2 border-[#1A1817] pb-4 mb-6 text-center">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#8B0000]">
                DEPARTMENT OF HOMICIDE · JUDICIAL FORM #74
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-black text-[#1A1817] uppercase tracking-tight mt-1">
                Official Indictment Request
              </h1>
              <p className="font-mono text-xs text-neutral-600 mt-1">
                Case #{currentCase.caseNumber}: {currentCase.title}
              </p>
            </div>

            <div className="space-y-6 font-mono text-xs">
              {/* Step 1: Accused Killer */}
              <div>
                <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2 border-b border-black/15 pb-1">
                  I. Primary Accused Suspect
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {suspects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        forensicAudio.playPhotoInspect();
                        setSelectedKiller(s.id);
                      }}
                      className={`p-3 border text-left rounded-sm transition-all cursor-pointer ${
                        selectedKiller === s.id
                          ? "bg-[#1A1817] text-[#EDE8D5] border-[#8B0000] shadow-md ring-1 ring-[#8B0000]"
                          : "bg-white/60 border-neutral-300 hover:bg-white text-neutral-800"
                      }`}
                    >
                      <span className="font-serif font-bold text-sm block uppercase truncate">
                        {s.name}
                      </span>
                      <span className="text-[10px] opacity-75 block mt-0.5 truncate">
                        {s.occupation || s.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Murder Weapon */}
              <div>
                <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2 border-b border-black/15 pb-1">
                  II. Verified Murder Instrument
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {weaponEvidence.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        forensicAudio.playPhotoInspect();
                        setSelectedWeapon(w.id);
                      }}
                      className={`p-3 border text-left rounded-sm transition-all cursor-pointer ${
                        selectedWeapon === w.id
                          ? "bg-[#1A1817] text-[#EDE8D5] border-[#8B0000] shadow-md ring-1 ring-[#8B0000]"
                          : "bg-white/60 border-neutral-300 hover:bg-white text-neutral-800"
                      }`}
                    >
                      <span className="font-bold text-[11px] block uppercase truncate">
                        {w.title || w.label}
                      </span>
                      <span className="text-[9px] opacity-75 block mt-0.5 line-clamp-1">
                        {w.summary}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Motive */}
              <div>
                <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2 border-b border-black/15 pb-1">
                  III. Primary Established Motive
                </h3>
                <div className="space-y-1.5">
                  {motives.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        forensicAudio.playPhotoInspect();
                        setSelectedMotiveIndex(idx);
                      }}
                      className={`w-full p-2.5 border text-left rounded-sm transition-all cursor-pointer flex items-center gap-2.5 ${
                        selectedMotiveIndex === idx
                          ? "bg-[#1A1817] text-[#EDE8D5] border-[#8B0000] shadow-md ring-1 ring-[#8B0000]"
                          : "bg-white/60 border-neutral-300 hover:bg-white text-neutral-800"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${selectedMotiveIndex === idx ? "bg-[#8B0000]" : "bg-neutral-400"}`} />
                      <span className="text-[11px]">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Indictment */}
            <div className="mt-8 pt-4 border-t border-[#1A1817]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-mono text-[10px] text-neutral-500">
                WARNING: An inaccurate indictment damages precinct conviction rating.
              </span>

              <button
                onClick={handleSubmit}
                disabled={!isFormComplete}
                className="w-full sm:w-auto px-8 py-3 bg-[#8B0000] hover:bg-red-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                Deliver Indictment to Court →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
