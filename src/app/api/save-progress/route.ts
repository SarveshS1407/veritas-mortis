import { NextRequest, NextResponse } from "next/server";
import { CaseStore, type CaseSessionState } from "@/lib/db/caseStore";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CaseSessionState;

    if (!body.caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    CaseStore.saveSession(body);

    return NextResponse.json(
      { success: true, caseId: body.caseId, savedAt: new Date().toISOString() },
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
      return NextResponse.json({ error: "caseId query parameter required" }, { status: 400 });
    }

    const session = CaseStore.getSession(caseId);

    if (!session) {
      return NextResponse.json({ error: "Case session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("[load-progress route error]:", error);
    return NextResponse.json({ error: "Failed to retrieve case progress" }, { status: 500 });
  }
}
