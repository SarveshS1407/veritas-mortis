"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

interface MainMenuProps {
  onNewGame: () => void;
  onResumeGame: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onBackToTitle?: () => void;
}

export default function MainMenu({
  onNewGame,
  onResumeGame,
  onOpenArchive,
  onOpenSettings,
  onOpenCredits,
  onBackToTitle,
}: MainMenuProps) {
  const hasActiveSave = useCaseStore((s) => s.hasActiveSave);
  const activeCaseInfo = useCaseStore((s) => s.activeCaseInfo);
  const settings = useCaseStore((s) => s.settings);

  const [canResume, setCanResume] = useState(false);
  const [saveInfo, setSaveInfo] = useState<{
    caseNumber: string;
    title: string;
    victimName: string;
    currentAct: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const active = hasActiveSave();
    setCanResume(active);
    if (active) {
      setSaveInfo(activeCaseInfo());
    }
  }, [hasActiveSave, activeCaseInfo]);

  const handleAction = (action: () => void, soundType: "folder" | "snap" | "thud" = "folder") => {
    if (soundType === "folder") forensicAudio.playFolderOpen();
    else if (soundType === "snap") forensicAudio.playAdhesiveSnap();
    else forensicAudio.playPhotoInspect();
    action();
  };

  const formatActName = (actKey: string) => {
    switch (actKey) {
      case "act1_hook":
        return "ACT I · THE HOOK";
      case "act2_reversal":
        return "ACT II · THE REVERSAL";
      case "act3_climax":
        return "ACT III · THE RECKONING";
      default:
        return "IN PROGRESS";
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] text-[#E8E3D9] overflow-hidden select-none flex flex-col justify-between">
      {/* ── 35mm Film Grain Overlay ── */}
      {settings.filmGrainEnabled && (
        <div className="pointer-events-none absolute inset-0 z-40 opacity-[0.18] mix-blend-overlay">
          <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
            <filter id="menu-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#menu-grain)" />
          </svg>
        </div>
      )}

      {/* ── Deep Precinct Background & Lighting ── */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center filter contrast-125 brightness-30 saturate-60"
          style={{ backgroundImage: "url('/detective-desk.jpg')" }}
        />
        {/* Soft radial chiaroscuro */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 45%, rgba(212, 197, 169, 0.08) 0%, rgba(10, 8, 8, 0.92) 65%, #050505 100%)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.96)" }}
        />
      </div>

      {/* ── Top Header / Dossier Badge ── */}
      <header className="relative z-30 w-full px-6 md:px-12 pt-8 flex items-center justify-between text-xs font-mono text-[#D4C5A9]/70 border-b border-[#1A1714]/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBackToTitle) {
                forensicAudio.playPhotoInspect();
                onBackToTitle();
              }
            }}
            className="flex items-center gap-2 hover:text-[#E8E3D9] transition-colors"
          >
            <span className="text-[#8B0000]">←</span>
            <span className="uppercase text-[10px] md:text-xs tracking-wider">
              TITLE SEQUENCE
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-[10px] md:text-xs">
          <span className="bg-[#1A1714] px-2.5 py-1 border border-[#3B2A1E] text-[#D4C5A9] rounded-sm">
            PRECINCT NO. 74 · CHIEF OF DETECTIVES
          </span>
        </div>
      </header>

      {/* ── Main Menu Workspace ── */}
      <main className="relative z-30 flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 py-8 max-w-7xl mx-auto w-full gap-10">
        {/* LEFT COLUMN: Title & Navigation Actions */}
        <div className="flex flex-col items-start w-full md:w-1/2">
          {/* Wordmark & Thematic Subtitle */}
          <div className="mb-8 md:mb-10 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#D21F2B] font-bold">
                PRECINCT HOMICIDE ARCHIVE // TOP SECRET
              </span>
              <span className="text-[10px] text-zinc-600">·</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#74777C] animate-pulse">
                CASE #{saveInfo?.caseNumber || "VM-CLASSIFIED"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-wider uppercase text-[#E8E3D9] mt-1 drop-shadow-md">
              VERITAS
              <br />
              MORTIS
            </h1>

            <p className="font-serif italic text-sm md:text-base text-[#C3B69C] mt-2 tracking-wide">
              Every truth leaves a body.
            </p>

            <div className="h-0.5 w-28 bg-[#9D101D] mt-3" />
          </div>

          {/* Menu Action List */}
          <nav className="flex flex-col space-y-3 w-full max-w-md">
            {/* 1. NEW INVESTIGATION */}
            <button
              onClick={() => handleAction(onNewGame, "folder")}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="group relative flex items-center justify-between px-6 py-4 bg-[#151313]/95 hover:bg-[#1E1917] border border-[#570B12] hover:border-[#D21F2B] text-left transition-all duration-200 shadow-xl rounded-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#D21F2B] group-hover:scale-125 transition-transform" />
                <div>
                  <span className="font-mono text-sm tracking-[0.2em] uppercase font-bold text-[#C3B69C] group-hover:text-white transition-colors">
                    NEW INVESTIGATION
                  </span>
                  <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    Generate fresh crime scene, alibis & forensic graph
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#D21F2B] group-hover:translate-x-1.5 transition-transform">
                →
              </span>
            </button>

            {/* 2. CONTINUE CASE */}
            <button
              onClick={() => {
                if (canResume) {
                  handleAction(onResumeGame, "snap");
                }
              }}
              disabled={!canResume}
              onMouseEnter={() => {
                if (canResume) forensicAudio.playPenFriction();
              }}
              className={`group relative flex items-center justify-between px-6 py-4 border text-left transition-all duration-200 rounded-sm ${
                canResume
                  ? "bg-[#151313]/95 hover:bg-[#1E1917] border-[#74777C] hover:border-[#C3B69C] cursor-pointer shadow-xl"
                  : "bg-[#090909]/60 border-zinc-900 opacity-45 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    canResume ? "bg-[#75866A]" : "bg-neutral-700"
                  }`}
                />
                <div>
                  <span
                    className={`font-mono text-sm tracking-[0.2em] uppercase font-bold ${
                      canResume ? "text-[#E8E3D9]" : "text-neutral-500"
                    }`}
                  >
                    CONTINUE CASE
                  </span>
                  <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {canResume
                      ? "Resume saved investigation in progress"
                      : "No active case file in storage"}
                  </p>
                </div>
              </div>
              {canResume && (
                <span className="font-mono text-xs text-[#75866A] group-hover:translate-x-1.5 transition-transform">
                  →
                </span>
              )}
            </button>

            {/* 3. CASE ARCHIVE */}
            <button
              onClick={() => handleAction(onOpenArchive, "thud")}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="group relative flex items-center justify-between px-6 py-3.5 bg-[#121010]/80 hover:bg-[#1A1714] border border-[#2A2520] hover:border-[#5C4A38] text-left transition-all duration-200 rounded-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C4A38]" />
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-[#D4C5A9]/80 group-hover:text-[#E8E3D9]">
                  CASE ARCHIVE & RECORDS
                </span>
              </div>
              <span className="font-mono text-xs text-neutral-500 group-hover:text-[#D4C5A9]">
                [ LOG ]
              </span>
            </button>

            {/* 4. SETTINGS */}
            <button
              onClick={() => handleAction(onOpenSettings, "snap")}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="group relative flex items-center justify-between px-6 py-3.5 bg-[#121010]/80 hover:bg-[#1A1714] border border-[#2A2520] hover:border-[#5C4A38] text-left transition-all duration-200 rounded-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C4A38]" />
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-[#D4C5A9]/80 group-hover:text-[#E8E3D9]">
                  CONFIG & ACCESSIBILITY
                </span>
              </div>
              <span className="font-mono text-xs text-neutral-500 group-hover:text-[#D4C5A9]">
                [ SETUP ]
              </span>
            </button>

            {/* 5. CREDITS */}
            <button
              onClick={() => handleAction(onOpenCredits, "thud")}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="group relative flex items-center justify-between px-6 py-3.5 bg-[#121010]/80 hover:bg-[#1A1714] border border-[#2A2520] hover:border-[#5C4A38] text-left transition-all duration-200 rounded-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C4A38]" />
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-[#D4C5A9]/80 group-hover:text-[#E8E3D9]">
                  PRECINCT CREDITS
                </span>
              </div>
              <span className="font-mono text-xs text-neutral-500 group-hover:text-[#D4C5A9]">
                [ INFO ]
              </span>
            </button>
          </nav>
        </div>

        {/* RIGHT COLUMN: Active Case Dossier Card or Atmospheric Desk Prop */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          {canResume && saveInfo ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm bg-[#EDE8D5] text-[#1A1817] p-6 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-4 border-[#2A1808] relative transform rotate-1 hover:rotate-0 transition-transform duration-300"
            >
              {/* Paper Clip Graphic */}
              <div className="absolute -top-3 right-8 w-4 h-9 border-2 border-neutral-600 rounded-full pointer-events-none" />

              {/* Red Stamp */}
              <div className="absolute top-4 right-4 border-2 border-[#8B0000] text-[#8B0000] font-mono text-[9px] font-black px-2 py-0.5 uppercase tracking-widest -rotate-6">
                ACTIVE CASE
              </div>

              <div className="border-b-2 border-[#1A1817] pb-3 mb-4">
                <span className="font-mono text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                  CASE DOSSIER #{saveInfo.caseNumber}
                </span>
                <h3 className="font-serif text-xl font-bold uppercase tracking-tight text-[#1A1817] mt-1">
                  {saveInfo.title}
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                    Victim Profile:
                  </span>
                  <span className="font-bold text-neutral-900">
                    {saveInfo.victimName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                    Investigation Phase:
                  </span>
                  <span className="font-bold text-[#8B0000]">
                    {formatActName(saveInfo.currentAct)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1A1817]/20 flex justify-between items-center text-[10px] text-neutral-600">
                  <span>RECORDED: {saveInfo.date}</span>
                  <button
                    onClick={() => handleAction(onResumeGame, "snap")}
                    className="font-bold text-[#8B0000] hover:underline"
                  >
                    Resume Case →
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-sm bg-[#160F0B]/90 border-2 border-[#3B2A1E] p-6 rounded-sm text-left shadow-2xl relative">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8A6830] block mb-2 font-bold">
                PRECINCT DIRECTIVE · STANDING ORDERS
              </span>
              <h3 className="font-serif text-xl font-bold text-[#E8E3D9] uppercase tracking-wide mb-3">
                Lead Detective Protocol
              </h3>
              <p className="font-mono text-xs text-[#D4C5A9]/75 leading-relaxed mb-4">
                "Every homicide is a puzzle authored by panic or calculation.
                Examine the autopsy sheets, interrogate all suspects, and never
                file an indictment without verified forensic proof."
              </p>
              <div className="pt-3 border-t border-[#3B2A1E] flex items-center justify-between text-[10px] font-mono text-[#D4C5A9]/50">
                <span>NEW YORK HOMICIDE</span>
                <span>STATUS: READY</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-30 w-full px-6 md:px-12 pb-6 flex items-center justify-between text-[10px] font-mono text-[#D4C5A9]/40 border-t border-[#1A1714] pt-3">
        <span>VERITAS MORTIS DETECTIVE WORKSPACE</span>
        <span>M1 OPTIMIZED · REPLAYABLE CASE GENERATION</span>
      </footer>
    </div>
  );
}
