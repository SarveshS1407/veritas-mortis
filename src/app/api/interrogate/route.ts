import { NextRequest, NextResponse } from "next/server";
import { InterrogationEngine } from "@/lib/interrogationEngine";
import type { SuspectArchetype, InterrogationPayload } from "@/types/caseEngine";

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

    const suspectStub: SuspectArchetype = {
      id: suspectId,
      name: body.name || "Suspect",
      age: 40,
      occupation: "Witness / Associate",
      personality: "Guarded",
      composure: "CALM",
      stressLevel: currentStressLevel,
      alibiStatement: "",
      hiddenSecret: "",
      motive: "",
      isGuilty,
      contradictionClueId: contradictionClueId || contradictionEvidenceId || "",
      confessionDialogue: body.confessionDialogue || "",
      dialogueByComposure: dialogueByComposure || {
        CALM: ["I have already stated my account of the evening, Detective."],
        DEFLECTING: ["You're looking in the wrong direction, Detective."],
        CORNERED: ["You can't prove that!"],
        BROKEN: ["Fine! You want the truth?! I did it!"],
      },
      bodyLanguageCues: {
        CALM: "*[Maintains an impassive expression across the interrogation table]*",
        DEFLECTING: "*[Shifts uncomfortably in the wooden chair]*",
        CORNERED: "*[Breathing becomes shallow and rapid]*",
        BROKEN: "*[Head buried in hands under the blinding overhead lamp]*",
      },
      boardPosition: { x: 0, y: 0 },
    };

    const payload: InterrogationPayload = {
      suspectId,
      playerAction,
      evidenceId,
      presentedEvidenceId,
      currentStressLevel: typeof currentStressLevel === "number" ? currentStressLevel : 100 - (currentComposure || 80),
    };

    const result = InterrogationEngine.evaluateInterrogation(suspectStub, payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[interrogate route error]:", error);
    return NextResponse.json({ error: "Failed to process interrogation" }, { status: 500 });
  }
}
