import { NextRequest, NextResponse } from "next/server";
import type { VerificationResult, VerdictGrade } from "@/types/caseEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accusedSuspectId,
      killerId,
      murderWeaponEvidenceId,
      weaponId,
      motiveEvidenceId,
      motiveIndex = 0,
      solution,
      examinedEvidenceCount = 0,
      totalEvidenceCount = 8,
      interrogationsCompleted = 0,
    } = body;

    if (!solution && !killerId) {
      return NextResponse.json(
        { error: "solution or killerId is required for indictment evaluation" },
        { status: 400 }
      );
    }

    const targetCulpritId = solution ? solution.culpritId : killerId;
    const targetWeaponId = solution ? (solution.murderWeaponClueId || solution.weaponEvidenceId) : (murderWeaponEvidenceId || weaponId);

    const chosenSuspectId = accusedSuspectId || killerId;
    const chosenWeaponId = murderWeaponEvidenceId || weaponId;

    // 1. Forensic Deductive Accuracy Evaluation
    const isKillerCorrect = chosenSuspectId === targetCulpritId;
    const isWeaponCorrect = !targetWeaponId || chosenWeaponId === targetWeaponId;
    const isMotiveCorrect = motiveIndex === (solution?.motiveIndex ?? 0);

    let score = 0;
    if (isKillerCorrect) score += 50;
    if (isWeaponCorrect) score += 25;
    if (isMotiveCorrect) score += 15;

    const evidenceExaminedPercent = Math.min(
      100,
      totalEvidenceCount > 0 ? Math.round((examinedEvidenceCount / totalEvidenceCount) * 100) : 100
    );
    score += Math.round((evidenceExaminedPercent / 100) * 10);

    // 2. Verdict Grade
    let grade: VerdictGrade = "F";
    if (score >= 85) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 45) grade = "C";
    else grade = "F";

    const narrativeReveal = solution?.fullNarrativeChronicle || solution?.fullNarrative || (
      isKillerCorrect
        ? "The grand jury returns a true bill of indictment. The forensic evidence presented is irrefutable."
        : "The grand jury dismisses the indictment due to insufficient or misplaced forensic proof. The true culprit remains at large."
    );

    const result: VerificationResult = {
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
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[verify-indictment route error]:", error);
    return NextResponse.json({ error: "Failed to evaluate case indictment" }, { status: 500 });
  }
}
