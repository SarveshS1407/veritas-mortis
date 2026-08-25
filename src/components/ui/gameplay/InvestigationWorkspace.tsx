"use client";

import React, { useEffect, useState } from "react";
import { useCaseStore } from "@/lib/useCaseStore";
import EvidenceBoard from "./EvidenceBoard";
import InterrogationConduit from "./InterrogationConduit";
import CaseProgressionDock from "./CaseProgressionDock";
import AccusationModal from "./AccusationModal";
import InvestigationDialogueGuide from "./InvestigationDialogueGuide";

interface InvestigationWorkspaceProps {
  onBackToMenu?: () => void;
}

export default function InvestigationWorkspace({ onBackToMenu }: InvestigationWorkspaceProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const isLoading = useCaseStore((s) => s.isLoading);
  const currentAct = useCaseStore((s) => s.currentAct);
  const generateNewCase = useCaseStore((s) => s.generateNewCase);

  const [isAccusationOpen, setIsAccusationOpen] = useState(false);

  useEffect(() => {
    if (!currentCase && !isLoading) {
      generateNewCase();
    }
  }, [currentCase, isLoading, generateNewCase]);

  if (!currentCase) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-pitch relative overflow-hidden">
        {/* Film grain on loading screen */}
        <div className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay opacity-15">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <filter id="loading-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#loading-noise)" />
          </svg>
        </div>
        <div className="text-center z-20">
          <div className="font-mono text-zinc-500 uppercase tracking-[0.3em] text-sm animate-pulse">
            Loading Case File...
          </div>
          <div className="mt-3 w-32 h-0.5 bg-zinc-800 mx-auto overflow-hidden rounded-full">
            <div className="h-full bg-crimson animate-[pulse_1.5s_ease-in-out_infinite] w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-pitch overflow-hidden relative selection:bg-blood/40 selection:text-bone">

      {/* ── ATMOSPHERIC OVERLAYS ── */}

      {/* 35mm Film Grain */}
      <div className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay opacity-[0.18]">
        <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
          <filter id="workspace-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#workspace-grain)" />
        </svg>
      </div>

      {/* Heavy Peripheral Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{ boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.95)" }}
      />

      {/* Harsh Overhead Interrogation Lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(200, 190, 160, 0.12) 0%, rgba(5, 5, 8, 0.96) 75%)",
        }}
      />

      {/* Fluorescent Flicker */}
      <div
        className="pointer-events-none absolute inset-0 bg-white/[0.015] mix-blend-screen z-30"
        style={{ animation: "light-flicker 10s infinite" }}
      />

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 z-30" />

      {/* ── TOP BAR CONTROLS ── */}

      {/* Back to Menu */}
      {onBackToMenu && (
        <button
          onClick={onBackToMenu}
          className="absolute top-4 left-4 z-[60] flex items-center gap-2 p-2 px-3 bg-charcoal/80 border border-zinc-700/50 backdrop-blur-sm text-[10px] font-mono text-zinc-400 hover:text-bone hover:border-zinc-500 transition-all uppercase tracking-widest rounded-sm"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Abort Case
        </button>
      )}

      {/* File Indictment Button (Act 3 only) */}
      {currentAct === "act3_climax" && (
        <button
          onClick={() => setIsAccusationOpen(true)}
          className="absolute top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 bg-blood/90 border border-red-900 backdrop-blur-sm text-[11px] font-mono font-bold text-bone hover:bg-red-900 transition-all uppercase tracking-widest shadow-[0_0_25px_rgba(153,27,27,0.5)] rounded-sm group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:-rotate-12 transition-transform">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          File Indictment
        </button>
      )}

      {/* ── THREE-ZONE WORKSPACE ── */}

      {/* Main Content: Evidence Board (Left 42%) + Interrogation Conduit (Right 58%) */}
      <div className="flex-1 flex w-full relative z-10 min-h-0">
        {/* ZONE 1: Evidence Board */}
        <div className="w-[42%] h-full relative">
          <EvidenceBoard />
        </div>

        {/* ZONE 2: Interrogation Conduit / Document Inspection */}
        <div className="w-[58%] h-full relative">
          <InterrogationConduit />
        </div>
      </div>

      {/* ZONE 3: Case Progression Dock */}
      <div className="h-28 w-full relative z-20 flex-shrink-0">
        <CaseProgressionDock />
      </div>

      {/* ── DIEGETIC DETECTIVE ONBOARDING HUD & SUBTITLE GUIDE ── */}
      <InvestigationDialogueGuide />

      {/* ── ACCUSATION MODAL ── */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
      />
    </div>
  );
}
