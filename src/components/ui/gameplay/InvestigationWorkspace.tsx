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
import LocationInvestigationView from "./LocationInvestigationView";
import InvestigationNotebookModal from "./InvestigationNotebookModal";

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
  const workspaceMode = useCaseStore((s) => s.workspaceMode);
  const setWorkspaceMode = useCaseStore((s) => s.setWorkspaceMode);
  const isNotebookOpen = useCaseStore((s) => s.isNotebookOpen);
  const setNotebookOpen = useCaseStore((s) => s.setNotebookOpen);

  const [isAccusationOpen, setIsAccusationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"scene" | "board" | "interrogation" | "split">("scene");

  useEffect(() => {
    if (!currentCase && !isLoading) {
      generateNewCase();
    }
  }, [currentCase, isLoading, generateNewCase]);

  // Sync store workspaceMode with local viewMode if updated from child
  useEffect(() => {
    if (workspaceMode === "location_investigation") setViewMode("scene");
    else if (workspaceMode === "evidence_board") setViewMode("board");
    else if (workspaceMode === "interrogation") setViewMode("interrogation");
  }, [workspaceMode]);

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
      <header className="relative z-40 w-full px-4 py-2.5 bg-[#151313]/95 border-b border-[#570B12] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#C3B69C] backdrop-blur-sm">
        {/* Left: Precinct Nav & View Mode Switcher */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {onBackToMenu && (
            <button
              onClick={() => {
                forensicAudio.playFolderOpen();
                onBackToMenu();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1512] border border-[#570B12] hover:border-[#D21F2B] text-[10px] text-neutral-300 hover:text-white rounded-sm transition-all uppercase tracking-wider cursor-pointer shadow"
            >
              <span>←</span>
              <span>Precinct Office</span>
            </button>
          )}

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-[#090909] p-1 rounded-sm border border-zinc-800">
            <button
              onClick={() => {
                forensicAudio.playPaperSlide();
                setViewMode("scene");
                setWorkspaceMode("location_investigation");
              }}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === "scene"
                  ? "bg-[#570B12] text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Living Scene</span>
            </button>

            <button
              onClick={() => {
                forensicAudio.playPaperSlide();
                setViewMode("board");
                setWorkspaceMode("evidence_board");
              }}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === "board"
                  ? "bg-[#570B12] text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>📌</span>
              <span className="hidden sm:inline">Evidence Board</span>
            </button>

            <button
              onClick={() => {
                forensicAudio.playTapeBeep();
                setViewMode("interrogation");
                setWorkspaceMode("interrogation");
              }}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === "interrogation"
                  ? "bg-[#570B12] text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>🎙️</span>
              <span className="hidden sm:inline">Interrogation</span>
            </button>

            <button
              onClick={() => {
                forensicAudio.playFolderOpen();
                setViewMode("split");
              }}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === "split"
                  ? "bg-[#570B12] text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>⚡</span>
              <span className="hidden md:inline">Split Console</span>
            </button>
          </div>
        </div>

        {/* Right: Journal, Audio, Settings & Indictment Button */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Detective Journal & Hints Button */}
          <button
            onClick={() => {
              setNotebookOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1512] hover:bg-[#2A1E18] border border-[#C3B69C]/40 text-[#C3B69C] hover:text-white text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all cursor-pointer shadow"
          >
            <span>📖</span>
            <span className="hidden sm:inline">Detective Journal & Hints</span>
          </button>

          {/* Quick Mute Toggle */}
          <button
            onClick={() => {
              updateSettings({ isMuted: !settings.isMuted });
            }}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[10px]"
            title={settings.isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {settings.isMuted ? (
              <span className="text-[#D21F2B] font-bold">[MUTED]</span>
            ) : (
              <span className="text-neutral-400">[AUDIO]</span>
            )}
          </button>

          {/* Config Settings */}
          <button
            onClick={() => {
              forensicAudio.playPhotoInspect();
              setIsSettingsOpen(true);
            }}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[10px]"
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-sm transition-all cursor-pointer shadow-md ${
              currentAct === "act3_climax"
                ? "bg-[#D21F2B] hover:bg-red-700 text-white border border-red-500 shadow-[0_0_20px_rgba(210,31,43,0.7)] animate-pulse"
                : "bg-[#570B12] hover:bg-[#9D101D] text-[#E8E3D9] border border-[#9D101D]"
            }`}
          >
            <span>⚖️</span>
            <span>FILE INDICTMENT</span>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE VIEWPORT ── */}
      <div className="flex-1 w-full relative z-10 min-h-0 overflow-hidden">
        {viewMode === "scene" && (
          <LocationInvestigationView
            onOpenInterrogation={() => setViewMode("interrogation")}
            onOpenBoard={() => setViewMode("board")}
          />
        )}

        {viewMode === "board" && (
          <div className="w-full h-full relative">
            <EvidenceBoard />
          </div>
        )}

        {viewMode === "interrogation" && (
          <div className="w-full h-full relative">
            <InterrogationConduit />
          </div>
        )}

        {viewMode === "split" && (
          <div className="w-full h-full flex flex-col md:flex-row relative">
            <div className="w-full md:w-[48%] h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-zinc-800">
              <EvidenceBoard />
            </div>
            <div className="w-full md:w-[52%] h-1/2 md:h-full relative">
              <InterrogationConduit />
            </div>
          </div>
        )}
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

      {/* ── INVESTIGATION JOURNAL & HINTS MODAL ── */}
      <InvestigationNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setNotebookOpen(false)}
      />
    </div>
  );
}
