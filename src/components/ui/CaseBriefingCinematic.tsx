"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";

interface CaseBriefingCinematicProps {
  onEnterWorkspace: () => void;
  onSkip?: () => void;
}

export default function CaseBriefingCinematic({
  onEnterWorkspace,
  onSkip,
}: CaseBriefingCinematicProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const settings = useCaseStore((s) => s.settings);

  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      title: "OFFICIAL DISPATCH MEMORANDUM",
      subtitle: `CASE #${currentCase?.caseNumber || "VM-104820"}`,
      body: `Homicide Division received priority telephonic notification at 23:45 EST. The body of ${
        currentCase?.victim.name || "the victim"
      } (${currentCase?.victim.age || 50}, ${
        currentCase?.victim.occupation || "citizen"
      }) was discovered inside ${
        currentCase?.crimeSceneLocation || "the crime scene"
      }. Preliminary investigation establishes unnatural foul play.`,
      stamp: "INCIDENT REPORT",
      actionLabel: "PROCEED TO VICTIM SUMMARY [SPACE]",
    },
    {
      title: "PRELIMINARY POST-MORTEM PROFILE",
      subtitle: "OFFICE OF THE CHIEF MEDICAL EXAMINER",
      body: `PATHOLOGY FINDINGS:\n• Cause of Death: ${
        currentCase?.victim.causeOfDeath || "Severe Trauma"
      }\n• Primary Trauma: ${
        currentCase?.victim.autopsyDetails?.primaryInjury || "Unspecified trauma"
      }\n• Estimated Fatal Strike: ${
        currentCase?.victim.timeOfDeath || "22:45 EST"
      }\n• Blood Group: ${
        currentCase?.victim.bloodType || "O+"
      }\n\nLividity indicators suggest the victim remained undisturbed post-mortem.`,
      stamp: "CORONER VERIFIED",
      actionLabel: "INSPECT SUSPECT MATRIX [SPACE]",
    },
    {
      title: "INITIAL SUSPECTS & LEAD MOTIVES",
      subtitle: "ACT I · THE HOOK & CIRCUMSTANTIAL FRAME",
      body: `Three persons of interest have been detained for interrogation at the precinct. Initial circumstantial evidence and staged timestamps point direct suspicion toward ${
        currentCase?.suspects[1]?.name || "the prime suspect"
      }.\n\nHowever, in cases of this caliber, the obvious suspect is frequently a deliberate decoy. Interrogate all parties, deploy 365nm UV forensic tools, and construct an airtight evidence board.`,
      stamp: "ACTIVE DIRECTIVE",
      actionLabel: "INSPECT FORENSIC VERACITY MATRIX [SPACE]",
    },
    {
      title: "ESTABLISHED FACTS VS UNVERIFIED PARADOXES",
      subtitle: "CONFIDENTIAL PROSECUTION BRIEF // CLASSIFIED",
      body: `ESTABLISHED FORENSIC FACTS:\n• Decedent: ${
        currentCase?.victim.name || "Arthur Blackwood"
      } (${currentCase?.victim.age || 50}, ${
        currentCase?.victim.occupation || "Citizen"
      })\n• Discovery Scene: ${
        currentCase?.crimeSceneLocation || "Designated Crime Scene"
      }\n• Cause of Death: ${
        currentCase?.victim.causeOfDeath || "Severe Trauma"
      }\n• Assigned Detective: Lead Inquisitor (Badge #7401)\n\nUNVERIFIED CIRCUMSTANCES & OPEN PARADOXES:\n• Conflicting departure timestamps between witness statements and coroner lividity.\n• Suspect alibis remain uncorroborated by physical records.\n• Potential inside conspiracy indicated by switchboard intercept logs.\n\nAll detectives must independently authenticate evidence before filing grand jury indictments.`,
      stamp: "CASE FILE OPEN",
      actionLabel: "BREAK SEAL & ENTER LIVING CRIME SCENE [SPACE]",
    },
  ];

  const currentStepData = steps[step] || steps[0];

  // Monospace typewriter effect
  useEffect(() => {
    setTypedText("");
    const fullText = currentStepData.body;
    let index = 0;

    if (settings.textSpeed === "instant") {
      setTypedText(fullText);
      forensicAudio.playRadioChime();
      return;
    }

    const intervalMs = settings.textSpeed === "slow" ? 35 : 18;

    typingTimer.current = setInterval(() => {
      index++;
      setTypedText(fullText.slice(0, index));
      if (index % 3 === 0) {
        forensicAudio.playTypewriterKey();
      }
      if (index >= fullText.length) {
        if (typingTimer.current) clearInterval(typingTimer.current);
        forensicAudio.playRadioChime();
      }
    }, intervalMs);

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [step, currentStepData.body, settings.textSpeed]);

  // Keyboard Space / Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "Escape") {
        if (onSkip) onSkip();
        else onEnterWorkspace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const handleNext = () => {
    forensicAudio.playPaperSlide();
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      forensicAudio.playFolderOpen();
      onEnterWorkspace();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] text-[#E8E3D9] overflow-hidden select-none flex flex-col justify-between p-6 md:p-12">
      {/* ── 35mm Film Grain Overlay ── */}
      {settings.filmGrainEnabled && (
        <div className="pointer-events-none absolute inset-0 z-40 opacity-[0.2] mix-blend-overlay">
          <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
            <filter id="briefing-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#briefing-grain)" />
          </svg>
        </div>
      )}

      {/* ── Background Vignette & Chiaroscuro ── */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center filter contrast-125 brightness-25 saturate-50"
          style={{ backgroundImage: "url('/crimescene.jpg')" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(212, 197, 169, 0.08) 0%, rgba(5, 5, 5, 0.96) 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.98)" }}
        />
      </div>

      {/* ── Top Header ── */}
      <header className="relative z-30 flex items-center justify-between text-xs font-mono text-[#D4C5A9]/70 border-b border-[#3B2A1E] pb-3">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse" />
          <span className="uppercase text-[10px] md:text-xs tracking-widest text-[#E8E3D9]">
            INITIAL CASE BRIEFING · {currentCase?.title || "CASE DOSSIER"}
          </span>
        </div>

        <button
          onClick={() => {
            forensicAudio.playFolderOpen();
            if (onSkip) onSkip();
            else onEnterWorkspace();
          }}
          className="text-[#D4C5A9]/60 hover:text-[#E8E3D9] uppercase text-[10px] md:text-xs font-bold tracking-widest transition-colors cursor-pointer"
        >
          [ SKIP PROLOGUE (ESC) → ]
        </button>
      </header>

      {/* ── Central Dossier Presentation Box ── */}
      <main className="relative z-30 flex-1 flex items-center justify-center py-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-[#EDE8D5] text-[#1A1817] p-8 md:p-10 rounded-sm shadow-[0_25px_80px_rgba(0,0,0,0.95)] border-4 border-[#2A1808] relative"
        >
          {/* Crimson Stamp */}
          <div className="absolute top-6 right-6 border-2 border-[#8B0000] text-[#8B0000] font-mono text-[10px] font-black px-3 py-1 uppercase tracking-widest -rotate-3">
            {currentStepData.stamp}
          </div>

          {/* Dossier Header */}
          <div className="border-b-2 border-[#1A1817] pb-4 mb-6">
            <span className="font-mono text-[10px] font-black tracking-widest text-[#6B0000] uppercase">
              {currentStepData.subtitle}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-wide text-[#1A1817] mt-1">
              {currentStepData.title}
            </h2>
          </div>

          {/* Typewritten Body */}
          <div className="font-mono text-xs md:text-sm text-neutral-800 leading-relaxed min-h-[160px] whitespace-pre-wrap font-medium">
            {typedText}
          </div>

          {/* Progress Indicators & Action Button */}
          <div className="mt-8 pt-4 border-t border-[#1A1817]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-1 rounded-full transition-all ${
                    i === step ? "bg-[#8B0000] w-6" : "bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              onMouseEnter={() => forensicAudio.playPenFriction()}
              className="px-6 py-2.5 bg-[#1A1817] hover:bg-[#8B0000] text-[#EDE8D5] font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer shadow-md flex items-center gap-2"
            >
              <span>{currentStepData.actionLabel}</span>
              <span>→</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-30 flex items-center justify-between text-[10px] font-mono text-[#D4C5A9]/40 border-t border-[#1A1714] pt-3">
        <span>PRESS [SPACE] OR CLICK BUTTON TO ADVANCE</span>
        <span>STEP {step + 1} OF {steps.length}</span>
      </footer>
    </div>
  );
}
