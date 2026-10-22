"use client";

import { create } from "zustand";
import {
  GameState,
  WorkspaceMode,
  ActPhase,
  Accusation,
  CaseVerdict,
  InterrogationEntry,
  SuspectArchetype,
  ComposureLevel,
  EvidenceNode,
  RedStringConnection,
  CaseGraph
} from "@/types/case";
import { generateCase } from "./proceduralGenerator";
import { CasePersistence, GameSettings, DEFAULT_SETTINGS } from "./casePersistence";
import { forensicAudio } from "./forensicAudio";

const getComposureLevel = (stressOrComposure: number, isStress = false): ComposureLevel => {
  if (isStress) {
    if (stressOrComposure < 30) return "CALM";
    if (stressOrComposure < 60) return "DEFLECTING";
    if (stressOrComposure < 85) return "CORNERED";
    return "BROKEN";
  }
  if (stressOrComposure >= 75) return "CALM";
  if (stressOrComposure >= 50) return "DEFLECTING";
  if (stressOrComposure >= 25) return "CORNERED";
  return "BROKEN";
};

export interface ExtendedGameState extends GameState {
  settings: GameSettings;
  updateSettings: (patch: Partial<GameSettings>) => void;
  playerChoices: Record<string, string>;
  recordPlayerChoice: (choiceKey: string, choiceValue: string) => void;
  hasActiveSave: () => boolean;
  resumeSavedCase: () => boolean;
  activeCaseInfo: () => { caseNumber: string; title: string; victimName: string; currentAct: ActPhase; date: string } | null;
  triggerReversalSequence: () => void;
  isReversalOpen: boolean;
  closeReversal: () => void;
}

