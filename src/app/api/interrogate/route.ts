import { NextRequest, NextResponse } from "next/server";
import type { ComposureLevel, InterrogationResult } from "@/types/caseEngine";

function calculateComposureLevel(stress: number): ComposureLevel {
  if (stress < 30) return "CALM";
  if (stress < 60) return "DEFLECTING";
  if (stress < 85) return "CORNERED";
  return "BROKEN";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      suspectId,
      playerAction,
      evidenceId,
      presentedEvidenceId,
      currentStressLevel = 20,
      currentComposure = 100,
      contradictionClueId,
      contradictionEvidenceId,
      isGuilty = false,
      dialogueByComposure,
    } = body;

    if (!suspectId) {
      return NextResponse.json({ error: "suspectId is required" }, { status: 400 });
    }

    const effectiveEvidenceId = presentedEvidenceId || evidenceId;
    const targetContradictionId = contradictionClueId || contradictionEvidenceId;

    let stressDelta = 10;
    let isContradiction = false;
    let isConfession = false;
    let responseText = "I have already stated my account of the evening, Detective.";
    let bodyLanguage = "*[Maintains an impassive expression across the interrogation table]*";

    // 1. Evaluate Player Action & Contradiction Presentation
    if (playerAction === "present_evidence" && effectiveEvidenceId) {
      if (targetContradictionId && effectiveEvidenceId === targetContradictionId) {
        // Alibi / Narrative Shattered!
        isContradiction = true;
        stressDelta = 35;
      } else {
        // Irrelevant or premature evidence presented
        stressDelta = 3;
      }
    } else if (playerAction === "press_harder") {
      stressDelta = 15;
    } else {
      // General question
      stressDelta = 8;
    }

    // Support both stress-based (0-100) and legacy composure-based (100-0) systems
    let newStress = Math.min(100, Math.max(0, currentStressLevel + stressDelta));
    if (currentComposure !== undefined && currentStressLevel === 20) {
      // Invert if called with classic composure
      const newComposureScore = Math.max(0, Math.min(100, currentComposure - stressDelta));
      newStress = 100 - newComposureScore;
    }

    const newTier = calculateComposureLevel(newStress);

    // 2. Select Dynamic Dialogue & Confessions
    if (isContradiction) {
      if (newStress >= 80) {
        isConfession = true;
        responseText = isGuilty
          ? "Enough! You want the truth?! Arthur was going to destroy everything I built! I poisoned the port, and I don't regret a single drop!"
          : "Alright, stop! I was there at the estate, yes! We screamed at each other over the debts, but he was alive when I hailed my cab at 22:15! I swear to God!";
        bodyLanguage = "*[Breaks down trembling; hands slam against the metal table under the harsh lamp]*";
      } else {
        responseText = "W-where did you get that document?! That doesn't prove anything! Someone planted that to frame me!";
        bodyLanguage = "*[Pupils dilate sharply; grips the chair armrests with whitening knuckles]*";
      }
    } else if (dialogueByComposure && dialogueByComposure[newTier]) {
      const lines = dialogueByComposure[newTier];
      if (Array.isArray(lines) && lines.length > 0) {
        responseText = lines[Math.floor(Math.random() * lines.length)];
      }
    }

    // Default psychological body language cues per composure tier
    if (!isContradiction) {
      switch (newTier) {
        case "CALM":
          bodyLanguage = "*[Leans back comfortably; exhales cigarette smoke in a steady stream]*";
          break;
        case "DEFLECTING":
          bodyLanguage = "*[Avoids direct eye contact; checks wristwatch with restless fingers]*";
          break;
        case "CORNERED":
          bodyLanguage = "*[Breathing accelerates rapidly; noticeable micro-tremors in left hand]*";
          break;
        case "BROKEN":
          bodyLanguage = "*[Head buried in trembling hands; voice cracking under interrogation light]*";
          break;
      }
    }

    const result: InterrogationResult = {
      responseDialogue: responseText,
      response: responseText,
      stressDelta,
      newStressLevel: newStress,
      newComposure: newTier,
      newComposureLevel: newTier,
      bodyLanguageCue: bodyLanguage,
      isConfession,
      contradictionTriggered: isContradiction,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[interrogate route error]:", error);
    return NextResponse.json({ error: "Failed to process interrogation" }, { status: 500 });
  }
}
