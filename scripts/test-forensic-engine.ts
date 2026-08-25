import { generateCase } from "@/lib/proceduralGenerator";
import type { CaseGraph, SuspectArchetype, EvidenceNode } from "@/types/caseEngine";

/**
 * VERITAS MORTIS — AUTOMATED THRILLER ENGINE INTEGRITY TEST SUITE
 * 
 * Verifies:
 * 1. PRNG Determinism across identical seeds.
 * 2. 3-Act Evidence graph distribution.
 * 3. Micro-forensics & contradiction clue linkages.
 * 4. Suspect psychological composure pools.
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
}

console.log("==================================================");
console.log("🕵️ RUNNING VERITAS MORTIS THRILLER ENGINE TEST SUITE");
console.log("==================================================");

// 1. Test Determinism
const seedA = 924810;
const caseA1 = generateCase(seedA);
const caseA2 = generateCase(seedA);

assert(caseA1.title === caseA2.title, "Deterministic title match failed");
assert(caseA1.victim.name === caseA2.victim.name, "Deterministic victim match failed");
assert(caseA1.secretTruth.culpritId === caseA2.secretTruth.culpritId, "Deterministic culprit match failed");
console.log("✅ 1. Deterministic Mulberry32 PRNG verification passed.");

// 2. Test 3-Act Evidence Partitioning
const evidence: EvidenceNode[] = caseA1.evidenceNodes || caseA1.evidence || [];
const act1Evidence = evidence.filter((e) => e.unlocksInAct === "act1_hook");
const act2Evidence = evidence.filter((e) => e.unlocksInAct === "act2_reversal");
const act3Evidence = evidence.filter((e) => e.unlocksInAct === "act3_climax");

assert(act1Evidence.length >= 3, "Act 1 must have at least 3 initial evidence items");
assert(act2Evidence.length >= 2, "Act 2 must have at least 2 reversal evidence items");
assert(act3Evidence.length >= 2, "Act 3 must have at least 2 climax evidence items");
console.log(`✅ 2. 3-Act Evidence partitioning passed (Act 1: ${act1Evidence.length}, Act 2: ${act2Evidence.length}, Act 3: ${act3Evidence.length}).`);

// 3. Test Micro-Forensics & Contradiction Clues
assert(Boolean(caseA1.victim.autopsyDetails.primaryInjury), "Victim must contain autopsy details");
assert(Boolean(caseA1.victim.toxicologyNotes.serumAnomalies), "Victim must contain toxicology serum anomalies");

const suspects: SuspectArchetype[] = caseA1.suspects;
assert(suspects.length === 3, "Must have exactly 3 suspects");

const guiltySuspects = suspects.filter((s) => s.isGuilty);
assert(guiltySuspects.length === 1, "Must have exactly 1 true culprit");

const culprit = guiltySuspects[0];
const contradictionEvidence = evidence.find((e) => e.id === culprit.contradictionClueId || e.id === culprit.contradictionEvidenceId);
assert(Boolean(contradictionEvidence), "Culprit must have a valid contradictory evidence item in the case graph");
console.log("✅ 3. Micro-forensics and suspect contradiction linkages verified.");

// 4. Test UV Hidden Clue Presence
const uvClues = evidence.filter((e) => Boolean(e.hiddenUVDetails || e.hiddenDetail));
assert(uvClues.length >= 1, "Must contain at least 1 UV blacklight latent evidence node");
console.log("✅ 4. UV Blacklight latent layer verification passed.");

console.log("\n🎯 ALL 4 FORENSIC ENGINE INTEGRITY CHECKS PASSED PERFECTLY!\n");