export const useCaseStore = create<ExtendedGameState>((set, get) => ({
  currentCase: null,
  isLoading: false,
  error: null,

  currentAct: "act1_hook",
  workspaceMode: "interrogation",
  activeSuspectId: null,
  activeEvidenceId: null,

  redStrings: [],
  boardNodePositions: {},

  interrogationLog: [],

  activeForensicTool: "none",
  evidenceTrayOrder: [],

  accusation: null,
  verdict: null,

  hasCompletedIntroGuide: false,
  isGuideOpen: true,

  isReversalOpen: false,
  playerChoices: {},
  settings: typeof window !== "undefined" ? CasePersistence.loadSettings() : DEFAULT_SETTINGS,

  updateSettings: (patch: Partial<GameSettings>) => {
    const updated = CasePersistence.saveSettings(patch);
    if (patch.masterVolume !== undefined) {
      forensicAudio.setMasterVolume(patch.masterVolume);
    }
    if (patch.isMuted !== undefined) {
      forensicAudio.setMuted(patch.isMuted);
    }
    set({ settings: updated });
  },

  recordPlayerChoice: (choiceKey: string, choiceValue: string) => {
    set((state) => {
      const nextChoices = { ...state.playerChoices, [choiceKey]: choiceValue };
      // Auto-save progress
      if (state.currentCase) {
        CasePersistence.saveActiveCase({
          caseData: state.currentCase,
          currentAct: state.currentAct,
          unlockedEvidenceIds: (state.currentCase.evidenceNodes || []).map(e => e.id),
          examinedEvidenceIds: (state.currentCase.evidenceNodes || []).filter(e => e.status === "examined" || e.status === "analyzed").map(e => e.id),
          interrogationLog: state.interrogationLog,
          redStrings: state.redStrings,
          boardNodePositions: state.boardNodePositions,
          activeForensicTool: state.activeForensicTool,
          hasCompletedIntroGuide: state.hasCompletedIntroGuide,
          playerChoices: nextChoices,
          lastSavedAt: new Date().toISOString()
        });
      }
      return { playerChoices: nextChoices };
    });
  },

  hasActiveSave: () => {
    return Boolean(CasePersistence.loadActiveCase());
  },

  activeCaseInfo: () => {
    const saved = CasePersistence.loadActiveCase();
    if (!saved?.caseData) return null;
    return {
      caseNumber: saved.caseData.caseNumber,
      title: saved.caseData.title,
      victimName: saved.caseData.victim.name,
      currentAct: saved.currentAct,
      date: saved.caseData.date
    };
  },

  resumeSavedCase: () => {
    const saved = CasePersistence.loadActiveCase();
    if (!saved?.caseData) return false;

    set({
      currentCase: saved.caseData,
      currentAct: saved.currentAct,
      interrogationLog: saved.interrogationLog || [],
      redStrings: saved.redStrings || [],
      boardNodePositions: saved.boardNodePositions || {},
      activeForensicTool: (saved.activeForensicTool as any) || "none",
      hasCompletedIntroGuide: saved.hasCompletedIntroGuide ?? true,
      playerChoices: saved.playerChoices || {},
      isLoading: false,
      error: null,
      accusation: null,
      verdict: null,
      activeSuspectId: saved.caseData.suspects?.[0]?.id || null,
      activeEvidenceId: null
    });
    return true;
  },

  generateNewCase: async (seed?: number) => {
    const resolvedSeed = typeof seed === "number" ? seed : Math.floor(Math.random() * 900000) + 100000;
    set({
      isLoading: true,
      error: null,
      interrogationLog: [],
      redStrings: [],
      activeSuspectId: null,
      activeEvidenceId: null,
      boardNodePositions: {},
      accusation: null,
      verdict: null,
      currentAct: "act1_hook",
      hasCompletedIntroGuide: false,
      isGuideOpen: true,
      playerChoices: {},
      isReversalOpen: false,
    });

    let newCase: CaseGraph;
    try {
      const response = await fetch("/api/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: resolvedSeed })
      });
      if (response.ok) {
        newCase = await response.json();
      } else {
        throw new Error("API failed");
      }
    } catch {
      newCase = generateCase(resolvedSeed);
    }

    set({
      currentCase: newCase,
      currentAct: "act1_hook",
      isLoading: false,
      activeSuspectId: newCase.suspects[0]?.id || null
    });

    // Save initial state to persistence
    CasePersistence.saveActiveCase({
      caseData: newCase,
      currentAct: "act1_hook",
      unlockedEvidenceIds: newCase.evidenceNodes.filter(e => e.unlocksInAct === "act1_hook").map(e => e.id),
      examinedEvidenceIds: [],
      interrogationLog: [],
      redStrings: [],
      boardNodePositions: {},
      activeForensicTool: "none",
      hasCompletedIntroGuide: false,
      playerChoices: {},
      lastSavedAt: new Date().toISOString()
    });
  },

  setWorkspaceMode: (mode: WorkspaceMode) => set({ workspaceMode: mode }),
  setActiveSuspect: (id: string | null) => set({ activeSuspectId: id }),
  setActiveEvidence: (id: string | null) => set({ activeEvidenceId: id }),

  examineEvidence: (id: string) => {
    set((state) => {
      if (!state.currentCase) return state;
      const evidenceList = state.currentCase.evidenceNodes || state.currentCase.evidence || [];
      const updatedEvidence = evidenceList.map((ev: EvidenceNode) =>
        ev.id === id && ev.status !== "analyzed" ? { ...ev, status: "examined" as const } : ev
      );
      const updatedCase = {
        ...state.currentCase,
        evidenceNodes: updatedEvidence,
        evidence: updatedEvidence
      };

      // Auto-save
      CasePersistence.saveActiveCase({
        caseData: updatedCase,
        currentAct: state.currentAct,
        unlockedEvidenceIds: updatedEvidence.map(e => e.id),
        examinedEvidenceIds: updatedEvidence.filter(e => e.status === "examined" || e.status === "analyzed").map(e => e.id),
        interrogationLog: state.interrogationLog,
        redStrings: state.redStrings,
        boardNodePositions: state.boardNodePositions,
        activeForensicTool: state.activeForensicTool,
        hasCompletedIntroGuide: state.hasCompletedIntroGuide,
        playerChoices: state.playerChoices,
        lastSavedAt: new Date().toISOString()
      });

      return { currentCase: updatedCase };
    });
  },

  addRedString: (from: string, to: string, fromType?: string, toType?: string) => {
    forensicAudio.playStringPluck();
    set((state) => {
      const nextStrings = [
        ...state.redStrings,
        {
          id: `rs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fromNodeId: from,
          toNodeId: to,
          fromType,
          toType,
          isPlayerCreated: true
        }
      ];

      if (state.currentCase) {
        CasePersistence.saveActiveCase({
          caseData: state.currentCase,
          currentAct: state.currentAct,
          unlockedEvidenceIds: (state.currentCase.evidenceNodes || []).map(e => e.id),
          examinedEvidenceIds: (state.currentCase.evidenceNodes || []).filter(e => e.status === "examined" || e.status === "analyzed").map(e => e.id),
          interrogationLog: state.interrogationLog,
          redStrings: nextStrings,
          boardNodePositions: state.boardNodePositions,
          activeForensicTool: state.activeForensicTool,
          hasCompletedIntroGuide: state.hasCompletedIntroGuide,
          playerChoices: state.playerChoices,
          lastSavedAt: new Date().toISOString()
        });
      }

      return { redStrings: nextStrings };
    });
  },

  removeRedString: (id: string) => {
    set((state) => ({
      redStrings: state.redStrings.filter(rs => rs.id !== id)
    }));
  },

  updateNodePosition: (nodeId: string, pos: { x: number; y: number }) => {
    set((state) => ({
      boardNodePositions: { ...state.boardNodePositions, [nodeId]: pos }
    }));
  },

  setForensicTool: (tool) => {
    if (tool === "uv_blacklight") {
      forensicAudio.playUvSwitch(true);
    } else {
      forensicAudio.playPhotoInspect();
    }
    set({ activeForensicTool: tool });
  },

  interrogateSuspect: async (suspectId: string, action: string, evidenceId?: string) => {
    const state = get();
    if (!state.currentCase) return;

    const suspect = state.currentCase.suspects.find((s: SuspectArchetype) => s.id === suspectId);
    if (!suspect) return;

    const applyResult = (
      suspectResponse: string,
      stressDelta: number,
      newStress: number,
      newComposureLevel: ComposureLevel,
      bodyLanguageCue?: string
    ) => {
      const entry: InterrogationEntry = {
        id: `int_${Date.now()}`,
        suspectId,
        playerAction: action,
        suspectResponse,
        evidenceUsed: evidenceId,
        composureDelta: stressDelta,
        bodyLanguageCue,
        timestamp: new Date().toISOString()
      };

      if (newComposureLevel === "CORNERED" || newComposureLevel === "BROKEN") {
        forensicAudio.playHeartbeat();
      }

      set((s) => {
        if (!s.currentCase) return s;
        const updatedSuspects = s.currentCase.suspects.map((sus: SuspectArchetype) => {
          if (sus.id === suspectId) {
            return {
              ...sus,
              stressLevel: newStress,
              composure: newComposureLevel,
              composureLevel: newComposureLevel,
              interrogationCount: (sus.interrogationCount ?? 0) + 1
            };
          }
          return sus;
        });

        const nextLog = [...s.interrogationLog, entry];

        // Auto-save
        CasePersistence.saveActiveCase({
          caseData: { ...s.currentCase, suspects: updatedSuspects },
          currentAct: s.currentAct,
          unlockedEvidenceIds: (s.currentCase.evidenceNodes || []).map(e => e.id),
          examinedEvidenceIds: (s.currentCase.evidenceNodes || []).filter(e => e.status === "examined" || e.status === "analyzed").map(e => e.id),
          interrogationLog: nextLog,
          redStrings: s.redStrings,
          boardNodePositions: s.boardNodePositions,
          activeForensicTool: s.activeForensicTool,
          hasCompletedIntroGuide: s.hasCompletedIntroGuide,
          playerChoices: s.playerChoices,
          lastSavedAt: new Date().toISOString()
        });

        return {
          currentCase: { ...s.currentCase, suspects: updatedSuspects },
          interrogationLog: nextLog
        };
      });
    };

    try {
      const response = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspectId,
          playerAction: action,
          evidenceId,
          currentStressLevel: suspect.stressLevel ?? 20,
          currentComposure: typeof suspect.composure === "number" ? suspect.composure : 100,
          contradictionClueId: suspect.contradictionClueId || suspect.contradictionEvidenceId,
          contradictionEvidenceId: suspect.contradictionClueId || suspect.contradictionEvidenceId,
          isGuilty: suspect.isGuilty,
          dialogueByComposure: suspect.dialogueByComposure,
        })
      });

      if (response.ok) {
        const data = await response.json();
        applyResult(
          data.responseDialogue || data.response,
          data.stressDelta ?? data.composureDelta ?? 10,
          data.newStressLevel ?? (100 - (data.newComposure ?? 80)),
          (data.newComposureLevel || data.newComposure || "CALM") as ComposureLevel,
          data.bodyLanguageCue
        );
      } else {
        throw new Error("API error");
      }
    } catch {
      // Procedural fallback
      const targetClue = suspect.contradictionClueId || suspect.contradictionEvidenceId;
      const isContradiction = evidenceId && targetClue && evidenceId === targetClue;
      const delta = isContradiction ? (30 + Math.floor(Math.random() * 10)) : (8 + Math.floor(Math.random() * 5));
      const currentStress = suspect.stressLevel ?? 20;
      const newStress = Math.min(100, currentStress + delta);
      const newComposureLevel = getComposureLevel(newStress, true);

      const responseLines = suspect.dialogueByComposure[newComposureLevel] || [];
      const suspectResponse = responseLines[Math.floor(Math.random() * responseLines.length)] || "...";
      const bodyLanguageCue = suspect.bodyLanguageCues?.[newComposureLevel] || "*[Remains silent]*";

      applyResult(suspectResponse, delta, newStress, newComposureLevel, bodyLanguageCue);
    }
  },

  advanceAct: () => {
    forensicAudio.playReversalImpact();
    set((state) => {
      let nextAct: ActPhase = state.currentAct;
      if (state.currentAct === "act1_hook") nextAct = "act2_reversal";
      else if (state.currentAct === "act2_reversal") nextAct = "act3_climax";

      if (state.currentCase) {
        CasePersistence.saveActiveCase({
          caseData: state.currentCase,
          currentAct: nextAct,
          unlockedEvidenceIds: (state.currentCase.evidenceNodes || []).map(e => e.id),
          examinedEvidenceIds: (state.currentCase.evidenceNodes || []).filter(e => e.status === "examined" || e.status === "analyzed").map(e => e.id),
          interrogationLog: state.interrogationLog,
          redStrings: state.redStrings,
          boardNodePositions: state.boardNodePositions,
          activeForensicTool: state.activeForensicTool,
          hasCompletedIntroGuide: state.hasCompletedIntroGuide,
          playerChoices: state.playerChoices,
          lastSavedAt: new Date().toISOString()
        });
      }

      return {
        currentAct: nextAct,
        isReversalOpen: nextAct === "act2_reversal"
      };
    });
  },

  triggerReversalSequence: () => set({ isReversalOpen: true }),
  closeReversal: () => set({ isReversalOpen: false }),

  submitAccusation: (accusation: Accusation) => {
    const state = get();
    if (!state.currentCase) return;

    forensicAudio.playStampSlam();

    const solution = state.currentCase.secretTruth || state.currentCase.solution;
    const evidenceList = state.currentCase.evidenceNodes || state.currentCase.evidence || [];
    let score = 0;

    const targetCulpritId = solution?.culpritId || solution?.killerId;
    const targetWeaponId = solution?.murderWeaponClueId || solution?.weaponEvidenceId || solution?.murderWeaponEvidenceId;

    const correctKiller = Boolean(targetCulpritId && accusation.accusedSuspectId === targetCulpritId);
    const correctWeapon = Boolean(!targetWeaponId || accusation.selectedWeaponEvidenceId === targetWeaponId);
    const correctMotive = Boolean(accusation.selectedMotiveIndex === (solution?.motiveIndex ?? 0));

    if (correctKiller) score += 50;
    if (correctWeapon) score += 25;
    if (correctMotive) score += 15;

    const totalEv = evidenceList.length || 8;
    const examinedCount = evidenceList.filter((e: EvidenceNode) => e.status === "examined" || e.status === "analyzed").length;
    const evidenceExaminedPercent = Math.round((examinedCount / totalEv) * 100);
    const evidenceScore = Math.round((evidenceExaminedPercent / 100) * 10);

    score += evidenceScore;

    let grade: "A" | "B" | "C" | "F" = "F";
    if (score >= 85) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 45) grade = "C";

    const narrativeSummary = solution?.fullNarrativeChronicle || solution?.fullNarrative || "Case closed.";

    const verdict: CaseVerdict = {
      grade,
      score,
      correctKiller,
      isKillerCorrect: correctKiller,
      correctMotive,
      isMotiveCorrect: correctMotive,
      correctWeapon,
      isWeaponCorrect: correctWeapon,
      evidenceExaminedPercent,
      interrogationsCompleted: state.interrogationLog.length,
      narrativeSummary,
      narrativeReveal: narrativeSummary,
    };

    // Archive this case permanently in CasePersistence
    CasePersistence.archiveCase(state.currentCase, verdict);
    // Clear active saved state since case is closed
    CasePersistence.clearActiveCase();

    set({ accusation, verdict });
  },

  setHasCompletedIntroGuide: (completed: boolean) => set({ hasCompletedIntroGuide: completed }),
  toggleGuide: () => set((s) => ({ isGuideOpen: !s.isGuideOpen })),

  resetGame: () => set({
    currentCase: null,
    currentAct: "act1_hook",
    workspaceMode: "interrogation",
    activeSuspectId: null,
    activeEvidenceId: null,
    redStrings: [],
    boardNodePositions: {},
    interrogationLog: [],
    activeForensicTool: "none",
    evidenceTrayOrder: [],
    accusation: null,
    verdict: null,
    hasCompletedIntroGuide: false,
    isGuideOpen: true,
    isLoading: false,
    error: null,
    isReversalOpen: false,
    playerChoices: {}
  })
}));
