/**
 * VERITAS MORTIS — Active Case Persistence Store
 * 
 * Provides session/in-memory and Supabase-ready persistence for active case states,
 * unlocked evidence, interrogation transcripts, and red string connections.
 */

import type { CaseData, InterrogationEntry, RedStringConnection, CaseVerdict } from "@/types/case";

export interface CaseSessionState {
  caseId: string;
  caseData: CaseData;
  unlockedEvidenceIds: string[];
  examinedEvidenceIds: string[];
  interrogationLog: InterrogationEntry[];
  redStrings: RedStringConnection[];
  verdict?: CaseVerdict | null;
  lastUpdated: string;
}

// In-memory case cache (persists across serverless invocation warm instances)
const activeCaseSessions = new Map<string, CaseSessionState>();

export const CaseStore = {
  saveSession(session: CaseSessionState): void {
    activeCaseSessions.set(session.caseId, {
      ...session,
      lastUpdated: new Date().toISOString(),
    });
  },

  getSession(caseId: string): CaseSessionState | null {
    return activeCaseSessions.get(caseId) || null;
  },

  getAllSessionIds(): string[] {
    return Array.from(activeCaseSessions.keys());
  },

  clearSession(caseId: string): void {
    activeCaseSessions.delete(caseId);
  },
};
