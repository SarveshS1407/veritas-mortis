"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

export default function CaseProgressionDock() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const currentAct = useCaseStore((s) => s.currentAct);
  const advanceAct = useCaseStore((s) => s.advanceAct);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);
  const examineEvidence = useCaseStore((s) => s.examineEvidence);

  if (!currentCase) return null;

  const acts = [
    { id: "act1_hook", label: "ACT I", title: "INITIAL HOOK" },
    { id: "act2_reversal", label: "ACT II", title: "REVERSAL" },
    { id: "act3_climax", label: "ACT III", title: "RECKONING" },
  ] as const;

  const actOrder = ["act1_hook", "act2_reversal", "act3_climax"];
  const currentActIndex = actOrder.indexOf(currentAct);

  const evidenceList = currentCase.evidenceNodes || currentCase.evidence || [];

  // Evidence in tray: items from unlocked acts
  const discoveredEvidence = evidenceList.filter((e) => {
    const evActIndex = actOrder.indexOf(e.unlocksInAct);
    return evActIndex <= currentActIndex;
  });

  const actSummaries = currentCase.actSummaries || currentCase.narrativeActs || {
    act1_hook: "Initial crime scene discovery. Circumstantial evidence points toward a framed suspect.",
    act2_reversal: "Toxicology and wiretap logs shatter the initial theory and exonerate the framed suspect.",
    act3_climax: "Forensic UV inspection and smoking-gun proof corner the true culprit.",
  };

  const handleAdvance = () => {
    forensicAudio.playFolderOpen();
    advanceAct();
  };

  return (
    <div className="w-full h-full bg-[#0c0a09] border-t border-zinc-800/60 flex shadow-[0_-10px_30px_rgba(0,0,0,0.8)] select-none">
      {/* Left: Act Progression */}
      <div className="w-[30%] md:w-[24%] h-full p-3 md:p-4 border-r border-zinc-800/50 flex flex-col justify-between bg-charcoal/30">
        <div className="flex items-center justify-between gap-1">
          {acts.map((act, i) => {
            const isComplete = currentActIndex > i;
            const isCurrent = currentAct === act.id;
            return (
              <div key={act.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border transition-all ${
                      isComplete
                        ? "bg-zinc-500 border-zinc-400"
                        : isCurrent
                        ? "bg-red-700 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                        : "bg-black border-zinc-800"
                    }`}
                  />
                  <span
                    className={`text-[8px] md:text-[9px] font-mono mt-1 ${
                      isCurrent ? "text-bone font-bold" : "text-zinc-600"
                    }`}
                  >
                    {act.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-px flex-1 mx-1 ${
                      isComplete ? "bg-zinc-600" : "bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[9px] font-mono text-zinc-400 leading-snug line-clamp-2 my-1">
          {actSummaries[currentAct]}
        </div>

        <button
          onClick={handleAdvance}
          disabled={currentAct === "act3_climax"}
          className="w-full py-1.5 bg-[#160F0B] border border-zinc-700 hover:border-zinc-500 text-[9px] font-mono uppercase text-zinc-300 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer rounded-sm"
        >
          <span>{currentAct === "act3_climax" ? "FINAL ACT REACHED" : "ADVANCE NARRATIVE ACT"}</span>
          {currentAct !== "act3_climax" && <span>→</span>}
        </button>
      </div>

      {/* Center: Case Info */}
      <div className="hidden sm:flex w-[22%] md:w-[18%] h-full flex-col items-center justify-center border-r border-zinc-800/50 bg-charcoal/15 font-mono px-3 text-center">
        <span className="text-[9px] text-[#8A6830] tracking-widest uppercase font-bold">
          ACTIVE DOSSIER
        </span>
        <span className="text-base font-bold text-bone tracking-tight mt-0.5">
          {currentCase.caseNumber}
        </span>
        <span className="text-[10px] text-zinc-400 uppercase truncate max-w-full">
          Victim: {currentCase.victim.name}
        </span>
        <span className="text-[9px] text-zinc-600 mt-0.5">{currentCase.date}</span>
      </div>

      {/* Right: Evidence Quick-Tray */}
      <div className="flex-1 h-full p-2.5 md:p-3 overflow-hidden flex flex-col bg-[#050505]">
        <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            FORENSIC EVIDENCE REPOSITORY ({discoveredEvidence.length} SECURED)
          </span>
          <span className="text-[8px] font-mono text-zinc-600">
            [ CLICK TO EXAMINE ]
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
          {discoveredEvidence.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => {
                forensicAudio.playPaperSlide();
                examineEvidence(item.id);
                setActiveEvidence(item.id);
              }}
              className="flex-shrink-0 w-24 md:w-28 h-full bg-[#EDE8D5] border border-neutral-600 relative cursor-pointer shadow-md group rounded-sm"
            >
              {/* Metallic paper clip */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-1.5 bg-gradient-to-b from-zinc-300 to-zinc-500 rounded-sm shadow-sm" />

              <div className="p-1.5 flex flex-col h-full justify-between items-center text-[#1A1817] text-center">
                <span className="text-[7px] font-mono font-bold text-[#8B0000] uppercase tracking-wider">
                  {item.type}
                </span>
                <span className="text-[8px] font-mono font-bold leading-tight line-clamp-2 uppercase">
                  {item.title || item.label}
                </span>
                <div
                  className={`w-full h-1 rounded-full ${
                    item.status === "examined" || item.status === "analyzed"
                      ? "bg-green-700"
                      : "bg-amber-600"
                  }`}
                />
              </div>
            </motion.div>
          ))}
          {discoveredEvidence.length === 0 && (
            <div className="text-[10px] font-mono text-zinc-700 uppercase w-full text-center">
              Awaiting crime scene discovery
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
