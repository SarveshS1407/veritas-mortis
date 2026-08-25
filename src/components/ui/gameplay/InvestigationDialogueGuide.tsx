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

  const targetSpeaker = useMemo(() => {
    if (!hasCompletedIntroGuide && currentStepIndex < INTRO_STEPS.length) {
      return INTRO_STEPS[currentStepIndex].speaker;
    }
    return `CASE ${currentCase?.caseNumber || "#VM-1974"} — ACTIVE DIRECTIVE`;
  }, [hasCompletedIntroGuide, currentStepIndex, INTRO_STEPS, currentCase]);

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
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#1F1B17]/95 border border-[#6E5A44]/80 hover:border-[#A88C68] text-[#D8C7B0] hover:text-[#FFF8EE] text-xs font-mono tracking-widest uppercase rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.85)] transition-all group"
          style={{
            boxShadow: "0 4px 18px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#C89B3C] group-hover:bg-[#E5B558] shadow-[0_0_6px_rgba(200,155,60,0.6)]" />
          <span>[ ? DETECTIVE MEMO ]</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isMinimized && hasCompletedIntroGuide ? (
          /* ── MINIMIZED WEATHERED EVIDENCE TAG STRIP ── */
          <motion.div
            key="minimized"
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="flex items-center justify-between gap-4 px-4 py-2 bg-[#1A1613]/95 border border-[#5C4A38] rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]"
            style={{
              backgroundImage: "radial-gradient(ellipse at top left, rgba(74, 59, 46, 0.2), transparent 70%)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C89B3C] shadow-[0_0_5px_rgba(200,155,60,0.5)]" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#C4A076] font-bold uppercase flex-shrink-0">
                DIRECTIVE:
              </span>
              <p className="text-xs font-mono text-[#E8E1D5] truncate tracking-wide">
                {displayedText}
                {isTyping && <span className="inline-block w-1.5 h-3 bg-[#C89B3C] ml-1 animate-pulse" />}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(false)}
                className="px-2.5 py-0.5 text-[10px] font-mono text-[#C4B299] hover:text-[#FFF5EA] border border-[#544333] hover:border-[#8C7156] rounded-sm bg-[#120F0D]/60 transition-colors uppercase tracking-wider"
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
          /* ── EXPANDED VINTAGE DETECTIVE CASE MEMORANDUM ── */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative p-4 md:p-5 bg-[#1C1814]/98 border border-[#5C4A38] rounded-sm text-[#E8DFC8] font-mono shadow-[0_15px_45px_rgba(0,0,0,0.95)]"
            style={{
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.95), inset 0 0 35px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(230, 215, 190, 0.08)",
              border: "1px solid #4D3D2F",
              backgroundImage: "radial-gradient(circle at 10% 10%, rgba(60, 48, 38, 0.35) 0%, rgba(20, 16, 13, 0.98) 90%)",
            }}
          >
            {/* Top Header Memo Docket */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#3E3226] text-[11px]">
              <div className="flex items-center gap-2.5">
                <span className="px-1.5 py-0.5 bg-[#2B231C] border border-[#544333] text-[#C89B3C] font-bold text-[9px] tracking-widest uppercase rounded-sm">
                  {targetDocketTag}
                </span>
                <span className="font-bold tracking-[0.16em] text-[#D8C7B0] uppercase text-[10.5px]">
                  {targetSpeaker}
                </span>
              </div>

              {/* Step indicator during intro */}
              {!hasCompletedIntroGuide && (
                <div className="flex items-center gap-1.5 text-[#A89074] text-[10px] tracking-widest font-mono">
                  <span className="px-1.5 py-0.5 bg-[#14100D] border border-[#3E3226] rounded-sm text-[#C4A076]">
                    STEP {currentStepIndex + 1} OF {INTRO_STEPS.length}
                  </span>
                </div>
              )}
            </div>

            {/* Typewriter Subtitle Text */}
            <div className="min-h-[50px] flex items-start py-0.5">
              <p className="text-sm md:text-[14.5px] leading-relaxed text-[#EDE5D8] tracking-wide font-normal">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-3.5 bg-[#C89B3C] ml-1.5 animate-[pulse_0.75s_infinite] align-middle" />
                )}
              </p>
            </div>

            {/* Action Gate Prompt Banner (Stamped Case Directive) */}
            {!hasCompletedIntroGuide && (
              <div className="mt-2.5 p-2 bg-[#120E0C]/90 border border-dashed border-[#5C4A38] rounded-sm flex items-center justify-between gap-3 text-[11px] text-[#D8C5AB]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] flex-shrink-0" />
                  <span className="tracking-wide uppercase font-semibold text-[#D4B692] truncate">
                    {currentActionHint}
                  </span>
                </div>
                {currentStepIndex > 0 && (
                  <span className="text-[9.5px] text-[#7D6B58] uppercase tracking-widest flex-shrink-0">
                    [ AUTO-ADVANCES ]
                  </span>
                )}
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#362B20] text-[10px] text-[#9E8B75]">
              <div className="flex items-center gap-3">
                <button
                  onClick={advanceStep}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#282019] hover:bg-[#382E25] border border-[#5C4A38] hover:border-[#8C7156] text-[#E8DFC8] hover:text-[#FFF] rounded-sm transition-colors uppercase tracking-wider shadow-sm"
                >
                  <span>
                    {isTyping
                      ? "REVEAL ALL"
                      : currentStepIndex === 0
                      ? "ACKNOWLEDGE MEMO"
                      : "MANUAL PROCEED [ SPACE ]"}
                  </span>
                  <kbd className="px-1 py-0.2 bg-[#120E0C] border border-[#3E3226] rounded-sm text-[9px] text-[#C4B299] font-sans">↵</kbd>
                </button>

                {!hasCompletedIntroGuide && (
                  <button
                    onClick={handleSkipIntro}
                    className="text-[#7D6B58] hover:text-[#C4B299] underline underline-offset-4 decoration-[#4D3D2F] transition-colors uppercase tracking-wider"
                  >
                    [ ESC ] Skip Intro
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasCompletedIntroGuide && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="px-2.5 py-1 text-[#A89680] hover:text-[#FFF5EA] border border-[#443527] hover:border-[#6B5540] rounded-sm bg-[#14100D]/80 transition-colors uppercase tracking-wider"
                  >
                    [ MINIMIZE ]
                  </button>
                )}
                <button
                  onClick={toggleGuide}
                  className="px-2 py-1 text-[#6E5D4B] hover:text-[#A89680] transition-colors"
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
