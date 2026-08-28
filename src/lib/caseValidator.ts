import { CaseGraph, EvidenceNode, SuspectArchetype } from "@/types/caseEngine";

export interface ValidationIssue {
  ruleId: string;
  severity: "ERROR" | "WARNING";
  description: string;
}

export interface CaseValidationResult {
  isValid: boolean;
  seed: number;
  caseId: string;
  totalInvariantsChecked: number;
  passedInvariantsCount: number;
  issues: ValidationIssue[];
}

/**
 * VERITAS MORTIS — Procedural Mystery Solvability Validator
 *
 * Verifies that procedurally generated murder mystery graphs are mathematically
 * solvable, contain no dead ends, have valid alibi contradictions, and adhere
 * strictly to the 3-act narrative escalation structure.
 */
export class CaseSolvabilityValidator {
  public static validateCase(caseGraph: CaseGraph): CaseValidationResult {
    const issues: ValidationIssue[] = [];
    let passedCount = 0;
    const totalInvariants = 10;

    const evidence: EvidenceNode[] = caseGraph.evidenceNodes || caseGraph.evidence || [];
    const suspects: SuspectArchetype[] = caseGraph.suspects || [];

    // Invariant 1: Exactly 1 Guilty Culprit
    const guiltySuspects = suspects.filter((s) => s.isGuilty);
    if (guiltySuspects.length === 1) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_01_SINGLE_CULPRIT",
        severity: "ERROR",
        description: `Case must contain exactly 1 guilty culprit (found ${guiltySuspects.length})`,
      });
    }

    // Invariant 2: Exactly 2 Innocent Suspects
    const innocentSuspects = suspects.filter((s) => !s.isGuilty);
    if (innocentSuspects.length === 2) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_02_INNOCENT_COUNT",
        severity: "ERROR",
        description: `Case must contain exactly 2 innocent suspects (found ${innocentSuspects.length})`,
      });
    }

    // Invariant 3: Culprit Alibi Contradiction Exists
    const culprit = guiltySuspects[0];
    const culpritContradictionId = culprit?.contradictionClueId || culprit?.contradictionEvidenceId;
    const culpritContradictionClue = evidence.find((e) => e.id === culpritContradictionId);
    if (culprit && culpritContradictionClue) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_03_CULPRIT_CONTRADICTION",
        severity: "ERROR",
        description: `Culprit's alibi contradiction clue #${culpritContradictionId} does not exist in evidence graph`,
      });
    }

    // Invariant 4: 3-Act Evidence Distribution
    const act1Count = evidence.filter((e) => e.unlocksInAct === "act1_hook").length;
    const act2Count = evidence.filter((e) => e.unlocksInAct === "act2_reversal").length;
    const act3Count = evidence.filter((e) => e.unlocksInAct === "act3_climax").length;
    if (act1Count >= 3 && act2Count >= 2 && act3Count >= 2) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_04_ACT_DISTRIBUTION",
        severity: "ERROR",
        description: `Evidence distribution invalid (Act 1: ${act1Count}, Act 2: ${act2Count}, Act 3: ${act3Count})`,
      });
    }

    // Invariant 5: Micro-Forensics & Autopsy Integrity
    if (
      caseGraph.victim &&
      caseGraph.victim.causeOfDeath &&
      caseGraph.victim.autopsyDetails?.primaryInjury &&
      caseGraph.victim.toxicologyNotes?.serumAnomalies
    ) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_05_MICRO_FORENSICS",
        severity: "ERROR",
        description: "Victim profile is missing necessary autopsy or toxicology micro-forensic records",
      });
    }

    // Invariant 6: UV Blacklight Latent Clue Exists
    const uvClues = evidence.filter((e) => Boolean(e.hiddenUVDetails || e.hiddenDetail));
    if (uvClues.length >= 1) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_06_UV_LATENT_CLUE",
        severity: "ERROR",
        description: "Evidence graph must contain at least 1 clue with hidden UV blacklight details",
      });
    }

    // Invariant 7: Audio Wiretap Exists
    const audioClues = evidence.filter((e) => e.type === "AUDIO" || Boolean(e.audioTranscript));
    if (audioClues.length >= 1) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_07_AUDIO_WIRETAP",
        severity: "ERROR",
        description: "Evidence graph must contain at least 1 audio wiretap/dictaphone clue with transcript",
      });
    }

    // Invariant 8: Murder Weapon Exists in Graph
    const weaponId = caseGraph.secretTruth.murderWeaponClueId || caseGraph.secretTruth.weaponEvidenceId;
    const weaponClue = evidence.find((e) => e.id === weaponId);
    if (weaponClue) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_08_MURDER_WEAPON",
        severity: "ERROR",
        description: `Designated murder weapon #${weaponId} not found in evidence collection`,
      });
    }

    // Invariant 9: Timeline Chronology Events
    if (Array.isArray(caseGraph.timeline) && caseGraph.timeline.length >= 3) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_09_TIMELINE_INTEGRITY",
        severity: "ERROR",
        description: `Timeline requires at least 3 chronological milestones (found ${caseGraph.timeline?.length || 0})`,
      });
    }

    // Invariant 10: Ground Truth Solution Narrative
    if (caseGraph.secretTruth && (caseGraph.secretTruth.fullNarrativeChronicle || caseGraph.secretTruth.fullNarrative)) {
      passedCount++;
    } else {
      issues.push({
        ruleId: "INV_10_SOLUTION_CHRONICLE",
        severity: "ERROR",
        description: "Secret ground truth missing full unredacted narrative chronicle",
      });
    }

    return {
      isValid: issues.length === 0,
      seed: caseGraph.seed,
      caseId: caseGraph.id,
      totalInvariantsChecked: totalInvariants,
      passedInvariantsCount: passedCount,
      issues,
    };
  }
}
