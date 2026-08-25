/**
 * VERITAS MORTIS — THRILLER ENGINE SCHEMA
 * 
 * Formal domain models representing the procedural narrative graph,
 * micro-forensics matrix, interrogation composure states, and indictment verification.
 */

// ── 1. Composure & Act Progression ──
export type ComposureLevel = "CALM" | "DEFLECTING" | "CORNERED" | "BROKEN";

export type ActPhase = "act1_hook" | "act2_reversal" | "act3_climax";

export type VerdictGrade = "A" | "B" | "C" | "F";

export type ForensicToolType = 
  | "uv_blacklight" 
  | "magnifier" 
  | "dictaphone" 
  | "fingerprint_powder" 
  | "luminol" 
  | "none";

// ── 2. Evidence Classification ──
export type EvidenceType = 
  | "PHYSICAL"      // Weapons, fibers, physical traces
  | "DOCUMENT"      // Ledgers, wills, diaries, blackmail notes
  | "BIO"           // Blood spatter, toxicology vials, autopsy sheets
  | "AUDIO"         // Wiretaps, phone recordings, dictaphone tapes
  | "UV_HIDDEN";    // Latent prints, washed blood, luminescent chemical traces

export type EvidenceStatus = "undiscovered" | "discovered" | "examined" | "analyzed";

// ── 3. Micro-Forensics & Victim Profile ──
export interface AutopsyDetails {
  primaryInjury: string;
  defensiveWounds: boolean;
  stomachContents: string;
  estimatedTimeWindow: {
    earliest: string;
    latest: string;
  };
  pathologistNotes: string;
}

export interface ToxicologyNotes {
  substancesDetected: string[];
  bloodAlcoholLevel: number;
  serumAnomalies: string;
  isFatalToxicity: boolean;
}

export interface VictimProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  timeOfDeath: string;
  causeOfDeath: string;
  locationFound: string;
  location?: string;
  toxicologyNotes: ToxicologyNotes;
  autopsyDetails: AutopsyDetails;
  backgroundDossier: string;
  // Backward-compatibility aliases
  autopsySummary?: string;
  backgroundNotes?: string;
}

// ── 4. Suspect Archetype & Interrogation Composure ──
export interface DialoguePool {
  CALM: string[];
  DEFLECTING: string[];
  CORNERED: string[];
  BROKEN: string[];
}

export interface SuspectArchetype {
  id: string;
  name: string;
  age: number;
  occupation: string;
  role?: string;
  personality: string;
  composure: ComposureLevel | number;
  composureLevel?: ComposureLevel;
  currentTier?: ComposureLevel;
  stressLevel: number; // 0 to 100
  alibiStatement: string;
  alibi?: string;
  hiddenSecret: string;
  motive: string;
  isGuilty: boolean;
  contradictionClueId: string; // The specific EvidenceNode ID that shatters their alibi
  contradictionEvidenceId?: string;
  confessionDialogue: string;
  dialogueByComposure: DialoguePool;
  bodyLanguageCues: Record<ComposureLevel, string>;
  portraitDescription?: string;
  relationships?: Record<string, string> | any[];
  boardPosition: { x: number; y: number };
  interrogationCount?: number;
}

// ── 5. Forensic Evidence Node ──
export interface EvidenceNode {
  id: string;
  label: string;
  title?: string;
  type: EvidenceType;
  category?: string;
  description: string;
  summary?: string;
  fullForensicAnalysis: string;
  fullAnalysis?: string;
  implicatesSuspectIds: string[];
  implicates?: string[];
  exoneratesSuspectIds: string[];
  exonerates?: string[];
  unlocksInAct: ActPhase;
  status: EvidenceStatus;
  contradictsSuspectId?: string;
  hiddenUVDetails?: string;
  hiddenDetail?: string;
  audioTranscript?: string;
  stampLabel?: string;
  coordinates: { x: number; y: number };
  boardPosition?: { x: number; y: number };
}

// ── 6. Timeline & Chronology ──
export interface ChronologyEvent {
  id: string;
  timestamp: string;
  time?: string;
  act?: ActPhase;
  description: string;
  associatedSuspectIds?: string[];
  associatedEvidenceIds?: string[];
  involvedSuspectIds?: string[];
  involvedEvidenceIds?: string[];
  isCrucialContradictionPoint?: boolean;
  isCrimeTime?: boolean;
}

// ── 7. Secret Ground Truth & Master Case Graph ──
export interface SecretTruth {
  culpritId: string;
  killerId?: string;
  murderWeaponClueId: string;
  weaponEvidenceId?: string;
  murderWeaponEvidenceId?: string;
  motiveSummary: string;
  motiveIndex?: number;
  primaryMotive?: string;
  fatalContradictionSummary?: string;
  act1FalseLeadSuspectId?: string; // The framed red herring suspect
  act2ReversalClueId?: string;     // The evidence that dismantles the false lead
  act3FinalContradictionClueId?: string; // The definitive forensic proof
  fullNarrativeChronicle: string; // Christie-style complete case resolution
  fullNarrative?: string;
  fullCrimeNarrative?: string;
}

export interface CaseGraph {
  id: string;
  seed: number;
  caseNumber: string;
  title: string;
  date: string;
  crimeSceneLocation: string;
  location?: string;
  currentAct: ActPhase;
  act?: ActPhase;
  victim: VictimProfile;
  suspects: SuspectArchetype[];
  evidenceNodes: EvidenceNode[];
  evidence?: EvidenceNode[];
  timeline: ChronologyEvent[];
  narrativeActs: Record<ActPhase, string>;
  actSummaries?: Record<ActPhase, string>;
  secretTruth: SecretTruth;
  solution?: SecretTruth;
  redStrings?: any[];
  createdAt?: string;
}

// ── 8. API & Gameplay Request/Response Payloads ──
export interface InterrogationPayload {
  caseId?: string;
  suspectId: string;
  playerAction: "question_alibi" | "press_harder" | "present_evidence" | string;
  presentedEvidenceId?: string;
  evidenceId?: string;
  currentStressLevel?: number;
  currentComposure?: number;
  composureLevel?: string;
  contradictionEvidenceId?: string;
  contradictionClueId?: string;
  isGuilty?: boolean;
  dialogueByComposure?: DialoguePool;
}

export interface InterrogationResult {
  responseDialogue: string;
  response?: string;
  bodyLanguageCue: string;
  stressDelta: number;
  composureDelta?: number;
  newStressLevel: number;
  newComposure?: number;
  newComposureLevel: ComposureLevel | string;
  contradictionTriggered: boolean;
  isConfession: boolean;
}

export interface IndictmentPayload {
  caseId?: string;
  accusedSuspectId?: string;
  accusedKillerId?: string;
  killerId?: string;
  murderWeaponEvidenceId?: string;
  selectedWeaponEvidenceId?: string;
  weaponId?: string;
  motiveEvidenceId?: string;
  selectedMotive?: string;
  selectedMotiveIndex?: number;
  motiveIndex?: number;
  evidenceExaminedIds?: string[];
  examinedEvidenceCount?: number;
  totalEvidenceCount?: number;
  interrogationsCompleted?: number;
  solution?: SecretTruth;
}

export interface VerificationResult {
  grade: VerdictGrade;
  isKillerCorrect: boolean;
  correctKiller?: boolean;
  isWeaponCorrect: boolean;
  correctWeapon?: boolean;
  isMotiveCorrect: boolean;
  correctMotive?: boolean;
  score: number;
  evidenceExaminedPercent: number;
  interrogationsCompleted: number;
  narrativeSummary?: string;
  narrativeReveal: string;
}
