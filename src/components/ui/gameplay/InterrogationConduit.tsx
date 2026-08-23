"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";

export default function InterrogationConduit() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const activeSuspectId = useCaseStore((s) => s.activeSuspectId);
  const activeEvidenceId = useCaseStore((s) => s.activeEvidenceId);
  const interrogationLog = useCaseStore((s) => s.interrogationLog);
  const interrogateSuspect = useCaseStore((s) => s.interrogateSuspect);
  const setActiveSuspect = useCaseStore((s) => s.setActiveSuspect);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);
  const examineEvidence = useCaseStore((s) => s.examineEvidence);

  const [showEvidenceSelector, setShowEvidenceSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interrogationLog]);

  if (!currentCase) return null;

  const suspect = currentCase.suspects.find((s) => s.id === activeSuspectId);
  const activeEvidence = currentCase.evidence.find((e) => e.id === activeEvidenceId);
  const examinedEvidence = currentCase.evidence.filter(
    (e) => e.status === "examined" || e.status === "analyzed"
  );

  // Entries for this suspect only
  const suspectLog = interrogationLog.filter((e) => e.suspectId === activeSuspectId);

  const handleAction = async (action: string, evidenceId?: string) => {
    if (!suspect || isProcessing) return;
    setIsProcessing(true);
    await interrogateSuspect(suspect.id, action, evidenceId);
    setIsProcessing(false);
    setShowEvidenceSelector(false);
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case "CALM": return "text-green-500";
      case "DEFLECTING": return "text-yellow-500";
      case "CORNERED": return "text-orange-500";
      case "BROKEN": return "text-red-500 animate-pulse";
      default: return "text-zinc-500";
    }
  };

  const getBarGradient = (composure: number) => {
    if (composure > 70) return "from-green-800 to-green-700";
    if (composure > 40) return "from-yellow-700 to-yellow-600";
    if (composure > 15) return "from-orange-700 to-orange-600";
    return "from-red-800 to-red-700";
  };

  // ── MODE A: INTERROGATION ──
  if (suspect) {
    return (
      <div className="w-full h-full bg-pitch flex flex-col border-l border-zinc-800/50 font-mono text-bone overflow-hidden">
        {/* Header: Suspect Info + Composure */}
        <div className="p-5 border-b border-zinc-800 bg-charcoal/40 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-3xl text-parchment tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {suspect.name}
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                {suspect.role} · INTERROGATION #{suspect.interrogationCount + 1}
              </p>
            </div>
            <span className={`text-xs font-bold tracking-widest ${getStatusColor(suspect.composureLevel)}`}>
              [{suspect.composureLevel}]
            </span>
          </div>

          {/* Composure Gauge */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 w-20">Composure</span>
            <div className="flex-1 h-2.5 bg-black border border-zinc-700 relative overflow-hidden rounded-sm">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarGradient(suspect.composure)}`}
                animate={{ width: `${suspect.composure}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 w-8 text-right">{suspect.composure}%</span>
          </div>

          {/* Body Language Cue */}
          <div className="mt-3 p-2.5 bg-black/50 border border-zinc-800 rounded-sm">
            <p className="italic text-zinc-400 text-xs leading-relaxed">
              {suspect.bodyLanguageCues[suspect.composureLevel]}
            </p>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 bg-[#080808]">
          {suspectLog.length === 0 && (
            <p className="text-zinc-700 text-xs text-center uppercase tracking-widest mt-12">
              Begin questioning the suspect
            </p>
          )}
          {suspectLog.map((entry) => (
            <div key={entry.id} className="space-y-2">
              {/* Player action */}
              <div className="text-right">
                <span className="text-[9px] text-zinc-600 block mb-0.5">DETECTIVE</span>
                <p className="text-sm text-bone inline-block bg-zinc-900/60 px-3 py-2 rounded-sm border border-zinc-800 max-w-[85%]">
                  {entry.playerAction}
                  {entry.evidenceUsed && (
                    <span className="block text-[9px] text-amber-600 mt-1 uppercase">
                      [EVIDENCE PRESENTED: {currentCase.evidence.find((e) => e.id === entry.evidenceUsed)?.title}]
                    </span>
                  )}
                </p>
              </div>
              {/* Suspect response */}
              <div>
                <span className="text-[9px] text-zinc-600 block mb-0.5">
                  {suspect.name.split(" ").pop()?.toUpperCase()}
                </span>
                <p className="text-sm text-parchment border-l-2 border-zinc-800 pl-3 max-w-[85%] leading-relaxed">
                  &ldquo;{entry.suspectResponse}&rdquo;
                </p>
                {entry.composureDelta !== 0 && (
                  <span className="text-[9px] text-red-700 mt-1 block">
                    [COMPOSURE {entry.composureDelta > 0 ? "+" : ""}{entry.composureDelta}]
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-charcoal/60 border-t border-zinc-800 relative flex-shrink-0">
          {/* Evidence Selector Popup */}
          <AnimatePresence>
            {showEvidenceSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 w-full bg-charcoal border border-zinc-700 max-h-48 overflow-y-auto shadow-2xl"
              >
                <div className="p-2 text-[10px] text-zinc-400 bg-black/60 uppercase tracking-widest border-b border-zinc-800">
                  Select Evidence to Present
                </div>
                {examinedEvidence.length === 0 && (
                  <div className="p-3 text-xs text-zinc-600 italic">No evidence examined yet.</div>
                )}
                {examinedEvidence.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAction(`Present evidence: ${item.title}`, item.id)}
                    className="w-full text-left p-3 hover:bg-zinc-800 text-sm border-b border-zinc-800/50 transition-colors text-zinc-300"
                  >
                    <span className="font-bold">{item.title}</span>
                    <span className="text-[9px] text-zinc-500 ml-2 uppercase">[{item.category}]</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction("Where were you on the night in question?")}
              disabled={isProcessing}
              className="p-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 text-[10px] uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Question Alibi
            </button>
            <button
              onClick={() => handleAction("You're lying. I can see it in your eyes.")}
              disabled={isProcessing}
              className="p-3 bg-zinc-900 border border-zinc-700 hover:bg-red-950/40 hover:border-red-800 text-[10px] uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Press Harder
            </button>
            <button
              onClick={() => setShowEvidenceSelector(!showEvidenceSelector)}
              disabled={isProcessing}
              className="p-3 bg-zinc-900 border border-zinc-700 hover:bg-amber-950/30 hover:border-amber-800 text-[10px] uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Present Evidence
            </button>
            <button
              onClick={() => setActiveSuspect(null)}
              className="p-3 bg-black border border-zinc-800 hover:bg-zinc-900 text-[10px] uppercase tracking-widest text-zinc-500 transition-all"
            >
              End Interrogation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MODE B: DOCUMENT INSPECTION ──
  if (activeEvidence) {
    return (
      <div className="w-full h-full bg-pitch flex items-center justify-center p-8 border-l border-zinc-800/50 relative">
        <button
          onClick={() => setActiveEvidence(null)}
          className="absolute top-6 right-6 p-2 bg-charcoal border border-zinc-700 hover:bg-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-400 z-10"
        >
          Return to Board
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-parchment p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
        >
          {/* Stamp */}
          {activeEvidence.stampLabel && (
            <div className="absolute top-8 right-8 -rotate-12 border-4 border-red-800 text-red-800 font-mono text-lg font-bold p-2 opacity-75 mix-blend-multiply pointer-events-none">
              {activeEvidence.stampLabel}
            </div>
          )}

          <div className="border-b-2 border-ink/20 pb-4 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50 block mb-2">
              CATEGORY: {activeEvidence.category.toUpperCase()}
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink uppercase">
              {activeEvidence.title}
            </h2>
          </div>

          <div className="font-mono text-sm leading-relaxed text-ink/80 mb-6">
            {activeEvidence.summary}
          </div>

          <div className="bg-ink/5 p-4 border-l-4 border-ink/30 font-serif text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
            {activeEvidence.fullAnalysis}
          </div>

          <div className="mt-6 flex gap-2">
            {activeEvidence.implicates.length > 0 && (
              <span className="text-[9px] font-mono text-red-800 bg-red-100 px-2 py-0.5 uppercase">
                IMPLICATES: {activeEvidence.implicates.join(", ")}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MODE C: EMPTY STATE ──
  return (
    <div className="w-full h-full bg-pitch flex items-center justify-center border-l border-zinc-800/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <filter id="conduit-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#conduit-grain)" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-mono text-zinc-700 text-sm tracking-[0.2em] uppercase animate-pulse">
          Select a suspect or evidence item
        </p>
        <p className="font-mono text-zinc-800 text-xs tracking-widest uppercase mt-1">
          from the board
        </p>
      </div>
    </div>
  );
}
