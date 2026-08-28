import { NextRequest, NextResponse } from "next/server";
import { CaseStore, type CaseSessionState } from "@/lib/db/caseStore";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CaseSessionState> & { caseId: string };

    if (!body.caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    const updatedSession = CaseStore.saveSession(body);

    return NextResponse.json(
      {
        success: true,
        caseId: updatedSession.caseId,
        savedAt: updatedSession.lastUpdated,
        snapshotCount: updatedSession.snapshots.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[save-progress route error]:", error);
    return NextResponse.json({ error: "Failed to persist case progress" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      // Return list of all active session IDs
      return NextResponse.json(
        { activeSessions: CaseStore.getAllSessionIds() },
        { status: 200 }
      );
    }

    const session = CaseStore.getSession(caseId);

    if (!session) {
      return NextResponse.json({ error: `Case session #${caseId} not found` }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("[load-progress route error]:", error);
    return NextResponse.json({ error: "Failed to retrieve case progress" }, { status: 500 });
  }
}
