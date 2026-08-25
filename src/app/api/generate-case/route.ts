import { NextRequest, NextResponse } from "next/server";
import { generateCase } from "@/lib/proceduralGenerator";
import { MYSTERY_SYSTEM_PROMPT, buildCaseGenerationPrompt } from "@/lib/ai/prompts/mysteryEngine";
import type { CaseGraph } from "@/types/caseEngine";

export async function POST(req: NextRequest) {
  try {
    let body: { seed?: number } = {};
    try {
      body = await req.json();
    } catch (_) {
      // Body is optional
    }

    const seed = typeof body.seed === "number" ? body.seed : Math.floor(Math.random() * 900000) + 100000;

    // Check for Anthropic / OpenAI API Key in environment for LLM enhancement
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      try {
        const { generateText } = await import("ai");
        const { anthropic } = await import("@ai-sdk/anthropic");

        const { text } = await generateText({
          model: anthropic("claude-3-5-sonnet-20241022"),
          system: MYSTERY_SYSTEM_PROMPT,
          prompt: buildCaseGenerationPrompt(seed),
          temperature: 0.75,
        });

        const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsedCase = JSON.parse(cleanedText) as CaseGraph;

        if (parsedCase.victim && Array.isArray(parsedCase.suspects) && (Array.isArray(parsedCase.evidenceNodes) || Array.isArray(parsedCase.evidence))) {
          parsedCase.id = `case_${seed}`;
          parsedCase.seed = seed;
          return NextResponse.json(parsedCase, { status: 200 });
        }
      } catch (aiErr) {
        console.warn("[Case Generation AI Path Failed, Falling back to Procedural Engine]:", aiErr);
      }
    }

    // High-performance deterministic thriller engine generator
    const caseData = generateCase(seed);
    return NextResponse.json(caseData, { status: 200 });
  } catch (error) {
    console.error("[generate-case route error]:", error);
    return NextResponse.json(
      { error: "Failed to generate forensic case file" },
      { status: 500 }
    );
  }
}
