"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import { EvidenceNode, SuspectArchetype } from "@/types/caseEngine";

interface GuideStep {
  id: number;
  docketTag: string;
  speaker: string;
  text: string;
  actionHint: string;
}

export default function InvestigationDialogueGuide() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const currentAct = useCaseStore((s) => s.currentAct);
  const activeEvidenceId = useCaseStore((s) => s.activeEvidenceId);
  const activeSuspectId = useCaseStore((s) => s.activeSuspectId);
  const activeForensicTool = useCaseStore((s) => s.activeForensicTool);
  const redStrings = useCaseStore((s) => s.redStrings);
  const interrogationLog = useCaseStore((s) => s.interrogationLog);
  const hasCompletedIntroGuide = useCaseStore((s) => s.hasCompletedIntroGuide);
  const setHasCompletedIntroGuide = useCaseStore((s) => s.setHasCompletedIntroGuide);
  const isGuideOpen = useCaseStore((s) => s.isGuideOpen);
  const toggleGuide = useCaseStore((s) => s.toggleGuide);

  // 4 Strict Action-Gated Onboarding Steps with 1970s Noir Detective Voice
  const INTRO_STEPS: GuideStep[] = useMemo(
    () => [
      {
        id: 1,
        docketTag: "DISPATCH LOG #01",
        speaker: "LEAD INVESTIGATOR (FIELD MONOLOGUE)",
        text: "Another midnight call... The victim was found cold, but the crime scene tells a contradictory story. I need to review the initial autopsy and dispatch report first.",
        actionHint: "Press [ SPACE ] or Click 'ACKNOWLEDGE MEMO' to begin.",
      },
      {
        id: 2,
        docketTag: "CASE PROTOCOL #02",
        speaker: "CORONER & EVIDENCE DESK",
        text: "Click on any document, autopsy sheet, or Polaroid on the Evidence Board to examine the forensic details and spot timestamp discrepancies.",
        actionHint: "INSTRUCTION: CLICK ANY EVIDENCE CARD ON THE CORKBOARD TO INSPECT...",
      },
      {
        id: 3,
        docketTag: "DEDUCTION LEDGER #03",
        speaker: "CRIMINAL DEDUCTION DESK",
        text: "Review the suspect alibis. When a clue disproves a statement, drag a crimson thread from the pin to their card, or click a suspect to examine their profile.",
        actionHint: "INSTRUCTION: LINK A CLUE TO A SUSPECT OR CLICK A SUSPECT PROFILE...",
      },
      {
        id: 4,
        docketTag: "PRECINCT DISPATCH #04",
        speaker: "INTERROGATION & LAB SUITE",
        text: "Once armed with contradictory evidence, question the suspects in the Interrogation Conduit on the right, or equip a Forensic Tool below to break their composure.",
        actionHint: "INSTRUCTION: QUESTION A SUSPECT OR SELECT A FORENSIC TOOL...",
      },
    ],
    []
  );

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Baseline interaction tracking
  const initialEvidenceExaminedCount = useRef<number | null>(null);
  const initialRedStringsCount = useRef<number>(0);
  const initialInterrogationsCount = useRef<number>(0);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioPlayTime = useRef(0);

  // Dynamic Case Objective after onboarding completes
  const currentObjectiveText = useMemo(() => {
    if (!currentCase) return "Examine active crime scene dossiers on the desk.";

    const evidenceList: EvidenceNode[] = currentCase.evidenceNodes || currentCase.evidence || [];
    const examinedCount = evidenceList.filter((e) => e.status === "examined" || e.status === "analyzed").length;
    const suspects: SuspectArchetype[] = currentCase.suspects || [];
    const brokenSuspect = suspects.find((s) => s.composure === "BROKEN" || s.composureLevel === "BROKEN");

    if (currentAct === "act1_hook") {
      if (examinedCount < 2) {
        return "Examine the Autopsy Report and preliminary crime scene clues on the Evidence Board.";
      }
      const redHerring = suspects.find((s) => !s.isGuilty);
      return `Confront ${redHerring ? redHerring.name : "the prime suspect"} in the Interrogation room with discovered alibi contradictions.`;
    }

    if (currentAct === "act2_reversal") {
      if (!brokenSuspect) {
        return "Access the Forensic Tool Dock to review toxicology chromatography and intercept wiretapped audio transcripts.";
      }
      return "Cross-reference the financial blackmail ledger and advance the case to Act 3.";
    }

    if (currentAct === "act3_climax") {
      return "Equip the UV Blacklight tool to uncover latent prints, verify the murder weapon, and deliver the Grand Jury Indictment.";
    }

    return "Synthesize the forensic evidence matrix and indict the true culprit.";
  }, [currentCase, currentAct, interrogationLog]);

  // Target text
  const targetFullText = useMemo(() => {
    if (!hasCompletedIntroGuide && currentStepIndex < INTRO_STEPS.length) {
      return INTRO_STEPS[currentStepIndex].text;
    }
    return currentObjectiveText;
  }, [hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS, currentObjectiveText]);

  const caseIdString = useMemo(() => {
    if (!currentCase?.caseNumber) return "CASE #VM-512909";
    return currentCase.caseNumber.startsWith("#") ? `CASE ${currentCase.caseNumber}` : `CASE #${currentCase.caseNumber}`;
  }, [currentCase]);

  const targetSpeaker = useMemo(() => {
    if (!hasCompletedIntroGuide && currentStepIndex < INTRO_STEPS.length) {
      return INTRO_STEPS[currentStepIndex].speaker;
    }
    return `${caseIdString} — ACTIVE DIRECTIVE`;
  }, [hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS, caseIdString]);

  const targetDocketTag = useMemo(() => {
    if (!hasCompletedIntroGuide && currentStepIndex < INTRO_STEPS.length) {
      return INTRO_STEPS[currentStepIndex].docketTag;
    }
    return "HOMICIDE DIVISION";
  }, [hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS]);

  const currentActionHint = useMemo(() => {
    if (!hasCompletedIntroGuide && currentStepIndex < INTRO_STEPS.length) {
      return INTRO_STEPS[currentStepIndex].actionHint;
    }
    return "Directive active. Press [ ? OBJECTIVE ] to toggle ledger.";
  }, [hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS]);

  // Typewriter letter animation
  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setDisplayedText("");
    setIsTyping(true);
    let charIdx = 0;

    forensicAudio.playRadioChime();

    const typeNextLetter = () => {
      if (charIdx < targetFullText.length) {
        charIdx++;
        setDisplayedText(targetFullText.slice(0, charIdx));

        const now = Date.now();
        if (now - lastAudioPlayTime.current > 45 && targetFullText[charIdx - 1] !== " ") {
          forensicAudio.playTypewriterKey();
          lastAudioPlayTime.current = now;
        }

        const typingSpeed = targetFullText[charIdx - 1] === "." || targetFullText[charIdx - 1] === "," ? 55 : 18;
        typingTimeoutRef.current = setTimeout(typeNextLetter, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };

    typingTimeoutRef.current = setTimeout(typeNextLetter, 80);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [targetFullText, hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS]);

  // Step advancement
  const advanceStep = useCallback(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setDisplayedText(targetFullText);
      setIsTyping(false);
      return;
    }

    if (!hasCompletedIntroGuide) {
      if (currentStepIndex < INTRO_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setHasCompletedIntroGuide(true);
        setIsMinimized(true);
      }
    }
  }, [isTyping, targetFullText, hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS.length, setHasCompletedIntroGuide]);

  const handleSkipIntro = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setHasCompletedIntroGuide(true);
    setIsMinimized(true);
  }, [setHasCompletedIntroGuide]);

  // Capture initial baseline interaction counts
  useEffect(() => {
    if (currentCase) {
      const evidenceList = currentCase.evidenceNodes || currentCase.evidence || [];
      if (initialEvidenceExaminedCount.current === null) {
        initialEvidenceExaminedCount.current = evidenceList.filter((e) => e.status === "examined" || e.status === "analyzed").length;
      }
      initialRedStringsCount.current = redStrings.length;
      initialInterrogationsCount.current = interrogationLog.length;
    }
  }, [currentCase, redStrings.length, interrogationLog.length]);

  // STEP 2 ACTION GATE: Triggered when player clicks any evidence
  useEffect(() => {
    if (!hasCompletedIntroGuide && currentStepIndex === 1) {
      if (activeEvidenceId !== null) {
        const timer = setTimeout(() => {
          advanceStep();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeEvidenceId, hasCompletedIntroGuide, currentStepIndex, advanceStep]);

  // STEP 3 ACTION GATE: Triggered when player connects a red string or clicks suspect
  useEffect(() => {
    if (!hasCompletedIntroGuide && currentStepIndex === 2) {
      if (redStrings.length > initialRedStringsCount.current || activeSuspectId !== null) {
        const timer = setTimeout(() => {
          advanceStep();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [redStrings.length, activeSuspectId, hasCompletedIntroGuide, currentStepIndex, advanceStep]);

  // STEP 4 ACTION GATE: Triggered when player interrogates or equips tool
  useEffect(() => {
    if (!hasCompletedIntroGuide && currentStepIndex === 3) {
      if (interrogationLog.length > initialInterrogationsCount.current || activeForensicTool !== "none") {
        const timer = setTimeout(() => {
          setHasCompletedIntroGuide(true);
          setIsMinimized(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [interrogationLog.length, activeForensicTool, hasCompletedIntroGuide, currentStepIndex, setHasCompletedIntroGuide]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        advanceStep();
      } else if (e.code === "Escape") {
        if (!hasCompletedIntroGuide) {
          handleSkipIntro();
        } else {
          setIsMinimized((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceStep, handleSkipIntro, hasCompletedIntroGuide]);

  if (!isGuideOpen) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={toggleGuide}
          onMouseEnter={() => forensicAudio.playPenFriction()}
          className="flex items-center gap-2.5 px-4 py-2 bg-[#201A15] border border-[#6B5540] hover:border-[#A4825A] text-[#E0D3C1] hover:text-[#FFF8EE] text-xs font-mono tracking-widest uppercase rounded shadow-[0_6px_25px_rgba(0,0,0,0.9)] transition-all group"
          style={{
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(68, 52, 38, 0.4), transparent 75%)",
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C] shadow-[0_0_8px_rgba(200,155,60,0.7)] group-hover:scale-110 transition-transform" />
          <span>[ ? DETECTIVE MEMO ]</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isMinimized && hasCompletedIntroGuide ? (
          /* ── MINIMIZED WEATHERED EVIDENCE TAG STRIP ── */
          <motion.div
            key="minimized"
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="relative flex items-center justify-between gap-4 px-4 py-2.5 bg-[#201A15] border border-[#5A4533] rounded-sm shadow-[0_12px_35px_rgba(0,0,0,0.95)] overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(circle at 15% 30%, rgba(55, 42, 30, 0.5) 0%, rgba(20, 16, 12, 0.98) 100%)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 0 15px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Top paperclip fastener */}
            <div className="absolute -top-1 left-6 z-20 pointer-events-none">
              <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                <path d="M4 22V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V18C12 19.6569 10.6569 21 9 21C7.34315 21 6 19.6569 6 18V6" stroke="url(#clipGradMin)" strokeWidth="1.8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="clipGradMin" x1="4" y1="1" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D6C7B2" />
                    <stop offset="0.5" stopColor="#8C7965" />
                    <stop offset="1" stopColor="#4A3D30" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center gap-3 min-w-0 pl-7">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C89B3C] shadow-[0_0_6px_rgba(200,155,60,0.6)]" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#C4A076] font-bold uppercase flex-shrink-0">
                ACTIVE DIRECTIVE:
              </span>
              <p className="text-xs font-mono text-[#EAE2D5] truncate tracking-wide font-normal">
                {displayedText}
                {isTyping && <span className="inline-block w-1.5 h-3 bg-[#C89B3C] ml-1 animate-pulse" />}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 z-10">
              <button
                onClick={() => {
                  forensicAudio.playPenFriction();
                  setIsMinimized(false);
                }}
                className="px-2.5 py-0.5 text-[10px] font-mono text-[#C4B299] hover:text-[#FFF5EA] border border-[#544333] hover:border-[#967757] rounded-sm bg-[#16120E]/80 transition-colors uppercase tracking-wider shadow-sm"
              >
                [ EXPAND ]
              </button>
              <button
                onClick={toggleGuide}
                className="px-2 py-0.5 text-[10px] font-mono text-[#7D6B58] hover:text-[#C4B299] transition-colors"
                title="Hide Memo"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── EXPANDED TACTILE AGED BLOOD-STAINED EVIDENCE MEMO CARD ── */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative p-5 md:p-6 bg-[#211B15] text-[#E8DFC8] font-mono rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden"
            style={{
              border: "1px solid #544230",
              boxShadow: "0 16px 45px rgba(0, 0, 0, 0.95), inset 0 0 35px rgba(10, 8, 6, 0.85), inset 0 1px 0 rgba(235, 215, 185, 0.1)",
              backgroundImage: "radial-gradient(circle at 20% 15%, rgba(65, 50, 36, 0.35) 0%, rgba(20, 15, 12, 0.98) 100%)",
            }}
          >
            {/* ── 1. FIBROUS PAPER GRAIN OVERLAY ── */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay z-0">
              <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
                <filter id="memo-grain">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#memo-grain)" />
              </svg>
            </div>

            {/* ── 2. REALISTIC DRIED BLOOD STAINS & RESIDUE ── */}
            {/* Top-Right Arterial Spatter & Clot Seepage */}
            <div className="pointer-events-none absolute -top-4 -right-4 w-44 h-44 z-0 opacity-85">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <radialGradient id="bloodClotTop" cx="80%" cy="20%" r="70%">
                  <stop offset="0%" stopColor="#2E0202" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#4A0808" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#240202" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#140202" stopOpacity="0" />
                </radialGradient>
                <path d="M160,0 L80,0 C95,25 110,35 105,55 C100,72 135,70 145,95 C152,110 160,115 160,120 Z" fill="url(#bloodClotTop)" />
                {/* Fine Spatter Droplets */}
                <circle cx="95" cy="45" r="3.5" fill="#3D0505" opacity="0.9" />
                <circle cx="82" cy="32" r="2.2" fill="#4A0808" opacity="0.85" />
                <circle cx="70" cy="18" r="1.8" fill="#330202" opacity="0.8" />
                <circle cx="115" cy="78" r="3" fill="#2E0202" opacity="0.85" />
                <circle cx="128" cy="92" r="2" fill="#440505" opacity="0.75" />
                <circle cx="76" cy="52" r="1.4" fill="#3D0505" opacity="0.7" />
              </svg>
            </div>

            {/* Bottom-Left Clotted Seepage & Finger Smudge */}
            <div className="pointer-events-none absolute -bottom-6 -left-6 w-52 h-48 z-0 opacity-80">
              <svg viewBox="0 0 180 160" className="w-full h-full">
                <radialGradient id="bloodClotBottom" cx="20%" cy="80%" r="75%">
                  <stop offset="0%" stopColor="#280202" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#440808" stopOpacity="0.7" />
                  <stop offset="75%" stopColor="#220202" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#100202" stopOpacity="0" />
                </radialGradient>
                <path d="M0,80 C25,75 35,90 55,95 C72,100 85,130 95,160 L0,160 Z" fill="url(#bloodClotBottom)" />
                {/* Oxidized bloody thumbprint ridges */}
                <g opacity="0.45" stroke="#3A0808" strokeWidth="0.8" fill="none">
                  <path d="M30,115 C34,108 44,108 48,115 C52,122 48,132 40,135" />
                  <path d="M26,118 C32,104 48,104 54,118 C58,128 50,138 38,140" />
                  <path d="M22,122 C30,100 52,100 60,122 C64,134 54,144 36,145" />
                  <path d="M18,128 C28,96 56,96 66,128" />
                </g>
                {/* Spatter Satellites */}
                <circle cx="68" cy="85" r="2.5" fill="#3D0505" opacity="0.85" />
                <circle cx="82" cy="105" r="3" fill="#2E0202" opacity="0.8" />
                <circle cx="98" cy="132" r="2" fill="#4A0808" opacity="0.75" />
                <circle cx="52" cy="74" r="1.6" fill="#380505" opacity="0.7" />
              </svg>
            </div>

            {/* ── 3. DEBOSSED POLICE RUBBER STAMP IN BACKGROUND ── */}
            <div className="pointer-events-none absolute right-8 bottom-3 select-none z-0 opacity-15 rotate-[-7deg]">
              <div className="border-2 border-[#8C3A3A] px-3.5 py-1 text-[#8C3A3A] text-center font-bold tracking-[0.25em] text-[10px] uppercase rounded-sm">
                <div>PRECINCT 42 HOMICIDE</div>
                <div className="text-[8px] tracking-[0.35em] mt-0.5">FORENSIC DISPATCH UNIT</div>
              </div>
            </div>

            {/* ── 4. METALLIC PAPERCLIP FASTENER (TOP LEFT) ── */}
            <div className="absolute -top-1.5 left-8 z-20 pointer-events-none">
              <svg width="22" height="32" viewBox="0 0 22 32" fill="none">
                {/* Drop shadow */}
                <path d="M5 30V6C5 3.23858 7.23858 1 10 1C12.7614 1 15 3.23858 15 6V24C15 25.6569 13.6569 27 12 27C10.3431 27 9 25.6569 9 24V8" stroke="rgba(0,0,0,0.6)" strokeWidth="2.4" strokeLinecap="round" transform="translate(1, 1)" />
                {/* Metallic Clip */}
                <path d="M5 30V6C5 3.23858 7.23858 1 10 1C12.7614 1 15 3.23858 15 6V24C15 25.6569 13.6569 27 12 27C10.3431 27 9 25.6569 9 24V8" stroke="url(#metallicClipGrad)" strokeWidth="2.2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="metallicClipGrad" x1="5" y1="1" x2="15" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E6D8C4" />
                    <stop offset="0.3" stopColor="#B39E84" />
                    <stop offset="0.6" stopColor="#6E5A44" />
                    <stop offset="0.85" stopColor="#C4B097" />
                    <stop offset="1" stopColor="#544332" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* ── 5. TOP HEADER DOCKET & BADGE ── */}
            <div className="relative z-10 flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#443527]/90 text-[11px]">
              <div className="flex items-center gap-3 pl-6">
                <span className="px-2 py-0.5 bg-[#2A2119] border border-[#6E543A] text-[#D8A852] font-bold text-[9.5px] tracking-[0.2em] uppercase rounded-sm shadow-sm">
                  [ {targetDocketTag} ]
                </span>
                <span className="font-bold tracking-[0.18em] text-[#E0D0B8] uppercase text-[11px]">
                  {targetSpeaker}
                </span>
              </div>

              {/* Step indicator during intro */}
              {!hasCompletedIntroGuide && (
                <div className="flex items-center gap-1.5 text-[#B89E7E] text-[10px] tracking-widest font-mono">
                  <span className="px-2 py-0.5 bg-[#17120E] border border-[#4D3A28] rounded-sm text-[#D4B07B] font-semibold">
                    STEP {currentStepIndex + 1} OF {INTRO_STEPS.length}
                  </span>
                </div>
              )}
            </div>

            {/* ── 6. TYPEWRITER SUBTITLE DIRECTIVE TEXT ── */}
            <div className="relative z-10 min-h-[52px] flex items-start py-0.5 pl-1">
              <p className="text-sm md:text-[15px] leading-relaxed text-[#F2EAE0] tracking-wide font-normal font-mono" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-3.5 bg-[#D8A852] ml-1.5 animate-[pulse_0.75s_infinite] align-middle shadow-[0_0_6px_rgba(216,168,82,0.6)]" />
                )}
              </p>
            </div>

            {/* ── 7. ACTION GATE PROMPT BANNER (STAMPED DIRECTIVE) ── */}
            {!hasCompletedIntroGuide && (
              <div className="relative z-10 mt-3 p-2.5 bg-[#16110D]/90 border border-dashed border-[#6B523A] rounded-sm flex items-center justify-between gap-3 text-[11px] text-[#DECBB5]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#D8A852] flex-shrink-0 shadow-[0_0_5px_rgba(216,168,82,0.8)]" />
                  <span className="tracking-wider uppercase font-semibold text-[#DFC096] truncate">
                    {currentActionHint}
                  </span>
                </div>
                {currentStepIndex > 0 && (
                  <span className="text-[9.5px] text-[#8C765C] uppercase tracking-widest flex-shrink-0">
                    [ AUTO-ADVANCES ]
                  </span>
                )}
              </div>
            )}

            {/* ── 8. BOTTOM CONTROLS & TACTILE COMMAND TABS ── */}
            <div className="relative z-10 flex items-center justify-between mt-3.5 pt-3 border-t border-[#443527]/90 text-[10.5px] text-[#A8947C]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    forensicAudio.playPenFriction();
                    advanceStep();
                  }}
                  onMouseEnter={() => forensicAudio.playPenFriction()}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-[#2B2118] hover:bg-[#3D2F23] border border-[#6B543D] hover:border-[#A4825C] text-[#EFE7DC] hover:text-[#FFF] rounded-sm transition-all uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.6)] group"
                >
                  <span className="font-semibold">
                    {isTyping
                      ? "REVEAL ALL"
                      : currentStepIndex === 0
                      ? "ACKNOWLEDGE MEMO"
                      : "MANUAL PROCEED [ SPACE ]"}
                  </span>
                  <kbd className="px-1.5 py-0.5 bg-[#140F0B] border border-[#4D3A28] rounded-sm text-[9.5px] text-[#D8C2A8] font-sans group-hover:border-[#8C6D4A]">↵</kbd>
                </button>

                {!hasCompletedIntroGuide && (
                  <button
                    onClick={() => {
                      forensicAudio.playPenFriction();
                      handleSkipIntro();
                    }}
                    className="text-[#8C765C] hover:text-[#D8C2A8] underline underline-offset-4 decoration-[#54402E] transition-colors uppercase tracking-wider text-[10px]"
                  >
                    [ ESC ] Skip Intro
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasCompletedIntroGuide && (
                  <button
                    onClick={() => {
                      forensicAudio.playPenFriction();
                      setIsMinimized(true);
                    }}
                    onMouseEnter={() => forensicAudio.playPenFriction()}
                    className="px-3 py-1.5 text-[#BBA58D] hover:text-[#FFF8EE] border border-[#54402E] hover:border-[#846648] rounded-sm bg-[#18130F]/90 transition-all uppercase tracking-wider shadow-sm"
                  >
                    [ MINIMIZE ]
                  </button>
                )}
                <button
                  onClick={() => {
                    forensicAudio.playPenFriction();
                    toggleGuide();
                  }}
                  className="px-2 py-1 text-[#7D6852] hover:text-[#D8C2A8] transition-colors font-bold"
                  title="Close Memo"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
