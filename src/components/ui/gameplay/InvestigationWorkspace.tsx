"use client";

import React, { useEffect, useState } from "react";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import EvidenceBoard from "./EvidenceBoard";
import InterrogationConduit from "./InterrogationConduit";
import CaseProgressionDock from "./CaseProgressionDock";
import AccusationModal from "./AccusationModal";
import InvestigationDialogueGuide from "./InvestigationDialogueGuide";
import ActReversalCinematic from "../ActReversalCinematic";
import SettingsModal from "../SettingsModal";

interface InvestigationWorkspaceProps {
  onBackToMenu?: () => void;
}

export default function InvestigationWorkspace({ onBackToMenu }: InvestigationWorkspaceProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const isLoading = useCaseStore((s) => s.isLoading);
  const currentAct = useCaseStore((s) => s.currentAct);
  const generateNewCase = useCaseStore((s) => s.generateNewCase);
  const settings = useCaseStore((s) => s.settings);
  const updateSettings = useCaseStore((s) => s.updateSettings);

  const [isAccusationOpen, setIsAccusationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!currentCase && !isLoading) {
      generateNewCase();
    }
  }, [currentCase, isLoading, generateNewCase]);

  if (!currentCase) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden select-none">
        <div className="text-center z-20">
          <div className="font-mono text-[#D4C5A9]/70 uppercase tracking-[0.3em] text-sm animate-pulse">
            ASSEMBLING CRIME SCENE DOSSIER...
          </div>
          <div className="mt-4 w-40 h-1 bg-[#1A1714] mx-auto overflow-hidden rounded-full">
            <div className="h-full bg-[#8B0000] animate-[pulse_1.2s_ease-in-out_infinite] w-2/5" />
          </div>
          <p className="font-mono text-[10px] text-neutral-600 mt-3 uppercase tracking-widest">
            DETERMINISTIC MULBERRY32 PRNG GRAPH
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#050505] overflow-hidden relative select-none">
      {/* ── 35mm Film Grain Overlay ── */}
      {settings.filmGrainEnabled && (
        <div className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay opacity-[0.16]">
          <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
            <filter id="workspace-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#workspace-grain)" />
          </svg>
        </div>
      )}

      {/* ── Chiaroscuro Atmospheric Vignette ── */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.95)",
        }}
      />

      {/* Harsh Overhead Interrogation Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(212, 197, 169, 0.08) 0%, rgba(5, 5, 8, 0.96) 80%)",
        }}
      />

      {/* ── TOP BAR CONTROLS HUD ── */}
      <header className="relative z-40 w-full px-4 py-2.5 bg-[#121010]/95 border-b border-[#2A201A] flex items-center justify-between text-xs font-mono text-[#D4C5A9]/80 backdrop-blur-sm">
        {/* Left: Precinct Nav */}
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={() => {
                forensicAudio.playFolderOpen();
                onBackToMenu();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1714] border border-[#3B2A1E] hover:border-zinc-500 text-[10px] text-neutral-300 hover:text-white rounded-sm transition-all uppercase tracking-wider cursor-pointer"
            >
              <span>←</span>
              <span>Precinct Office</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
            <span className="uppercase font-bold text-[#E8E3D9]">
              {currentCase.title}
            </span>
          </div>
        </div>

        {/* Right: Audio, Settings & Indictment Button */}
        <div className="flex items-center gap-3">
          {/* Quick Mute Toggle */}
          <button
            onClick={() => {
              updateSettings({ isMuted: !settings.isMuted });
            }}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={settings.isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {settings.isMuted ? (
              <span className="text-[11px] text-red-500 font-bold">[MUTED]</span>
            ) : (
              <span className="text-[11px] text-neutral-300">[AUDIO ON]</span>
            )}
          </button>

          {/* Config Settings */}
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              setIsSettingsOpen(true);
            }}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Investigator Settings"
          >
            [CONFIG]
          </button>

          {/* File Indictment Button */}
          <button
            onClick={() => {
              forensicAudio.playStampSlam();
              setIsAccusationOpen(true);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 font-bold uppercase tracking-widest text-[11px] rounded-sm transition-all cursor-pointer shadow-md ${
              currentAct === "act3_climax"
                ? "bg-[#8B0000] hover:bg-red-800 text-white border border-red-600 shadow-[0_0_20px_rgba(180,0,0,0.6)] animate-pulse"
                : "bg-[#1C1510] hover:bg-[#2A1E16] text-[#D4C5A9] border border-[#5C4A38]"
            }`}
          >
            <span>⚖️</span>
            <span>FILE INDICTMENT</span>
          </button>
        </div>
      </header>

      {/* ── TWO-ZONE SPLIT WORKSPACE ── */}
      <div className="flex-1 flex flex-col md:flex-row w-full relative z-10 min-h-0 overflow-hidden">
        {/* ZONE 1: Evidence Board (Left 46%) */}
        <div className="w-full md:w-[48%] h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-zinc-800">
          <EvidenceBoard />
        </div>

        {/* ZONE 2: Interrogation Conduit / Suspect Psychology (Right 54%) */}
        <div className="w-full md:w-[52%] h-1/2 md:h-full relative">
          <InterrogationConduit />
        </div>
      </div>

      {/* ── ZONE 3: Bottom Case Progression Dock ── */}
      <div className="h-28 w-full relative z-20 flex-shrink-0">
        <CaseProgressionDock />
      </div>

      {/* ── DIEGETIC DETECTIVE ONBOARDING HUD & TYPEWRITER SUBTITLES ── */}
      <InvestigationDialogueGuide />

      {/* ── ACT II REVERSAL CINEMATIC MODAL ── */}
      <ActReversalCinematic />

      {/* ── ACCUSATION / VERDICT MODAL ── */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
        onReturnToMenu={onBackToMenu}
      />

      {/* ── SETTINGS MODAL ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
