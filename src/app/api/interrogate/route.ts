import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { CaseData } from '@/types/case';

interface InterrogateRequest {
  suspectId: string;
  playerAction: string;
  evidenceId?: string;
  currentComposure: number;
  composureLevel: string;
}

export async function POST(request: Request) {
  try {
    const body: InterrogateRequest = await request.json();
    const { suspectId, playerAction, evidenceId, currentComposure, composureLevel } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // We don't have full suspect details here in the deterministic fallback since they aren't passed, 
    // but we can assume some contradiction logic based on if evidenceId is present.
    // In a real scenario, we'd fetch the suspect data from a database to check contradictionEvidenceId.
    // For this implementation, we'll simulate the deterministic engine.

    if (apiKey) {
      try {
        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20240620'),
          prompt: `You are generating a response for a suspect interrogation in a forensic noir detective game.
Current Composure: ${currentComposure} (${composureLevel})
Player Action: "${playerAction}"
Evidence Presented ID: ${evidenceId || 'None'}

Determine the suspect's response, the change in composure (composureDelta), the new composure level, their body language, and whether they confess.
Return ONLY a JSON object with this structure:
{
  "response": "Suspect's spoken dialogue",
  "composureDelta": number (negative for losing composure),
  "bodyLanguageCue": "Description of physical reaction",
  "isConfession": boolean
}
Ensure the tone is dark, gritty, and menacing.`,
        });

        const aiResult = JSON.parse(text);
        const newComposure = Math.max(0, currentComposure + aiResult.composureDelta);
        let newComposureLevel = 'CALM';
        if (newComposure <= 15) newComposureLevel = 'BROKEN';
        else if (newComposure <= 40) newComposureLevel = 'CORNERED';
        else if (newComposure <= 70) newComposureLevel = 'DEFLECTING';

        // Enforce confession rules
        const isConfession = aiResult.isConfession || (newComposure <= 5 && !!evidenceId);

        return Response.json({
          response: aiResult.response,
          composureDelta: aiResult.composureDelta,
          newComposure,
          newComposureLevel,
          bodyLanguageCue: aiResult.bodyLanguageCue,
          isConfession
        });
      } catch (aiError) {
        console.error('AI Interrogation failed, falling back to deterministic:', aiError);
        // Fall through to deterministic
      }
    }

    // Deterministic response engine
    let composureDelta = 0;
    let response = "";
    let bodyLanguageCue = "";

    // Simulating contradiction match for deterministic engine
    // In a full implementation, you would check: evidenceId === suspect.contradictionEvidenceId
    const isContradiction = !!evidenceId; // Simplified for the prompt requirements

    if (isContradiction) {
      composureDelta = -Math.floor(Math.random() * 11) - 25; // -25 to -35
      response = "Where did you get that? That doesn't prove anything!";
      bodyLanguageCue = "Eyes widen, breath hitches, sudden defensive posture.";
    } else {
      composureDelta = -Math.floor(Math.random() * 8) - 5; // -5 to -12
      response = "I don't know what you're talking about.";
      bodyLanguageCue = "Shifts uncomfortably, avoids direct eye contact.";
    }

    const newComposure = Math.max(0, currentComposure + Math.round(composureDelta));
    
    let newComposureLevel = 'CALM';
    if (newComposure <= 15) {
      newComposureLevel = 'BROKEN';
      bodyLanguageCue = "Trembling uncontrollably, defeated slump, tears welling.";
    } else if (newComposure <= 40) {
      newComposureLevel = 'CORNERED';
      bodyLanguageCue = "Pacing, aggressive gestures, sweat on brow.";
    } else if (newComposure <= 70) {
      newComposureLevel = 'DEFLECTING';
      bodyLanguageCue = "Crossed arms, nervous tapping, tight-lipped expression.";
    } else {
      bodyLanguageCue = "Relaxed posture, steady gaze, confident demeanor.";
    }

    const isConfession = newComposure <= 5 && !!evidenceId;
    if (isConfession) {
      response = "Alright! I did it... I didn't have a choice.";
      bodyLanguageCue = "Collapses into chair, buries face in hands.";
    }

    return Response.json({
      response,
      composureDelta: Math.round(composureDelta),
      newComposure,
      newComposureLevel,
      bodyLanguageCue,
      isConfession
    });

  } catch (error) {
    console.error('Error in interrogate route:', error);
    return Response.json({ error: 'Failed to process interrogation' }, { status: 500 });
  }
}
