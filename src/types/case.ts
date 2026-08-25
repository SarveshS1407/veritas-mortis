/**
 * VERITAS MORTIS — Unified Type System & Re-exports
 */

export * from "./caseEngine";

import type {
  ComposureLevel,
  ActPhase,
  VerdictGrade,
  ForensicToolType,
  EvidenceType,
  EvidenceStatus,
  AutopsyDetails,
  ToxicologyNotes,
  VictimProfile,
  DialoguePool,
  SuspectArchetype,
  EvidenceNode,
  ChronologyEvent,
  SecretTruth,
  CaseGraph,
  InterrogationPayload,
  InterrogationResult,
  IndictmentPayload,
  VerificationResult,
} from "./caseEngine";

// Backward compatibility aliases
export type ForensicCategory =
  | "autopsy"
  | "toxicology"
  | "ballistics"
  | "fingerprint"
  | "document"
  | "photograph"
  | "weapon"
  | "testimony"
  | "wiretap_transcript"
  | "threat_letter"
  | "fiber";

export type EvidenceCategory = ForensicCategory;

export type Victim = VictimProfile;
export type Suspect = SuspectArchetype;
export type EvidenceItem = EvidenceNode;
export type TimelineEvent = ChronologyEvent;
export type MysterySolution = SecretTruth;
export type CaseSolution = SecretTruth;
export type CaseData = CaseGraph;
export type IndictmentResult = VerificationResult;
export type CaseVerdict = VerificationResult;

export interface DialogueLine {
  text: string;
  stressDelta: number;
  bodyLanguageCue: string;
}

export interface RedStringConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromNodeType?: "suspect" | "evidence" | string;
  toNodeType?: "suspect" | "evidence" | string;
  fromType?: string;
  toType?: string;
  color?: "red" | "green" | string;
  label?: string;
  isPlayerCreated?: boolean;
}

export interface InterrogationEntry {
  id: string;
  suspectId: string;
  timestamp: string;
  playerAction: string;
  evidencePresentedId?: string;
  evidenceUsed?: string;
  dialogueText?: string;
  suspectResponse: string;
  bodyLanguageCue?: string;
  composureDelta: number;
  newComposure?: number;
  newComposureLevel?: ComposureLevel;
  isContradiction?: boolean;
  isConfession?: boolean;
}

export interface InterrogateRequest extends InterrogationPayload {}
export interface InterrogateResponse extends InterrogationResult {}

export interface Accusation {
  accusedSuspectId: string;
  selectedWeaponEvidenceId: string;
  selectedMotiveIndex: number;
  selectedMotive?: string;
  reconstructedSequence?: string[];
  timestamp?: string;
}

export interface IndictmentSubmission {
  caseId: string;
  accusedKillerId: string;
  selectedWeaponEvidenceId: string;
  selectedMotive: string;
  examinedEvidenceCount: number;
  totalEvidenceCount: number;
}

export type WorkspaceMode = "interrogation" | "document_inspection" | "indictment" | "evidence_board";

export interface GameState {
  currentCase: CaseData | null;
  isLoading: boolean;
  error: string | null;
  activeForensicTool: ForensicToolType;
  workspaceMode: WorkspaceMode;
  activeSuspectId: string | null;
  activeEvidenceId: string | null;
  currentAct: ActPhase;
  redStrings: RedStringConnection[];
  boardNodePositions: Record<string, { x: number; y: number }>;
  interrogationLog: InterrogationEntry[];
  evidenceTrayOrder?: string[];
  accusation: Accusation | null;
  verdict: CaseVerdict | null;
  hasCompletedIntroGuide: boolean;
  isGuideOpen: boolean;

  // Store Actions
  generateNewCase: (seed?: number) => Promise<void>;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setActiveSuspect: (id: string | null) => void;
  setActiveEvidence: (id: string | null) => void;
  examineEvidence: (id: string) => void;
  addRedString: (from: string, to: string, fromType?: string, toType?: string) => void;
  removeRedString: (id: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  setForensicTool: (tool: ForensicToolType) => void;
  interrogateSuspect: (suspectId: string, action: string, evidenceId?: string) => Promise<void>;
  advanceAct: () => void;
  submitAccusation: (accusation: Accusation) => void;
  setHasCompletedIntroGuide: (completed: boolean) => void;
  toggleGuide: () => void;
  resetGame: () => void;
}