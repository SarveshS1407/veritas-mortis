import {
  VerdictGrade,
  VerificationResult,
  IndictmentPayload,
  SecretTruth,
} from "@/types/caseEngine";

export interface CourtroomTranscript {
  grandJuryVote: "TRUE_BILL" | "NO_BILL";
  verdictTitle: string;
  presidingJudge: string;
  deliberationNotes: string[];
  postTrialEpilogue: string;
}

export class IndictmentVerifier {
  public static verifyIndictment(
    payload: IndictmentPayload,
    solution: SecretTruth
  ): VerificationResult & { courtroomTranscript: CourtroomTranscript } {
    const {
      accusedSuspectId,
      killerId,
      murderWeaponEvidenceId,
      weaponId,
      motiveIndex = 0,
      selectedMotiveIndex,
      examinedEvidenceCount = 0,
      totalEvidenceCount = 8,
      interrogationsCompleted = 0,
    } = payload;

    const chosenSuspectId = accusedSuspectId || killerId;
    const chosenWeaponId = murderWeaponEvidenceId || weaponId;
    const effectiveMotiveIndex = selectedMotiveIndex ?? motiveIndex;

    const targetCulpritId = solution.culpritId || solution.killerId;
    const targetWeaponId = solution.murderWeaponClueId || solution.weaponEvidenceId || solution.murderWeaponEvidenceId;

    // 1. Scoring Matrix
    const isKillerCorrect = Boolean(chosenSuspectId && targetCulpritId && chosenSuspectId === targetCulpritId);
    const isWeaponCorrect = Boolean(!targetWeaponId || chosenWeaponId === targetWeaponId);
    const isMotiveCorrect = effectiveMotiveIndex === (solution.motiveIndex ?? 0);

    let score = 0;
    if (isKillerCorrect) score += 50;
    if (isWeaponCorrect) score += 25;
    if (isMotiveCorrect) score += 15;

    const evidenceExaminedPercent = Math.min(
      100,
      totalEvidenceCount > 0 ? Math.round((examinedEvidenceCount / totalEvidenceCount) * 100) : 100
    );
    score += Math.round((evidenceExaminedPercent / 100) * 10);

    // 2. Letter Grade Evaluation
    let grade: VerdictGrade = "F";
    if (score >= 85) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 45) grade = "C";
    else grade = "F";

    const narrativeReveal = solution.fullNarrativeChronicle || solution.fullNarrative || (
      isKillerCorrect
        ? "The grand jury returns a true bill of indictment. The forensic evidence presented is irrefutable."
        : "The grand jury dismisses the indictment due to insufficient or misplaced forensic proof. The true culprit remains at large."
    );

    // 3. Courtroom Deliberations & Post-Trial Transcript
    const grandJuryVote = isKillerCorrect && (isWeaponCorrect || isMotiveCorrect) ? "TRUE_BILL" : "NO_BILL";
    const verdictTitle = grandJuryVote === "TRUE_BILL" ? "CONVICTION SECURED" : "CASE DISMISSED / COLD FILE";

    const deliberationNotes: string[] = [];
    if (isKillerCorrect) {
      deliberationNotes.push("✓ Culprit identity definitively established through forensic timeline convergence.");
    } else {
      deliberationNotes.push("✗ Wrong individual indicted; forensic evidence failed to place the accused at the point of fatal trauma.");
    }

    if (isWeaponCorrect) {
      deliberationNotes.push("✓ Murder weapon striations/toxicology matches fatal trauma vector.");
    } else {
      deliberationNotes.push("✗ Flawed murder weapon designation; laboratory chemical findings mismatched.");
    }

    if (isMotiveCorrect) {
      deliberationNotes.push("✓ Financial / personal motive corroborated by documentary ledger proof.");
    }

    const postTrialEpilogue = isKillerCorrect
      ? `State Court Department 4: The defendant was sentenced to life imprisonment without possibility of parole. The forensic dossier compiled during the investigation was entered into the state archive as a landmark deduction.`
      : `The indictment was quashed on grounds of reasonable doubt. The real perpetrator destroyed remaining records before fleeing the jurisdiction. Case relegated to the cold case depository.`;

    const courtroomTranscript: CourtroomTranscript = {
      grandJuryVote,
      verdictTitle,
      presidingJudge: "Judge Reginald Vance, Superior Criminal Court",
      deliberationNotes,
      postTrialEpilogue,
    };

    return {
      grade,
      score,
      isKillerCorrect,
      correctKiller: isKillerCorrect,
      isWeaponCorrect,
      correctWeapon: isWeaponCorrect,
      isMotiveCorrect,
      correctMotive: isMotiveCorrect,
      evidenceExaminedPercent,
      interrogationsCompleted,
      narrativeReveal,
      narrativeSummary: narrativeReveal,
      courtroomTranscript,
    };
  }
}
