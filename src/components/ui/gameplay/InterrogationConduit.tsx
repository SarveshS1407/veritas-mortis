"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import { EvidenceNode } from "@/types/case";

export default function InterrogationConduit() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const activeSuspectId = useCaseStore((s) => s.activeSuspectId);
  const activeEvidenceId = useCaseStore((s) => s.activeEvidenceId);
  const interrogationLog = useCaseStore((s) => s.interrogationLog);
  const interrogateSuspect = useCaseStore((s) => s.interrogateSuspect);
  const setActiveSuspect = useCaseStore((s) => s.setActiveSuspect);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);
  const examineEvidence = useCaseStore((s) => s.examineEvidence);
  const recordPlayerChoice = useCaseStore((s) => s.recordPlayerChoice);
  const playerChoices = useCaseStore((s) => s.playerChoices);

  const [showEvidenceSelector, setShowEvidenceSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interrogationLog]);

  if (!currentCase) return null;

  const evidenceList: EvidenceNode[] = currentCase.evidenceNodes || currentCase.evidence || [];
  const suspect = currentCase.suspects.find((s) => s.id === activeSuspectId) || currentCase.suspects[0];
  const activeEvidence = evidenceList.find((e) => e.id === activeEvidenceId);
  const examinedEvidence = evidenceList.filter(
    (e) => e.status === "examined" || e.status === "analyzed"
  );

  const suspectLog = interrogationLog.filter((e) => e.suspectId === suspect?.id);

  const handleAction = async (action: string, evidenceId?: string) => {
    if (!suspect || isProcessing) return;
    setIsProcessing(true);
    forensicAudio.playTypewriterKey();
    await interrogateSuspect(suspect.id, action, evidenceId);
    setIsProcessing(false);
    setShowEvidenceSelector(false);
  };

  const getStatusColor = (level: string = "CALM") => {
    switch (level) {
      case "CALM":
        return "text-emerald-400 border-emerald-500 bg-emerald-950/40";
      case "DEFLECTING":
        return "text-amber-400 border-amber-500 bg-amber-950/40";
      case "CORNERED":
        return "text-orange-400 border-orange-500 bg-orange-950/40";
      case "BROKEN":
        return "text-red-500 border-red-500 bg-red-950/50 animate-pulse";
      default:
        return "text-zinc-400 border-zinc-700 bg-zinc-900";
    }
  };

  const getBarGradient = (stress: number = 20) => {
    if (stress < 30) return "from-emerald-700 to-emerald-500";
    if (stress < 60) return "from-amber-600 to-amber-500";
    if (stress < 85) return "from-orange-600 to-orange-500";
    return "from-red-700 to-red-500";
  };

  return (
    <div className="w-full h-full bg-[#080808] flex flex-col border-l border-zinc-800/80 font-mono text-[#E8E3D9] overflow-hidden select-none">
      {/* ── Suspect Selector Tabs ── */}
      <div className="flex border-b border-zinc-800 bg-[#121010] flex-shrink-0">
        {currentCase.suspects.map((s, idx) => {
          const isActive = s.id === suspect?.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                forensicAudio.playPhotoInspect();
                setActiveSuspect(s.id);
              }}
              className={`flex-1 py-2.5 px-3 text-left transition-colors cursor-pointer border-r border-zinc-800 flex items-center justify-between ${
                isActive
                  ? "bg-[#1A1714] border-b-2 border-b-[#8B0000] text-[#E8E3D9]"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-[#160F0B]"
              }`}
            >
              <div className="truncate">
                <span className="text-[8px] uppercase tracking-widest text-[#8A6830] block">
                  SUSPECT 0{idx + 1}
                </span>
                <span className="text-xs font-serif font-bold uppercase truncate">
                  {s.name}
                </span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 border rounded-sm font-bold ${getStatusColor(s.composureLevel || (s.composure as string))}`}>
                {s.composureLevel || (s.composure as string) || "CALM"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Suspect Header & Composure Gauge ── */}
      {suspect && (
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-[#14100D]/80 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-[#EDE8D5] tracking-tight uppercase drop-shadow-md">
                {suspect.name}
              </h2>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
                {suspect.occupation || suspect.role} · {suspect.age || 40} YEARS OLD · COMPOSURE PROTOCOL
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 border rounded-sm ${getStatusColor(suspect.composureLevel || (suspect.composure as string))}`}>
                [{suspect.composureLevel || (suspect.composure as string) || "CALM"}]
              </span>
            </div>
          </div>

          {/* Stress / Composure Gauge */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 w-24">
              PULSE / STRESS
            </span>
            <div className="flex-1 h-2.5 bg-black border border-neutral-700 relative overflow-hidden rounded-sm">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarGradient(
                  suspect.stressLevel || 20
                )}`}
                animate={{ width: `${Math.min(100, Math.max(10, suspect.stressLevel || 20))}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-neutral-300 w-10 text-right font-bold">
              {suspect.stressLevel || 20}/100
            </span>
          </div>

          {/* Dynamic Body Language Cue */}
          <div className="mt-3 p-2 bg-black/60 border border-neutral-800 rounded-sm">
            <p className="italic text-neutral-300 text-xs leading-relaxed">
              {suspect.bodyLanguageCues?.[(suspect.composureLevel as any) || "CALM"] ||
                "*[Maintains guarded silence across the interrogation table]*"}
            </p>
          </div>
        </div>
      )}

      {/* ── Interrogation Transcript Area ── */}
      <div className="flex-1 p-4 md:p-5 overflow-y-auto flex flex-col gap-3 bg-[#0A0A0A]">
        {suspectLog.length === 0 && (
          <div className="text-center my-auto py-8">
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1">
              [ PRECINCT INTERROGATION RECORD OPEN ]
            </span>
            <p className="text-xs text-neutral-500 font-serif italic max-w-sm mx-auto">
              "{suspect?.alibiStatement || "I was elsewhere when the incident occurred."}"
            </p>
            <p className="text-[10px] text-[#8A6830] mt-3 uppercase">
              SELECT AN INTERROGATION ACTION BELOW TO BEGIN QUESTIONING
            </p>
          </div>
        )}

        {suspectLog.map((entry) => (
          <div key={entry.id} className="space-y-2">
            {/* Detective Action */}
            <div className="text-right">
              <span className="text-[8px] text-neutral-500 uppercase tracking-widest block mb-0.5">
                LEAD DETECTIVE
              </span>
              <div className="text-xs text-[#E8E3D9] inline-block bg-[#161311] px-3 py-2 rounded-sm border border-neutral-700 max-w-[85%] text-left">
                <span>{entry.playerAction}</span>
                {entry.evidenceUsed && (
                  <span className="block text-[9px] text-amber-500 mt-1 uppercase font-bold">
                    [EVIDENCE CONFRONTED:{" "}
                    {evidenceList.find((e) => e.id === entry.evidenceUsed)?.title ||
                      "CASE ARTIFACT"}
                    ]
                  </span>
                )}
              </div>
            </div>

            {/* Suspect Response */}
            <div className="text-left">
              <span className="text-[8px] text-neutral-500 uppercase tracking-widest block mb-0.5">
                {suspect?.name.toUpperCase()}
              </span>
              <div className="text-xs text-[#D4C5A9] border-l-2 border-[#8B0000] pl-3 py-1 max-w-[88%] leading-relaxed bg-[#120F0D]/40">
                “{entry.suspectResponse}”
              </div>
              {entry.composureDelta !== 0 && (
                <span className="text-[9px] text-[#8B0000] mt-1 block font-bold">
                  [STRESS +{entry.composureDelta} · COMPOSURE IMPACTED]
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      {/* ── Interrogation Controls ── */}
      <div className="p-3 md:p-4 bg-[#121010] border-t border-zinc-800 relative flex-shrink-0">
        {/* Evidence Selection Dropdown Modal */}
        <AnimatePresence>
          {showEvidenceSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 p-4 bg-[#160F0B] border-2 border-[#5C4A38] rounded-sm shadow-2xl z-30 max-h-56 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-700">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4C5A9]">
                  CONFRONT WITH EXAMINED EVIDENCE
                </span>
                <button
                  onClick={() => setShowEvidenceSelector(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {examinedEvidence.length === 0 ? (
                <p className="text-[10px] text-neutral-500 py-3 text-center">
                  Examine evidence cards on the corkboard first before presenting them to suspects.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examinedEvidence.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() =>
                        handleAction(
                          `"I have this in my possession: ${ev.title}. Explain how your name is connected."`,
                          ev.id
                        )
                      }
                      className="p-2 bg-[#1A1714] hover:bg-[#2A201A] border border-neutral-700 hover:border-[#8B0000] text-left text-[10px] rounded-sm transition-colors cursor-pointer truncate"
                    >
                      <span className="text-[#8B0000] font-bold block">{ev.type}</span>
                      <span className="text-neutral-200 font-bold truncate block">{ev.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Action 1: Question Alibi */}
          <button
            onClick={() => handleAction(`"Walk me through your exact movements during the fatal window again. Every second."`)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#151313] hover:bg-[#1E1917] border border-[#570B12] hover:border-[#9D101D] text-[10px] text-[#C3B69C] hover:text-white uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            1. Press Alibi
          </button>

          {/* Action 2: Challenge Hidden Secret */}
          <button
            onClick={() => handleAction(`"We found private correspondence and transaction slips. What aren't you telling us?"`)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#151313] hover:bg-[#1E1917] border border-[#570B12] hover:border-[#9D101D] text-[10px] text-[#C3B69C] hover:text-white uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            2. Challenge Secret
          </button>

          {/* Action 3: Confront with Evidence */}
          <button
            onClick={() => setShowEvidenceSelector(!showEvidenceSelector)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#570B12] hover:bg-[#9D101D] border border-[#D21F2B] text-[10px] text-white uppercase tracking-wider rounded-sm transition-colors cursor-pointer font-bold disabled:opacity-40 shadow"
          >
            3. Present Clue
          </button>

          {/* Action 4: Strategic Bluff */}
          <button
            onClick={() => handleAction(`"Forensics ran chemical residue tests on the crime scene doorknob. The results are already on their way."`)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#151313] hover:bg-[#1E1917] border border-[#74777C] hover:border-white text-[10px] text-[#74777C] hover:text-white uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            4. Strategic Bluff
          </button>

          {/* Action 5: Empathy / De-escalation */}
          <button
            onClick={() => handleAction(`"I understand you felt cornered by the victim. If someone else forced your hand, now is the time to speak."`)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#151313] hover:bg-[#1E1917] border border-[#75866A] hover:border-emerald-500 text-[10px] text-[#75866A] hover:text-emerald-300 uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            5. Show Empathy
          </button>

          {/* Action 6: Final Confrontation */}
          <button
            onClick={() => handleAction(`"The forensic evidence is airtight. Step forward and confess before this goes to the grand jury."`)}
            disabled={isProcessing}
            className="py-2 px-2 bg-[#2A0808] hover:bg-[#570B12] border border-[#D21F2B] text-[10px] text-[#D21F2B] hover:text-white uppercase tracking-wider rounded-sm transition-colors cursor-pointer font-bold disabled:opacity-40 animate-pulse"
          >
            6. Force Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
