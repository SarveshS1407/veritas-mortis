"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";

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
    { id: "act3_climax", label: "ACT III", title: "CLIMAX" },
  ] as const;

  const actOrder = ["act1_hook", "act2_reversal", "act3_climax"];
  const currentActIndex = actOrder.indexOf(currentAct);

  // Evidence in tray: items from unlocked acts that have been discovered/examined
  const discoveredEvidence = currentCase.evidence.filter((e) => {
    const evActIndex = actOrder.indexOf(e.unlocksInAct);
    return evActIndex <= currentActIndex;
  });

  return (
    <div className="w-full h-full bg-[#0c0a09] border-t border-zinc-800/50 flex shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* Left: Act Progression */}
      <div className="w-[22%] h-full p-4 border-r border-zinc-800/30 flex flex-col justify-between bg-charcoal/20">
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
                        ? "bg-crimson border-red-700 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                        : "bg-black border-zinc-800"
                    }`}
                  />
                  <span className={`text-[8px] font-mono mt-1.5 ${isCurrent ? "text-bone" : "text-zinc-700"}`}>
                    {act.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`h-px flex-1 mx-1 ${isComplete ? "bg-zinc-600" : "bg-zinc-800"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-[9px] font-mono text-zinc-600 leading-relaxed line-clamp-2">
          {currentCase.actSummaries[currentAct]}
        </div>

        <button
          onClick={advanceAct}
          disabled={currentAct === "act3_climax"}
          className="mt-2 w-full py-1.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-[9px] font-mono uppercase text-zinc-400 hover:text-bone transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          Advance Act
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Center: Case Info */}
      <div className="w-[20%] h-full flex flex-col items-center justify-center border-r border-zinc-800/30 bg-charcoal/10 font-mono px-3">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase mb-1">Active Case</span>
        <span className="text-lg text-bone tracking-tight">{currentCase.caseNumber}</span>
        <span className="text-[10px] text-zinc-400 uppercase mt-0.5 truncate max-w-full">
          V: {currentCase.victim.name}
        </span>
        <span className="text-[9px] text-zinc-600 mt-1">{currentCase.date}</span>
      </div>

      {/* Right: Evidence Quick-Tray */}
      <div className="flex-1 h-full p-3 overflow-hidden flex flex-col bg-[#050505]">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2 flex-shrink-0">
          Evidence Tray ({discoveredEvidence.length})
        </span>
        <div className="flex-1 flex items-center gap-2.5 overflow-x-auto pb-1">
          {discoveredEvidence.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              onClick={() => {
                examineEvidence(item.id);
                setActiveEvidence(item.id);
              }}
              className="flex-shrink-0 w-20 h-full bg-parchment border border-zinc-400/60 relative cursor-pointer shadow-[0_3px_8px_rgba(0,0,0,0.5)] group"
            >
              {/* Metallic clip */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 bg-gradient-to-b from-zinc-300 to-zinc-500 rounded-sm shadow-sm" />

              <div className="p-1.5 flex flex-col h-full justify-center items-center text-ink text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mb-1 opacity-50">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-[8px] font-mono font-bold leading-tight line-clamp-2 uppercase">
                  {item.title}
                </span>
              </div>

              {/* Status indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                item.status === "examined" ? "bg-amber-600" :
                item.status === "analyzed" ? "bg-green-700" : "bg-zinc-400"
              }`} />
            </motion.div>
          ))}
          {discoveredEvidence.length === 0 && (
            <div className="text-[10px] font-mono text-zinc-800 uppercase w-full text-center">
              No evidence collected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
