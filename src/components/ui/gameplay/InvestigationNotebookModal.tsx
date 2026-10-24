"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import { NotebookTabType, NotebookNote } from "@/types/case";

interface InvestigationNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InvestigationNotebookModal({
  isOpen,
  onClose,
}: InvestigationNotebookModalProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const notebookNotes = useCaseStore((s) => s.notebookNotes);
  const addNotebookNote = useCaseStore((s) => s.addNotebookNote);
  const requestHint = useCaseStore((s) => s.requestHint);

  const [activeTab, setActiveTab] = useState<NotebookTabType | "hints">("facts");
  const [hintTier, setHintTier] = useState<1 | 2 | 3 | null>(null);
  const [activeHintText, setActiveHintText] = useState<string | null>(null);

  // New Note Input State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen || !currentCase) return null;

  const notesList: NotebookNote[] = notebookNotes || [];

  const filteredNotes = notesList.filter((note) => {
    if (activeTab === "facts") return note.category === "fact";
    if (activeTab === "leads") return note.category === "lead";
    if (activeTab === "contradictions") return note.category === "contradiction";
    if (activeTab === "hypotheses") return note.category === "hypothesis";
    return true;
  });

  const handleRequestHint = (tier: 1 | 2 | 3) => {
    forensicAudio.playRadioChime();
    setHintTier(tier);
    const hint = requestHint(tier);
    setActiveHintText(hint.text);
  };

  const handleSaveUserNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteText.trim()) return;

    addNotebookNote({
      category: activeTab === "hints" ? "hypothesis" : (activeTab as any),
      title: newNoteTitle.trim(),
      text: newNoteText.trim(),
      isVerified: false,
    });

    setNewNoteTitle("");
    setNewNoteText("");
    setIsAddingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md select-none font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl h-[640px] bg-[#EDE8D5] text-[#1A1817] rounded-sm shadow-[0_25px_80px_rgba(0,0,0,0.98)] border-4 border-[#2A1808] flex flex-col overflow-hidden relative"
      >
        {/* Notebook Leather Binder Top Edge */}
        <div className="bg-[#1C1512] px-6 py-3 flex items-center justify-between text-xs text-[#C3B69C] border-b-2 border-[#570B12]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D21F2B]" />
            <span className="uppercase font-bold tracking-widest text-[#E8E3D9]">
              INVESTIGATION JOURNAL · {currentCase.caseNumber}
            </span>
            <span className="text-neutral-500 hidden sm:inline">|</span>
            <span className="text-[10px] text-neutral-400 hidden sm:inline uppercase">
              DEPT. OF FORENSIC INQUIRY
            </span>
          </div>

          <button
            onClick={() => {
              forensicAudio.playFolderOpen();
              onClose();
            }}
            className="text-[#C3B69C] hover:text-white px-2 py-1 uppercase text-[10px] font-bold tracking-wider hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          >
            [ CLOSE JOURNAL (ESC) ✕ ]
          </button>
        </div>

        {/* Notebook Tabs Bar */}
        <div className="bg-[#D9D1BE] border-b border-[#2A1808]/40 px-6 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "facts", label: "1. Verified Facts", icon: "✓" },
            { id: "leads", label: "2. Leads & Observations", icon: "🔍" },
            { id: "contradictions", label: "3. Contradictions", icon: "⚠️" },
            { id: "hypotheses", label: "4. Detective Hypotheses", icon: "💡" },
            { id: "hints", label: "5. Inquisitor Hints", icon: "🗝️" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  forensicAudio.playPaperSlide();
                  setActiveTab(tab.id as any);
                }}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-t-sm transition-all cursor-pointer flex items-center gap-1.5 border-t border-x ${
                  isActive
                    ? "bg-[#EDE8D5] text-[#570B12] border-[#2A1808] -mb-px shadow-sm"
                    : "bg-[#C8BFAB] text-neutral-700 border-transparent hover:bg-[#D0C7B3]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Notebook Body Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto font-sans text-neutral-900 bg-[radial-gradient(#C8BFAB_1px,transparent_1px)] [background-size:16px_16px]">
          {/* TAB 1-4: NOTES LIST */}
          {activeTab !== "hints" ? (
            <div className="space-y-4">
              {/* Add Note Button & Form */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-400">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600">
                  ENTRIES IN SECTOR: {filteredNotes.length}
                </span>

                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-3 py-1 bg-[#1A1817] hover:bg-[#570B12] text-[#EDE8D5] font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  {isAddingNote ? "Cancel Note" : "+ Record Hypothesis"}
                </button>
              </div>

              {isAddingNote && (
                <form
                  onSubmit={handleSaveUserNote}
                  className="p-4 bg-white/70 border border-neutral-400 rounded-sm space-y-3 font-mono shadow-inner"
                >
                  <input
                    type="text"
                    placeholder="Observation Title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-sm focus:outline-none focus:border-[#570B12]"
                    required
                  />
                  <textarea
                    placeholder="Enter investigative deductions, witness inconsistencies, or working theories..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-sm focus:outline-none focus:border-[#570B12]"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#570B12] hover:bg-[#9D101D] text-white text-xs uppercase font-bold tracking-wider rounded-sm cursor-pointer"
                    >
                      Record in Journal
                    </button>
                  </div>
                </form>
              )}

              {filteredNotes.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                  NO ENTRIES RECORDED UNDER THIS CATEGORY YET.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-white/60 border border-neutral-400 rounded-sm shadow-sm relative"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-300 pb-1.5 mb-2">
                        <span className="font-serif font-black text-xs uppercase text-[#570B12]">
                          {note.title}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-500">
                          {note.timestamp}
                        </span>
                      </div>
                      <p className="font-serif text-xs leading-relaxed text-neutral-800">
                        {note.text}
                      </p>
                      {note.isVerified && (
                        <div className="mt-2 text-[8px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
                          ✓ FORENSICALLY VERIFIED
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 5: 3-TIERED HINT SYSTEM */
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="text-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#9D101D] font-bold">
                  PRECINCT CHIEF CONSULTATION // 3-TIER INQUIRY
                </span>
                <h3 className="text-xl font-serif font-black uppercase text-[#1A1817] mt-1">
                  Confidential Investigative Guidance
                </h3>
                <p className="font-serif text-xs text-neutral-700 mt-1 max-w-lg mx-auto">
                  Select a tier of guidance. Early tiers provide atmospheric location nudges; higher tiers illuminate critical forensic contradictions.
                </p>
              </div>

              {/* 3 Tier Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleRequestHint(1)}
                  className={`p-4 border rounded-sm text-left transition-all cursor-pointer ${
                    hintTier === 1
                      ? "bg-[#570B12] text-white border-[#2A1808] shadow-md"
                      : "bg-white/70 hover:bg-white border-neutral-400 text-neutral-900"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    TIER 1
                  </span>
                  <span className="font-serif font-black text-sm block mt-1">
                    Sector Nudge
                  </span>
                  <p className="font-serif text-[10px] mt-1 opacity-80">
                    Gentle direction toward unexplored crime scene sectors.
                  </p>
                </button>

                <button
                  onClick={() => handleRequestHint(2)}
                  className={`p-4 border rounded-sm text-left transition-all cursor-pointer ${
                    hintTier === 2
                      ? "bg-[#570B12] text-white border-[#2A1808] shadow-md"
                      : "bg-white/70 hover:bg-white border-neutral-400 text-neutral-900"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    TIER 2
                  </span>
                  <span className="font-serif font-black text-sm block mt-1">
                    Contradiction Lead
                  </span>
                  <p className="font-serif text-[10px] mt-1 opacity-80">
                    Specific focus on suspect alibis and timing anomalies.
                  </p>
                </button>

                <button
                  onClick={() => handleRequestHint(3)}
                  className={`p-4 border rounded-sm text-left transition-all cursor-pointer ${
                    hintTier === 3
                      ? "bg-[#570B12] text-white border-[#2A1808] shadow-md"
                      : "bg-white/70 hover:bg-white border-neutral-400 text-neutral-900"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    TIER 3
                  </span>
                  <span className="font-serif font-black text-sm block mt-1">
                    Decisive Insight
                  </span>
                  <p className="font-serif text-[10px] mt-1 opacity-80">
                    Direct forensic insight on the decisive smoking gun.
                  </p>
                </button>
              </div>

              {/* Active Hint Output */}
              {activeHintText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-[#1A1817] text-[#EDE8D5] rounded-sm border-2 border-[#570B12] shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-2 font-mono text-[9px] uppercase tracking-widest text-[#D21F2B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D21F2B]" />
                    <span>PRECINCT DISPATCH TELETYPE (TIER {hintTier}):</span>
                  </div>
                  <p className="font-serif text-sm leading-relaxed italic">
                    "{activeHintText}"
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Notebook Footer */}
        <div className="bg-[#D9D1BE] px-6 py-2.5 border-t border-[#2A1808]/40 flex items-center justify-between text-[10px] font-mono text-neutral-700">
          <span>CASE #{currentCase.caseNumber} // VERITAS MORTIS ARCHIVE</span>
          <span>AUTOSAVED TO DETECTIVE LOGBOOK</span>
        </div>
      </motion.div>
    </div>
  );
}
