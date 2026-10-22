"use client";

import React, { useState, useEffect } from "react";
import CinematicLandingPage from "@/components/ui/CinematicLandingPage";
import MainMenu from "@/components/ui/MainMenu";
import CaseBriefingCinematic from "@/components/ui/CaseBriefingCinematic";
import InvestigationWorkspace from "@/components/ui/gameplay/InvestigationWorkspace";
import CaseArchiveModal from "@/components/ui/CaseArchiveModal";
import SettingsModal from "@/components/ui/SettingsModal";
import CreditsModal from "@/components/ui/CreditsModal";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

type ScreenStage = "landing" | "menu" | "briefing" | "workspace";

export default function Home() {
  const [stage, setStage] = useState<ScreenStage>("landing");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const generateNewCase = useCaseStore((s) => s.generateNewCase);
  const resumeSavedCase = useCaseStore((s) => s.resumeSavedCase);
  const hasActiveSave = useCaseStore((s) => s.hasActiveSave);
  const settings = useCaseStore((s) => s.settings);

  // Initialize audio parameters on mount
  useEffect(() => {
    forensicAudio.setMasterVolume(settings.masterVolume);
    forensicAudio.setMuted(settings.isMuted);
  }, [settings]);

  const handleStartNewGame = async (seed?: number) => {
    await generateNewCase(seed);
    setStage("briefing");
  };

  const handleResumeGame = () => {
    const success = resumeSavedCase();
    if (success) {
      setStage("workspace");
    } else {
      handleStartNewGame();
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#E8E3D9] overflow-hidden relative">
      {/* ── SCREEN 1: CINEMATIC FILM TITLE SEQUENCE ── */}
      {stage === "landing" && (
        <CinematicLandingPage
          onBegin={() => setStage("menu")}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* ── SCREEN 2: PRECINCT DETECTIVE OFFICE MAIN MENU ── */}
      {stage === "menu" && (
        <MainMenu
          onNewGame={() => handleStartNewGame()}
          onResumeGame={handleResumeGame}
          onOpenArchive={() => setIsArchiveOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCredits={() => setIsCreditsOpen(true)}
          onBackToTitle={() => setStage("landing")}
        />
      )}

      {/* ── SCREEN 3: ACT I HOOK PROLOGUE / CASE BRIEFING ── */}
      {stage === "briefing" && (
        <CaseBriefingCinematic
          onEnterWorkspace={() => setStage("workspace")}
          onSkip={() => setStage("workspace")}
        />
      )}

      {/* ── SCREEN 4: INTERACTIVE INVESTIGATION WORKSPACE ── */}
      {stage === "workspace" && (
        <InvestigationWorkspace onBackToMenu={() => setStage("menu")} />
      )}

      {/* ── GLOBAL MODALS ── */}
      <CaseArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onReplaySeed={(seed) => handleStartNewGame(seed)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </main>
  );
}
