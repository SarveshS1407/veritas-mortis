"use client";

import { create } from 'zustand';
import { 
  GameState, 
  WorkspaceMode, 
  ActPhase, 
  Accusation, 
  CaseVerdict, 
  InterrogationEntry,
  Suspect,
  ComposureLevel
} from '@/types/case';
import { generateCase } from './proceduralGenerator';

const getComposureLevel = (composure: number): ComposureLevel => {
  if (composure >= 75) return "CALM";
  if (composure >= 50) return "DEFLECTING";
  if (composure >= 25) return "CORNERED";
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

  generateNewCase: async (seed?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed })
      });
      if (response.ok) {
        const newCase = await response.json();
        set({ currentCase: newCase, currentAct: "act1_hook", isLoading: false });
      } else {
        throw new Error("API failed");
      }
    } catch (e) {
      const localCase = generateCase(seed);
      set({ currentCase: localCase, currentAct: "act1_hook", isLoading: false });
    }
  },

  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  setActiveSuspect: (id) => set({ activeSuspectId: id }),
  setActiveEvidence: (id) => set({ activeEvidenceId: id }),

  examineEvidence: (id) => set((state) => {
    if (!state.currentCase) return state;
    const updatedEvidence = state.currentCase.evidence.map(ev => 
      ev.id === id && ev.status !== "analyzed" ? { ...ev, status: 'examined' as const } : ev
    );
    return { currentCase: { ...state.currentCase, evidence: updatedEvidence } };
  }),

  addRedString: (from, to, fromType, toType) => set((state) => ({
    redStrings: [...state.redStrings, {
      id: `rs_${Date.now()}_${Math.random()}`,
      fromNodeId: from,
      toNodeId: to,
      fromType,
      toType,
      isPlayerCreated: true
    }]
  })),

  removeRedString: (id) => set((state) => ({
    redStrings: state.redStrings.filter(rs => rs.id !== id)
  })),

  updateNodePosition: (nodeId, pos) => set((state) => ({
    boardNodePositions: { ...state.boardNodePositions, [nodeId]: pos }
  })),

  setForensicTool: (tool) => set({ activeForensicTool: tool }),

  interrogateSuspect: async (suspectId, action, evidenceId?) => {
    const state = get();
    if (!state.currentCase) return;
    
    const suspect = state.currentCase.suspects.find(s => s.id === suspectId);
    if (!suspect) return;

    const applyResult = (suspectResponse: string, composureDelta: number, newComposure: number, newComposureLevel: ComposureLevel) => {
      const entry: InterrogationEntry = {
        id: `int_${Date.now()}`,
        suspectId,
        playerAction: action,
        suspectResponse,
        evidenceUsed: evidenceId,
        composureDelta,
        timestamp: new Date().toISOString()
      };

      set((s) => {
        if (!s.currentCase) return s;
        const updatedSuspects = s.currentCase.suspects.map(sus => {
          if (sus.id === suspectId) {
            return {
              ...sus,
              composure: newComposure,
              composureLevel: newComposureLevel,
              interrogationCount: sus.interrogationCount + 1
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
          currentComposure: suspect.composure,
          composureLevel: suspect.composureLevel,
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        applyResult(
          data.response,
          data.composureDelta,
          data.newComposure,
          data.newComposureLevel as ComposureLevel
        );
      } else {
        throw new Error("API error");
      }
    } catch {
      // Local fallback logic
      const isContradiction = evidenceId === suspect.contradictionEvidenceId;
      const delta = isContradiction ? -(25 + Math.floor(Math.random() * 10)) : -(5 + Math.floor(Math.random() * 8));
      const newComposure = Math.max(0, suspect.composure + delta);
      const newComposureLevel = getComposureLevel(newComposure);
      
      const responseLines = suspect.dialogueByComposure[newComposureLevel] || [];
      const suspectResponse = responseLines[Math.floor(Math.random() * responseLines.length)] || "...";
      
      applyResult(suspectResponse, delta, newComposure, newComposureLevel);
    }
  },

  advanceAct: () => set((state) => {
    if (state.currentAct === "act1_hook") return { currentAct: "act2_reversal" };
    if (state.currentAct === "act2_reversal") return { currentAct: "act3_climax" };
    return state;
  }),

  submitAccusation: (accusation) => {
    const state = get();
    if (!state.currentCase) return;

    const { solution, evidence } = state.currentCase;
    let score = 0;

    const correctKiller = accusation.accusedSuspectId === solution.killerId;
    const correctWeapon = accusation.selectedWeaponEvidenceId === solution.weaponEvidenceId;
    const correctMotive = accusation.selectedMotiveIndex === solution.motiveIndex;
    
    if (correctKiller) score += 40;
    if (correctMotive) score += 25;
    if (correctWeapon) score += 20;

    const examinedCount = evidence.filter(e => e.status === "examined" || e.status === "analyzed").length;
    const evidenceExaminedPercent = (examinedCount / evidence.length) * 100;
    const evidenceScore = (evidenceExaminedPercent / 100) * 15;
    
    score += evidenceScore;

    let grade: "A" | "B" | "C" | "F" = "F";
    if (score >= 85) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 45) grade = "C";

    const verdict: CaseVerdict = {
      grade,
      correctKiller,
      correctMotive,
      correctWeapon,
      evidenceExaminedPercent,
      interrogationsCompleted: state.interrogationLog.length,
      narrativeSummary: solution.fullNarrative
    };

    set({ accusation, verdict });
  },

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
    isLoading: false,
    error: null
  })
}));
