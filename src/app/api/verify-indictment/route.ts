import { NextRequest, NextResponse } from "next/server";
import { IndictmentVerifier } from "@/lib/indictmentVerifier";
import type { IndictmentPayload, SecretTruth } from "@/types/caseEngine";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IndictmentPayload & { solution?: SecretTruth };
    const { solution } = body;

    if (!solution) {
      return NextResponse.json(
        { error: "solution object is required for grand jury indictment verification" },
        { status: 400 }
      );
    }

    const result = IndictmentVerifier.verifyIndictment(body, solution);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[verify-indictment route error]:", error);
    return NextResponse.json({ error: "Failed to evaluate case indictment" }, { status: 500 });
  }
}
