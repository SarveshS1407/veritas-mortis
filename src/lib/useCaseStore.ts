"use client";

import { create } from 'zustand';
import { 
  GameState, 
  WorkspaceMode, 
  ActPhase, 
  Accusation, 
  CaseVerdict, 
  InterrogationEntry,
  SuspectArchetype,
  ComposureLevel,
  EvidenceNode
} from '@/types/case';
import { generateCase } from './proceduralGenerator';

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

export const useCaseStore = create<GameState>((set, get) => ({
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
    });
    try {
      const response = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: resolvedSeed })
      });
      if (response.ok) {
        const newCase = await response.json();
        set({ currentCase: newCase, currentAct: "act1_hook", isLoading: false });
      } else {
        throw new Error("API failed");
      }
    } catch {
      const localCase = generateCase(resolvedSeed);
      set({ currentCase: localCase, currentAct: "act1_hook", isLoading: false });
    }
  },

  setWorkspaceMode: (mode: WorkspaceMode) => set({ workspaceMode: mode }),
  setActiveSuspect: (id: string | null) => set({ activeSuspectId: id }),
  setActiveEvidence: (id: string | null) => set({ activeEvidenceId: id }),

  examineEvidence: (id: string) => set((state) => {
    if (!state.currentCase) return state;
    const evidenceList = state.currentCase.evidenceNodes || state.currentCase.evidence || [];
    const updatedEvidence = evidenceList.map((ev: EvidenceNode) => 
      ev.id === id && ev.status !== "analyzed" ? { ...ev, status: 'examined' as const } : ev
    );
    return {
      currentCase: {
        ...state.currentCase,
        evidenceNodes: updatedEvidence,
        evidence: updatedEvidence
      }
    };
  }),

  addRedString: (from: string, to: string, fromType?: string, toType?: string) => set((state) => ({
    redStrings: [...state.redStrings, {
      id: `rs_${Date.now()}_${Math.random()}`,
      fromNodeId: from,
      toNodeId: to,
      fromType,
      toType,
      isPlayerCreated: true
    }]
  })),

  removeRedString: (id: string) => set((state) => ({
    redStrings: state.redStrings.filter(rs => rs.id !== id)
  })),

  updateNodePosition: (nodeId: string, pos: { x: number; y: number }) => set((state) => ({
    boardNodePositions: { ...state.boardNodePositions, [nodeId]: pos }
  })),

  setForensicTool: (tool) => set({ activeForensicTool: tool }),

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
        return {
          currentCase: { ...s.currentCase, suspects: updatedSuspects },
          interrogationLog: [...s.interrogationLog, entry]
        };
      });
    };

    try {
      const response = await fetch('/api/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Local fallback logic
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

  advanceAct: () => set((state) => {
    if (state.currentAct === "act1_hook") return { currentAct: "act2_reversal" };
    if (state.currentAct === "act2_reversal") return { currentAct: "act3_climax" };
    return state;
  }),

  submitAccusation: (accusation: Accusation) => {
    const state = get();
    if (!state.currentCase) return;

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
    error: null
  })
}));
