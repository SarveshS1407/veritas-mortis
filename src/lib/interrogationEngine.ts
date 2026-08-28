import {
  ComposureLevel,
  SuspectArchetype,
  InterrogationPayload,
  InterrogationResult,
} from "@/types/caseEngine";

export interface PsychologicalStateSnapshot {
  suspectId: string;
  stressLevel: number; // 0 to 100
  composureLevel: ComposureLevel;
  galvanicReaction: "NORMAL" | "ELEVATED" | "EXTREME_SPIKE";
  heartRateBpm: number;
  bodyLanguage: string;
  isCornered: boolean;
  isConfessionTriggered: boolean;
}

export class InterrogationEngine {
  /**
   * Calculate composure tier from stress level (0 to 100)
   */
  public static computeComposureLevel(stress: number): ComposureLevel {
    if (stress < 30) return "CALM";
    if (stress < 60) return "DEFLECTING";
    if (stress < 85) return "CORNERED";
    return "BROKEN";
  }

  /**
   * Evaluate player interrogation action and compute psychological progression
   */
  public static evaluateInterrogation(
    suspect: SuspectArchetype,
    payload: InterrogationPayload
  ): InterrogationResult {
    const { playerAction, presentedEvidenceId, evidenceId } = payload;
    const effectiveClueId = presentedEvidenceId || evidenceId;
    const targetContradiction = suspect.contradictionClueId || suspect.contradictionEvidenceId;

    let stressDelta = 8;
    let isContradiction = false;
    let isConfession = false;

    const currentStress = payload.currentStressLevel ?? (typeof suspect.stressLevel === "number" ? suspect.stressLevel : 20);

    // 1. Evidence Presentation Evaluation
    if (playerAction === "present_evidence" && effectiveClueId) {
      if (targetContradiction && effectiveClueId === targetContradiction) {
        // FATAL CONTRADICTION TRIGGERED
        isContradiction = true;
        stressDelta = 35;
      } else {
        // Irrelevant / Bluff Evidence
        stressDelta = 2;
      }
    } else if (playerAction === "press_harder") {
      stressDelta = 14;
    } else {
      // General Alibi questioning
      stressDelta = 8;
    }

    const newStress = Math.min(100, Math.max(0, currentStress + stressDelta));
    const newComposureTier = this.computeComposureLevel(newStress);
    const numericalComposure = Math.max(0, 100 - newStress);

    // 2. Select Narrative Dialogue & Body Language
    let responseText = "I have already told you everything about that evening, Detective.";
    let bodyLanguage = "*[Maintains steady eye contact; exhales slowly]*";

    if (isContradiction) {
      if (newStress >= 80) {
        isConfession = true;
        responseText = suspect.isGuilty
          ? suspect.confessionDialogue ||
            "Enough! Stop waving that proof in my face! I poisoned the decanter and I'd do it again to save my life!"
          : suspect.confessionDialogue ||
            "Alright! I was at the estate, but only to retrieve the blackmail ledger! I swear I did not kill them!";
        bodyLanguage = "*[Breaks down trembling; hands violently slam against the metal table under the harsh lamp]*";
      } else {
        responseText = `W-where did you get that?! That doesn't prove anything! Someone planted that to frame me!`;
        bodyLanguage = "*[Pupils dilate sharply; grips the chair armrests with whitening knuckles; breathing quickens]*";
      }
    } else if (suspect.dialogueByComposure && suspect.dialogueByComposure[newComposureTier]) {
      const lines = suspect.dialogueByComposure[newComposureTier];
      if (Array.isArray(lines) && lines.length > 0) {
        responseText = lines[Math.floor(Math.random() * lines.length)];
      }
    }

    if (!isContradiction) {
      switch (newComposureTier) {
        case "CALM":
          bodyLanguage = suspect.bodyLanguageCues?.CALM || "*[Leans back comfortably; taps an expensive cigarette case]*";
          break;
        case "DEFLECTING":
          bodyLanguage = suspect.bodyLanguageCues?.DEFLECTING || "*[Avoids direct eye contact; checks wristwatch with restless fingers]*";
          break;
        case "CORNERED":
          bodyLanguage = suspect.bodyLanguageCues?.CORNERED || "*[Breathing accelerates rapidly; micro-tremors visible in hands]*";
          break;
        case "BROKEN":
          bodyLanguage = suspect.bodyLanguageCues?.BROKEN || "*[Head buried in trembling palms; voice cracking under interrogation light]*";
          break;
      }
    }

    return {
      responseDialogue: responseText,
      response: responseText,
      stressDelta,
      composureDelta: -stressDelta,
      newStressLevel: newStress,
      newComposure: numericalComposure,
      newComposureLevel: newComposureTier,
      bodyLanguageCue: bodyLanguage,
      contradictionTriggered: isContradiction,
      isConfession,
    };
  }
}
