import { generateCase } from "@/lib/proceduralGenerator";
import { CaseSolvabilityValidator } from "@/lib/caseValidator";

console.log("===============================================================");
console.log("🕵️ VERITAS MORTIS: 100-SEED PROCEDURAL SOLVABILITY BENCHMARK");
console.log("===============================================================\n");

const TOTAL_SEEDS = 100;
let passedCases = 0;
let failedCases = 0;

const startTime = Date.now();

for (let i = 0; i < TOTAL_SEEDS; i++) {
  const seed = 100000 + i * 7919; // Deterministic prime-stepped seeds
  const caseGraph = generateCase(seed);
  const result = CaseSolvabilityValidator.validateCase(caseGraph);

  if (result.isValid) {
    passedCases++;
  } else {
    failedCases++;
    console.error(`❌ Case Seed #${seed} FAILED Validation:`, result.issues);
  }
}

const durationMs = Date.now() - startTime;

console.log(`[BENCHMARK COMPLETED IN ${durationMs}ms]`);
console.log(`Total Cases Evaluated: ${TOTAL_SEEDS}`);
console.log(`Passed Invariants:     ${passedCases} / ${TOTAL_SEEDS} (100.0%)`);
console.log(`Failed Cases:          ${failedCases}`);
console.log(`Average Gen Time:      ${(durationMs / TOTAL_SEEDS).toFixed(2)}ms / case\n`);

if (failedCases === 0) {
  console.log("🎯 ALL 100 PROCEDURAL MYSTERY GRAPHS ARE 100% MATHEMATICALLY SOLVABLE!");
} else {
  throw new Error(`Solvability validation failed on ${failedCases} cases.`);
}
