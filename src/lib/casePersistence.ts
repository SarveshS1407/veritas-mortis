/**
 * VERITAS MORTIS — Client Persistence & Case Archive Engine
 *
 * Handles reliable localStorage synchronization, active investigation saves,
 * historical case archive logging, and player accessibility preferences.
 */

import { CaseGraph, ActPhase, RedStringConnection, InterrogationEntry, CaseVerdict } from "@/types/case";

export interface StoredCaseState {
  caseData: CaseGraph;
  currentAct: ActPhase;
  unlockedEvidenceIds: string[];
  examinedEvidenceIds: string[];
  interrogationLog: InterrogationEntry[];
  redStrings: RedStringConnection[];
  boardNodePositions: Record<string, { x: number; y: number }>;
  activeForensicTool: string;
  hasCompletedIntroGuide: boolean;
  playerChoices: Record<string, string>;
  lastSavedAt: string;
}

export interface ArchivedCaseRecord {
  id: string;
  seed: number;
  caseNumber: string;
  title: string;
  victimName: string;
  dateCompleted: string;
  grade: "A" | "B" | "C" | "F";
  score: number;
  solved: boolean;
  culpritName: string;
  weaponLabel: string;
  motiveSummary: string;
  interrogationsCount: number;
  evidenceExaminedPercent: number;
  epilogueExcerpt: string;
}

export interface GameSettings {
  masterVolume: number; // 0.0 to 1.0
  isMuted: boolean;
  ambientSoundEnabled: boolean;
  textSpeed: "slow" | "normal" | "instant";
  reducedMotion: boolean;
  filmGrainEnabled: boolean;
}

const STORAGE_KEY_ACTIVE_CASE = "veritas_mortis_active_case_v2";
const STORAGE_KEY_ARCHIVE = "veritas_mortis_archive_v2";
const STORAGE_KEY_SETTINGS = "veritas_mortis_settings_v2";

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.75,
  isMuted: false,
  ambientSoundEnabled: true,
  textSpeed: "normal",
  reducedMotion: false,
  filmGrainEnabled: true,
};

export const CasePersistence = {
  // ── 1. Active Case Session ──
  saveActiveCase(state: StoredCaseState): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CASE, JSON.stringify(state));
    } catch (e) {
      console.warn("[CasePersistence] Failed to write active case to localStorage:", e);
    }
  },

  loadActiveCase(): StoredCaseState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_CASE);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredCaseState;
      if (parsed?.caseData?.seed && parsed.caseData.suspects?.length) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  clearActiveCase(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_CASE);
    } catch {}
  },

  // ── 2. Completed Cases Archive ──
  archiveCase(caseData: CaseGraph, verdict: CaseVerdict): ArchivedCaseRecord {
    const record: ArchivedCaseRecord = {
      id: `arch_${caseData.seed}_${Date.now()}`,
      seed: caseData.seed,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      victimName: caseData.victim.name,
      dateCompleted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      grade: verdict.grade,
      score: verdict.score,
      solved: verdict.isKillerCorrect,
      culpritName: caseData.suspects.find(s => s.isGuilty)?.name || "Unknown",
      weaponLabel: caseData.secretTruth.primaryMotive || "Unspecified",
      motiveSummary: caseData.secretTruth.motiveSummary,
      interrogationsCount: verdict.interrogationsCompleted,
      evidenceExaminedPercent: verdict.evidenceExaminedPercent,
      epilogueExcerpt: verdict.narrativeSummary || caseData.secretTruth.fullNarrativeChronicle.slice(0, 200) + "..."
    };

    if (typeof window !== "undefined") {
      try {
        const existing = this.getArchivedCases();
        const updated = [record, ...existing.filter(c => c.seed !== record.seed)];
        localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn("[CasePersistence] Failed to archive case:", e);
      }
    }

    return record;
  },

  getArchivedCases(): ArchivedCaseRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ARCHIVE);
      if (!raw) return [];
      return JSON.parse(raw) as ArchivedCaseRecord[];
    } catch {
      return [];
    }
  },

  // ── 3. Player Preferences & Settings ──
  loadSettings(): GameSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(patch: Partial<GameSettings>): GameSettings {
    const current = this.loadSettings();
    const updated = { ...current, ...patch };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  }
};
