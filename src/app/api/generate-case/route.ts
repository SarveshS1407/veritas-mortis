import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateCase } from "@/lib/proceduralGenerator";
import type { CaseData } from "@/types/case";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { seed } = body as { seed?: number };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const localCase = generateCase(seed);
      return Response.json(localCase);
    }

    try {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20240620"),
        prompt: `Generate a detailed murder mystery case for a forensic noir detective game.
Return ONLY valid JSON matching this TypeScript interface exactly:

interface CaseData {
  id: string;
  seed: number;
  caseNumber: string;
  title: string;
  date: string;
  location: string;
  actSummaries: { act1_hook: string; act2_reversal: string; act3_climax: string };
  victim: { id: string; name: string; age: number; occupation: string; causeOfDeath: string; timeOfDeath: string; locationFound: string; autopsySummary: string };
  suspects: Array<{
    id: string; name: string; age: number; role: string; portraitDescription: string;
    alibi: string; hiddenSecret: string; motive: string; contradictionEvidenceId: string;
    composure: 85; composureLevel: "CALM";
    dialogueByComposure: { CALM: string[]; DEFLECTING: string[]; CORNERED: string[]; BROKEN: string[] };
    bodyLanguageCues: { CALM: string; DEFLECTING: string; CORNERED: string; BROKEN: string };
    isGuilty: boolean; relationships: Array<{ targetSuspectId: string; nature: string }>;
    boardPosition: { x: number; y: number }; interrogationCount: 0;
  }>;
  evidence: Array<{
    id: string; title: string; category: string; summary: string; fullAnalysis: string;
    implicates: string[]; exonerates: string[]; unlocksInAct: string;
    status: "discovered"; stampLabel?: string; hiddenDetail?: string;
    boardPosition: { x: number; y: number };
  }>;
  timeline: Array<{ id: string; time: string; description: string; involvedSuspectIds: string[]; involvedEvidenceIds: string[]; act: string }>;
  solution: { killerId: string; weaponEvidenceId: string; motiveIndex: number; fullNarrative: string };
}

Create 3 suspects (exactly 1 guilty), 6-8 evidence items, and 6 timeline events.
The tone must be dark, gritty, menacing forensic noir.
Respond ONLY with valid JSON. No markdown, no extra text.`,
      });

      const parsed = JSON.parse(text) as CaseData;

      // Validate critical fields exist
      if (
        !parsed.id ||
        !parsed.victim ||
        !parsed.suspects?.length ||
        !parsed.evidence?.length ||
        !parsed.solution?.killerId
      ) {
        throw new Error("Invalid case data structure from AI");
      }

      return Response.json(parsed);
    } catch (aiError) {
      console.error("AI generation failed, falling back to procedural:", aiError);
      const fallbackCase = generateCase(seed);
      return Response.json(fallbackCase);
    }
  } catch (error) {
    console.error("Error in generate-case route:", error);
    return Response.json({ error: "Failed to generate case" }, { status: 500 });
  }
}
