/**
 * VERITAS MORTIS — Active Case Persistence Store
 *
 * Provides session/in-memory, local snapshotting, and Supabase-ready persistence for active case states,
 * unlocked evidence, interrogation transcripts, red string connections, and detective case notes.
 */

import type {
  CaseData,
  InterrogationEntry,
  RedStringConnection,
  CaseVerdict,
  ActPhase,
  ForensicToolType,
} from "@/types/case";

export interface CaseSessionSnapshot {
  snapshotId: string;
  timestamp: string;
  currentAct: ActPhase;
  examinedEvidenceCount: number;
  interrogationCount: number;
  redStringsCount: number;
  noteSummary?: string;
}

export interface CaseSessionState {
  caseId: string;
  caseData: CaseData;
  currentAct: ActPhase;
  unlockedEvidenceIds: string[];
  examinedEvidenceIds: string[];
  interrogationLog: InterrogationEntry[];
  redStrings: RedStringConnection[];
  boardNodePositions?: Record<string, { x: number; y: number }>;
  activeForensicTool?: ForensicToolType;
  playerNotes?: string;
  verdict?: CaseVerdict | null;
  snapshots: CaseSessionSnapshot[];
  lastUpdated: string;
}

// In-memory case cache (persists across serverless invocation warm instances)
const activeCaseSessions = new Map<string, CaseSessionState>();

export const CaseStore = {
  saveSession(session: Partial<CaseSessionState> & { caseId: string }): CaseSessionState {
    const existing = activeCaseSessions.get(session.caseId);
    const timestamp = new Date().toISOString();

    const snapshot: CaseSessionSnapshot = {
      snapshotId: `snap_${Date.now()}`,
      timestamp,
      currentAct: session.currentAct || existing?.currentAct || "act1_hook",
      examinedEvidenceCount: (session.examinedEvidenceIds || existing?.examinedEvidenceIds || []).length,
      interrogationCount: (session.interrogationLog || existing?.interrogationLog || []).length,
      redStringsCount: (session.redStrings || existing?.redStrings || []).length,
      noteSummary: session.playerNotes?.slice(0, 100),
    };

    const updated: CaseSessionState = {
      caseId: session.caseId,
      caseData: session.caseData || existing?.caseData || ({} as CaseData),
      currentAct: session.currentAct || existing?.currentAct || "act1_hook",
      unlockedEvidenceIds: session.unlockedEvidenceIds || existing?.unlockedEvidenceIds || [],
      examinedEvidenceIds: session.examinedEvidenceIds || existing?.examinedEvidenceIds || [],
      interrogationLog: session.interrogationLog || existing?.interrogationLog || [],
      redStrings: session.redStrings || existing?.redStrings || [],
      boardNodePositions: session.boardNodePositions || existing?.boardNodePositions || {},
      activeForensicTool: session.activeForensicTool || existing?.activeForensicTool || "none",
      playerNotes: session.playerNotes ?? existing?.playerNotes ?? "",
      verdict: session.verdict ?? existing?.verdict ?? null,
      snapshots: [...(existing?.snapshots || []), snapshot].slice(-20), // Retain last 20 snapshots
      lastUpdated: timestamp,
    };

    activeCaseSessions.set(session.caseId, updated);
    return updated;
  },

  getSession(caseId: string): CaseSessionState | null {
    return activeCaseSessions.get(caseId) || null;
  },

  getAllSessionIds(): string[] {
    return Array.from(activeCaseSessions.keys());
  },

  clearSession(caseId: string): boolean {
    return activeCaseSessions.delete(caseId);
  },

  clearAll(): void {
    activeCaseSessions.clear();
  },
};
