// ═══════════════════════════════════════════════════════════════════════════════
// VERITAS MORTIS — Core Case & Evidence Type Definitions
// All procedurally generated murder mystery data flows through these schemas.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Evidence Categories ──
export type EvidenceCategory =
  | "autopsy"
  | "ballistics"
  | "fingerprint"
  | "toxicology"
  | "document"
  | "photograph"
  | "weapon"
  | "testimony"
  | "fiber"
  | "threat_letter";

// ── Evidence Examination State ──
export type EvidenceStatus = "undiscovered" | "discovered" | "examined" | "analyzed";

// ── Suspect Composure Tiers ──
export type ComposureLevel = "CALM" | "DEFLECTING" | "CORNERED" | "BROKEN";

// ── 3-Act Narrative Progression ──
export type ActPhase = "act1_hook" | "act2_reversal" | "act3_climax";

// ── Game Verdict Grade ──
export type VerdictGrade = "A" | "B" | "C" | "F";

// ── Workspace View Modes ──
export type WorkspaceMode = "interrogation" | "document_inspection" | "indictment";

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE ITEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface EvidenceItem {
  id: string;
  /** Display label: "Coroner's Report #08-B", "Latent Print Card #3" */
  title: string;
  /** Which forensic category */
  category: EvidenceCategory;
  /** Short description shown on hover / quick glance */
  summary: string;
  /** Full forensic analysis text revealed on deep inspection */
  fullAnalysis: string;
  /** Which suspect(s) this evidence implicates by ID */
  implicates: string[];
  /** Which suspect(s) this evidence exonerates by ID */
  exonerates: string[];
  /** Which act this evidence becomes available */
  unlocksInAct: ActPhase;
  /** Current examination state */
  status: EvidenceStatus;
  /** Optional: tag override for special stamps (e.g., "CORONER VERIFIED") */
  stampLabel?: string;
  /** Optional: hidden detail only visible under UV blacklight tool */
  hiddenDetail?: string;
  /** Position on evidence board (x%, y%) — procedurally assigned */
  boardPosition: { x: number; y: number };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUSPECT
// ═══════════════════════════════════════════════════════════════════════════════

export interface SuspectRelationship {
  targetSuspectId: string;
  nature: string; // "business partner", "ex-spouse", "rival", etc.
}

export interface Suspect {
  id: string;
  /** Full display name */
  name: string;
  /** Age at time of incident */
  age: number;
  /** Their declared role: "Business Partner", "Ex-Wife", "Groundskeeper" */
  role: string;
  /** Portrait description for visual rendering */
  portraitDescription: string;
  /** Their stated alibi */
  alibi: string;
  /** Their hidden secret that the player can uncover */
  hiddenSecret: string;
  /** What motive they might have */
  motive: string;
  /** The specific evidence ID that contradicts their alibi */
  contradictionEvidenceId: string;
  /** Current composure (deteriorates during interrogation) */
  composure: number; // 0-100
  /** Current composure tier */
  composureLevel: ComposureLevel;
  /** Lines of dialogue keyed by composure tier */
  dialogueByComposure: Record<ComposureLevel, string[]>;
  /** Body language cues that appear at each tier */
  bodyLanguageCues: Record<ComposureLevel, string>;
  /** Whether this suspect is the actual killer */
  isGuilty: boolean;
  /** Relationships with other suspects */
  relationships: SuspectRelationship[];
  /** Board position for polaroid */
  boardPosition: { x: number; y: number };
  /** Number of times interrogated */
  interrogationCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VICTIM
// ═══════════════════════════════════════════════════════════════════════════════

export interface Victim {
  id: string;
  name: string;
  age: number;
  occupation: string;
  causeOfDeath: string;
  timeOfDeath: string;
  locationFound: string;
  autopsySummary: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRIME SCENE TIMELINE EVENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  involvedSuspectIds: string[];
  involvedEvidenceIds: string[];
  act: ActPhase;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RED STRING CONNECTION (Murder Board Links)
// ═══════════════════════════════════════════════════════════════════════════════

export interface RedStringConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromType: "suspect" | "evidence";
  toType: "suspect" | "evidence";
  label?: string;
  isPlayerCreated: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERROGATION LOG
// ═══════════════════════════════════════════════════════════════════════════════

export interface InterrogationEntry {
  id: string;
  suspectId: string;
  /** The question or confrontation the player chose */
  playerAction: string;
  /** The suspect's response text */
  suspectResponse: string;
  /** Evidence ID used in confrontation, if any */
  evidenceUsed?: string;
  /** Composure delta from this exchange */
  composureDelta: number;
  /** Timestamp in-game */
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCUSATION & VERDICT
// ═══════════════════════════════════════════════════════════════════════════════

export interface Accusation {
  accusedSuspectId: string;
  selectedMotiveIndex: number;
  selectedWeaponEvidenceId: string;
  /** 3 key timeline events the player reconstructs */
  reconstructedSequence: string[];
}

export interface CaseVerdict {
  grade: VerdictGrade;
  correctKiller: boolean;
  correctMotive: boolean;
  correctWeapon: boolean;
  evidenceExaminedPercent: number;
  interrogationsCompleted: number;
  narrativeSummary: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL CASE DATA (Root Schema)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CaseData {
  id: string;
  /** Deterministic seed for reproducibility */
  seed: number;
  /** Case file header */
  caseNumber: string;
  title: string;
  date: string;
  location: string;
  /** Act-by-act plot summary */
  actSummaries: Record<ActPhase, string>;

  // Core entities
  victim: Victim;
  suspects: Suspect[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];

  // Solution
  solution: {
    killerId: string;
    weaponEvidenceId: string;
    motiveIndex: number;
    fullNarrative: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME STATE (Zustand Store Shape)
// ═══════════════════════════════════════════════════════════════════════════════

export interface GameState {
  // Core case
  currentCase: CaseData | null;
  isLoading: boolean;
  error: string | null;

  // Progression
  currentAct: ActPhase;
  workspaceMode: WorkspaceMode;
  activeSuspectId: string | null;
  activeEvidenceId: string | null;

  // Murder Board
  redStrings: RedStringConnection[];
  boardNodePositions: Record<string, { x: number; y: number }>;

  // Interrogation
  interrogationLog: InterrogationEntry[];

  // Forensic Tools
  activeForensicTool: "none" | "uv_blacklight" | "magnifier" | "dictaphone";

  // Evidence Tray (bottom dock quick-access)
  evidenceTrayOrder: string[];

  // Accusation
  accusation: Accusation | null;
  verdict: CaseVerdict | null;

  // Actions
  generateNewCase: (seed?: number) => Promise<void>;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setActiveSuspect: (id: string | null) => void;
  setActiveEvidence: (id: string | null) => void;
  examineEvidence: (id: string) => void;
  addRedString: (from: string, to: string, fromType: "suspect" | "evidence", toType: "suspect" | "evidence") => void;
  removeRedString: (id: string) => void;
  updateNodePosition: (nodeId: string, pos: { x: number; y: number }) => void;
  setForensicTool: (tool: GameState["activeForensicTool"]) => void;
  interrogateSuspect: (suspectId: string, action: string, evidenceId?: string) => Promise<void>;
  advanceAct: () => void;
  submitAccusation: (accusation: Accusation) => void;
  resetGame: () => void;
}
