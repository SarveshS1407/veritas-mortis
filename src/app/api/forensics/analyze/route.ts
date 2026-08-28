import { NextRequest, NextResponse } from "next/server";
import { ForensicAnalysisEngine, type LabAnalysisType } from "@/lib/forensicAnalysisEngine";
import type { CaseGraph, EvidenceNode } from "@/types/caseEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      evidenceId,
      analysisType = "SPECTROMETRY",
      caseGraph,
    } = body as {
      evidenceId: string;
      analysisType: LabAnalysisType;
      caseGraph: CaseGraph;
    };

    if (!evidenceId || !caseGraph) {
      return NextResponse.json(
        { error: "evidenceId and caseGraph are required for forensic laboratory processing" },
        { status: 400 }
      );
    }

    const evidenceList: EvidenceNode[] = caseGraph.evidenceNodes || caseGraph.evidence || [];
    const targetEvidence = evidenceList.find((e) => e.id === evidenceId);

    if (!targetEvidence) {
      return NextResponse.json(
        { error: `Evidence item #${evidenceId} not found in active case graph` },
        { status: 404 }
      );
    }

    const report = ForensicAnalysisEngine.analyzeEvidence(targetEvidence, analysisType, caseGraph);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("[api/forensics/analyze route error]:", error);
    return NextResponse.json(
      { error: "Failed to execute laboratory forensic analysis" },
      { status: 500 }
    );
  }
}
