"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CasePersistence, ArchivedCaseRecord } from "@/lib/casePersistence";
import { forensicAudio } from "@/lib/forensicAudio";

interface CaseArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySeed?: (seed: number) => void;
}

export default function CaseArchiveModal({
  isOpen,
  onClose,
  onReplaySeed,
}: CaseArchiveModalProps) {
  const [records, setRecords] = useState<ArchivedCaseRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ArchivedCaseRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(CasePersistence.getArchivedCases());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-emerald-400 border-emerald-500 bg-emerald-950/40";
      case "B":
        return "text-amber-400 border-amber-500 bg-amber-950/40";
      case "C":
        return "text-orange-400 border-orange-500 bg-orange-950/40";
      default:
        return "text-red-500 border-red-600 bg-red-950/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#121010] text-[#E8E3D9] border-2 border-[#5C4A38] rounded-sm shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3B2A1E] bg-[#160F0B]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
            <div>
              <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-[#E8E3D9]">
                PRECINCT CASE ARCHIVE & COLD CASE LEDGER
              </h2>
              <p className="font-mono text-[10px] text-neutral-400">
                Permanent records of solved and closed homicide investigations
              </p>
            </div>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-16 font-mono text-xs text-neutral-500">
              <p className="uppercase tracking-widest text-[#D4C5A9]/60">
                [ ARCHIVE EMPTY ]
              </p>
              <p className="mt-2 text-[11px] text-neutral-600">
                No closed homicide files found in storage. Complete an investigation and file an indictment to record findings here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    forensicAudio.playPaperSlide();
                    setSelectedRecord(rec);
                  }}
                  className={`p-4 bg-[#160F0B] border hover:border-[#8B0000] rounded-sm transition-all cursor-pointer shadow-md flex flex-col justify-between ${
                    selectedRecord?.id === rec.id
                      ? "border-[#8B0000] ring-1 ring-[#8B0000]"
                      : "border-[#3B2A1E]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-[#8A6830]">
                        #{rec.caseNumber}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-black px-2 py-0.5 border rounded-sm ${getGradeColor(
                          rec.grade
                        )}`}
                      >
                        VERDICT GRADE {rec.grade}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-[#E8E3D9] uppercase line-clamp-1">
                      {rec.title}
                    </h3>
                    <p className="font-mono text-xs text-neutral-400 mt-1">
                      Victim: <span className="text-[#D4C5A9] font-semibold">{rec.victimName}</span>
                    </p>
                    <p className="font-mono text-xs text-neutral-400">
                      Culprit Identified: <span className="text-[#8B0000] font-semibold">{rec.culpritName}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A1808] flex items-center justify-between font-mono text-[10px] text-neutral-500">
                    <span>CLOSED: {rec.dateCompleted}</span>
                    <span className="text-[#D4C5A9] hover:underline">
                      View Dossier →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Record Detail Modal */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="border-t border-[#3B2A1E] bg-[#160F0B] p-6 text-xs font-mono space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#8A6830] font-bold">
                    FILE RECONSTRUCTION #{selectedRecord.caseNumber}
                  </span>
                  <h4 className="font-serif text-lg font-bold uppercase text-[#E8E3D9]">
                    {selectedRecord.title}
                  </h4>
                </div>
                <div className="flex gap-2">
                  {onReplaySeed && (
                    <button
                      onClick={() => {
                        forensicAudio.playFolderOpen();
                        onReplaySeed(selectedRecord.seed);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#8B0000] hover:bg-red-800 text-white font-mono text-xs rounded-sm transition-colors cursor-pointer"
                    >
                      Re-investigate Seed #{selectedRecord.seed}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-2 py-1 bg-[#2A1808] text-neutral-400 hover:text-white rounded-sm"
                  >
                    Close Detail
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2A1808]">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Motive:</span>
                  <span className="text-neutral-300 font-semibold">{selectedRecord.motiveSummary}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Interrogations:</span>
                  <span className="text-neutral-300 font-semibold">{selectedRecord.interrogationsCount} Sessions</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Evidence Discovered:</span>
                  <span className="text-neutral-300 font-semibold">{selectedRecord.evidenceExaminedPercent}%</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Outcome:</span>
                  <span className="text-[#8B0000] font-semibold">{selectedRecord.solved ? "Convicted" : "Acquitted / Unsolved"}</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3 border border-[#2A1808] rounded-sm text-neutral-300 leading-relaxed font-sans italic">
                "{selectedRecord.epilogueExcerpt}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#3B2A1E] bg-[#0A0A0A] flex justify-between items-center text-[10px] font-mono text-neutral-500">
          <span>{records.length} DOCKETS CATALOGUED</span>
          <span>DETERMINISTIC SEEDS PERPETUALLY REPRODUCIBLE</span>
        </div>
      </motion.div>
    </div>
  );
}
