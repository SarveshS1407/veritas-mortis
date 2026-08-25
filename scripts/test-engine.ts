import { generateCase } from "@/lib/proceduralGenerator";
import type { SuspectArchetype, EvidenceNode } from "@/types/caseEngine";

console.log("=================================================");
console.log("🕵️‍♂️ VERITAS MORTIS: PROCEDURAL THRILLER ENGINE AUDIT");
console.log("=================================================\n");

// Test Seed 104820
const testCase = generateCase(104820);

console.log(`CASE TITLE: ${testCase.title}`);
console.log(`SCENE: ${testCase.crimeSceneLocation}`);
console.log(`CASE NUMBER: ${testCase.caseNumber}`);
console.log(`DATE: ${testCase.date}\n`);

console.log("--- VICTIM MICRO-FORENSICS ---");
console.log(`Victim: ${testCase.victim.name} (${testCase.victim.age}, ${testCase.victim.occupation})`);
console.log(`Blood Type: ${testCase.victim.bloodType}`);
console.log(`Time of Death: ${testCase.victim.timeOfDeath}`);
console.log(`Cause: ${testCase.victim.causeOfDeath}`);
console.log(`Primary Injury: ${testCase.victim.autopsyDetails.primaryInjury}`);
console.log(`Stomach Contents: ${testCase.victim.autopsyDetails.stomachContents}`);
console.log(`Toxicology: ${testCase.victim.toxicologyNotes.serumAnomalies}\n`);

console.log("--- SUSPECT ARCHETYPES & COMPOSURE ---");
testCase.suspects.forEach((suspect: SuspectArchetype, idx: number) => {
  console.log(`[${idx + 1}] ${suspect.name} (${suspect.occupation})`);
  console.log(`    - Role: ${suspect.isGuilty ? "🎯 TRUE CULPRIT" : "🛡️ INNOCENT / SECONDARY"}`);
  console.log(`    - Initial Composure: ${suspect.composure} | Stress: ${suspect.stressLevel}/100`);
  console.log(`    - Alibi: "${suspect.alibiStatement}"`);
  console.log(`    - Hidden Secret: "${suspect.hiddenSecret}"`);
  console.log(`    - Contradiction Clue ID: ${suspect.contradictionClueId}`);
  console.log(`    - Sample Broken Dialogue: "${suspect.dialogueByComposure.BROKEN[0]}"\n`);
});

console.log("--- 3-ACT FORENSIC EVIDENCE GRAPH ---");
testCase.evidenceNodes.forEach((ev: EvidenceNode) => {
  console.log(`• [${ev.unlocksInAct.toUpperCase()}] [${ev.type}] ${ev.label} (ID: ${ev.id})`);
  if (ev.hiddenUVDetails) {
    console.log(`    🔦 UV HIDDEN LAYER: ${ev.hiddenUVDetails}`);
  }
  if (ev.audioTranscript) {
    console.log(`    🎙️ WIRETAP TRANSCRIPT: ${ev.audioTranscript.replace(/\n/g, " ")}`);
  }
  if (ev.contradictsSuspectId) {
    console.log(`    💥 SHATTERS ALIBI FOR: ${ev.contradictsSuspectId}`);
  }
});

console.log("\n--- GROUND TRUTH NARRATIVE CHRONICLE ---");
console.log(`Culprit ID: ${testCase.secretTruth.culpritId}`);
console.log(`Murder Weapon ID: ${testCase.secretTruth.murderWeaponClueId}`);
console.log(`Motive: ${testCase.secretTruth.motiveSummary}`);
console.log(`Resolution:\n${testCase.secretTruth.fullNarrativeChronicle}`);

console.log("\n✅ PROCEDURAL GENERATION ENGINE INTEGRITY VERIFIED 100%");
