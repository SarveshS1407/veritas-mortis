"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import ForensicToolDock from "./ForensicToolDock";
import { EvidenceNode } from "@/types/case";

export default function EvidenceBoard() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const activeForensicTool = useCaseStore((s) => s.activeForensicTool);
  const activeSuspectId = useCaseStore((s) => s.activeSuspectId);
  const activeEvidenceId = useCaseStore((s) => s.activeEvidenceId);
  const boardNodePositions = useCaseStore((s) => s.boardNodePositions);
  const currentAct = useCaseStore((s) => s.currentAct);
  const redStrings = useCaseStore((s) => s.redStrings);
  const addRedString = useCaseStore((s) => s.addRedString);
  const removeRedString = useCaseStore((s) => s.removeRedString);
  const setActiveSuspect = useCaseStore((s) => s.setActiveSuspect);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);
  const examineEvidence = useCaseStore((s) => s.examineEvidence);
  const updateNodePosition = useCaseStore((s) => s.updateNodePosition);

  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 1000, height: 800 });
  const [activeLinkingPin, setActiveLinkingPin] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Lightbox Inspection Modal State
  const [inspectedItem, setInspectedItem] = useState<{
    type: "suspect" | "evidence";
    data: any;
  } | null>(null);

  // Measure board dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!currentCase) return null;

  const suspects = currentCase.suspects || [];
  const evidenceList: EvidenceNode[] = currentCase.evidenceNodes || currentCase.evidence || [];

  const actOrder = ["act1_hook", "act2_reversal", "act3_climax"];
  const currentActIndex = actOrder.indexOf(currentAct);

  const visibleEvidence = evidenceList.filter((ev) => {
    const evActIndex = actOrder.indexOf(ev.unlocksInAct);
    return evActIndex <= currentActIndex;
  });

  const getNodePos = (nodeId: string, defaultPos?: { x: number; y: number }) => {
    return boardNodePositions[nodeId] || defaultPos || { x: 50, y: 50 };
  };

  const getComposureColor = (level: string = "CALM") => {
    switch (level) {
      case "CALM":
        return "bg-emerald-600";
      case "DEFLECTING":
        return "bg-amber-600";
      case "CORNERED":
        return "bg-orange-600";
      case "BROKEN":
        return "bg-red-700 animate-pulse";
      default:
        return "bg-emerald-600";
    }
  };

  // Calculate coordinates of pin in board pixel space
  const getNodePixelCoords = (nodeId: string) => {
    let pos = { x: 50, y: 50 };
    const s = suspects.find((sus) => sus.id === nodeId);
    if (s) pos = getNodePos(s.id, s.boardPosition);
    const e = visibleEvidence.find((ev) => ev.id === nodeId);
    if (e) pos = getNodePos(e.id, e.boardPosition || e.coordinates);

    return {
      x: (pos.x / 100) * boardDimensions.width,
      y: (pos.y / 100) * boardDimensions.height - 25,
    };
  };

  // Draw gravity sag quadratic bezier path
  const createSagCurveD = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const sag = Math.min(45, Math.max(12, dist * 0.12));
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + sag;
    return `M ${p1.x},${p1.y} Q ${midX},${midY} ${p2.x},${p2.y}`;
  };

  // Handle Pin click / tap for interactive red string connection
  const handlePinClick = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!activeLinkingPin) {
      forensicAudio.playStringPluck();
      setActiveLinkingPin(nodeId);
    } else if (activeLinkingPin === nodeId) {
      setActiveLinkingPin(null);
    } else {
      // Connect activeLinkingPin to nodeId
      const exists = redStrings.some(
        (c) =>
          (c.fromNodeId === activeLinkingPin && c.toNodeId === nodeId) ||
          (c.fromNodeId === nodeId && c.toNodeId === activeLinkingPin)
      );
      if (!exists) {
        addRedString(activeLinkingPin, nodeId);
      }
      setActiveLinkingPin(null);
    }
  };

  const isUVMode = activeForensicTool === "uv_blacklight";

  return (
    <div
      ref={boardRef}
      onMouseMove={(e) => {
        if (activeLinkingPin && boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      }}
      onClick={() => {
        if (activeLinkingPin) setActiveLinkingPin(null);
      }}
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-500 ${
        isUVMode ? "bg-[#080210]" : "bg-[#160F0B]"
      }`}
      style={{
        backgroundImage: isUVMode
          ? `radial-gradient(circle at 50% 50%, rgba(88,28,135,0.18) 0%, rgba(5,2,10,0.95) 100%)`
          : `
            radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0) 0%, rgba(10,5,2,0.7) 75%, rgba(5,2,1,0.95) 100%),
            radial-gradient(circle at 50% 50%, #4a2f1b 0%, #2e1a0c 70%, #150a04 100%)
          `,
        boxShadow: "inset 0 0 140px rgba(0,0,0,0.95)",
      }}
    >
      {/* ── UV Mode Glowing Ambient Light ── */}
      {isUVMode && (
        <div
          className="pointer-events-none absolute inset-0 z-0 animate-pulse"
          style={{
            background: "radial-gradient(circle at 45% 45%, rgba(168,85,247,0.15) 0%, transparent 60%)",
          }}
        />
      )}

      {/* ── Top Forensic Header ── */}
      <header className="absolute top-3 left-4 z-10 pointer-events-none">
        <h1 className="text-xs md:text-sm font-bold tracking-widest text-[#E8D7C3] uppercase drop-shadow-md">
          CASE #{currentCase.caseNumber} · DEDUCTION BOARD
        </h1>
        <p className="text-[8px] md:text-[9px] text-[#A68F7B] tracking-widest uppercase mt-0.5">
          {isUVMode
            ? "🔦 365NM UV BLACKLIGHT ACTIVE · LATENT TRACES VISIBLE"
            : "TAP/CLICK PINS TO DRAW RED STRING · TAP CARDS TO EXAMINE"}
        </p>
      </header>

      {/* ── Dynamic Red Yarn Strings SVG Overlay ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="yarn-fiber-board" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
          </filter>
        </defs>

        {redStrings.map((conn) => {
          const p1 = getNodePixelCoords(conn.fromNodeId);
          const p2 = getNodePixelCoords(conn.toNodeId);
          if (!p1 || !p2) return null;

          return (
            <g
              key={conn.id}
              className="pointer-events-auto cursor-pointer group"
              onClick={() => {
                forensicAudio.playStringPluck();
                removeRedString(conn.id);
              }}
            >
              {/* Thick hit area for easy clicking */}
              <path d={createSagCurveD(p1, p2)} stroke="transparent" strokeWidth="18" fill="none" />
              {/* Visible Crimson Yarn String */}
              <path
                d={createSagCurveD(p1, p2)}
                stroke="#8B0000"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                filter="url(#yarn-fiber-board)"
                className="group-hover:stroke-red-400 transition-colors"
                style={{
                  filter: "drop-shadow(0 3px 4px rgba(40,0,0,0.85))",
                }}
              />
            </g>
          );
        })}

        {/* Live Linking String Preview */}
        {activeLinkingPin && mousePos && (
          <path
            d={createSagCurveD(getNodePixelCoords(activeLinkingPin), mousePos)}
            stroke="#D42222"
            strokeWidth="2.4"
            strokeDasharray="5 4"
            fill="none"
          />
        )}
      </svg>

      {/* ── 1. SUSPECT POLAROID NODES ── */}
      {suspects.map((suspect, idx) => {
        const pos = getNodePos(suspect.id, suspect.boardPosition);
        const rotation = (idx % 2 === 0 ? -1 : 1) * (3 + (idx * 2) % 4);

        return (
          <motion.div
            key={suspect.id}
            drag
            dragConstraints={boardRef}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (!boardRef.current) return;
              const rect = boardRef.current.getBoundingClientRect();
              const x = Math.max(8, Math.min(92, ((info.point.x - rect.left) / rect.width) * 100));
              const y = Math.max(12, Math.min(88, ((info.point.y - rect.top) / rect.height) * 100));
              updateNodePosition(suspect.id, { x, y });
            }}
            onClick={() => {
              forensicAudio.playPaperSlide();
              setActiveSuspect(suspect.id);
            }}
            onDoubleClick={() => setInspectedItem({ type: "suspect", data: suspect })}
            className={`absolute w-[125px] md:w-[140px] cursor-grab active:cursor-grabbing z-20 transition-all ${
              activeSuspectId === suspect.id
                ? "ring-2 ring-[#8B0000] shadow-[0_0_25px_rgba(180,0,0,0.7)] scale-105"
                : "shadow-xl"
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            {/* 3D Pushpin */}
            <div
              onClick={(e) => handlePinClick(suspect.id, e)}
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-pointer z-30 shadow-lg border border-red-950 transition-transform hover:scale-125 ${
                activeLinkingPin === suspect.id ? "ring-2 ring-red-400 animate-ping" : ""
              }`}
              style={{
                background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #8B0000 65%, #300000 100%)",
              }}
              title="Click pin to link red yarn"
            />

            {/* Polaroid Card */}
            <div className="bg-[#FAF7F0] p-2 pb-4 rounded-xs border border-[#D5C9B5] shadow-lg">
              <div className="w-full h-20 md:h-24 bg-[#1E1714] border border-[#C5B7A0] flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-14 h-14 opacity-50 fill-[#D1C2AB]">
                  <circle cx="50" cy="35" r="18" />
                  <path d="M 20 85 C 20 60, 80 60, 80 85 Z" />
                </svg>
              </div>

              <div className="mt-1.5 text-center">
                <p className="font-serif font-bold text-[11px] md:text-xs text-[#1A1008] leading-tight truncate">
                  {suspect.name}
                </p>
                <p className="font-mono text-[8px] text-[#6B5A4B] font-bold uppercase truncate">
                  {suspect.occupation || suspect.role}
                </p>
              </div>

              {/* Stress / Composure status indicator */}
              <div className="mx-1 mt-1.5 h-1 bg-neutral-300 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getComposureColor(
                    suspect.composureLevel || (suspect.composure as string)
                  )}`}
                  style={{ width: `${Math.max(15, suspect.stressLevel || 20)}%` }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ── 2. FORENSIC EVIDENCE ITEMS ── */}
      {visibleEvidence.map((item, idx) => {
        const pos = getNodePos(item.id, item.boardPosition || item.coordinates);
        const rotation = (idx % 2 === 0 ? 1 : -1) * (2 + (idx * 2) % 5);
        const isUVHidden = item.type === "UV_HIDDEN" || Boolean(item.hiddenUVDetails);
        const isExamined = item.status === "examined" || item.status === "analyzed";

        return (
          <motion.div
            key={item.id}
            drag
            dragConstraints={boardRef}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (!boardRef.current) return;
              const rect = boardRef.current.getBoundingClientRect();
              const x = Math.max(8, Math.min(92, ((info.point.x - rect.left) / rect.width) * 100));
              const y = Math.max(12, Math.min(88, ((info.point.y - rect.top) / rect.height) * 100));
              updateNodePosition(item.id, { x, y });
            }}
            onClick={() => {
              forensicAudio.playPaperSlide();
              setActiveEvidence(item.id);
              examineEvidence(item.id);
            }}
            onDoubleClick={() => setInspectedItem({ type: "evidence", data: item })}
            className={`absolute cursor-grab active:cursor-grabbing z-20 transition-all ${
              activeEvidenceId === item.id
                ? "ring-2 ring-amber-500 shadow-[0_0_24px_rgba(200,150,50,0.7)] scale-105"
                : "shadow-md"
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            {/* 3D Pushpin */}
            <div
              onClick={(e) => handlePinClick(item.id, e)}
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full cursor-pointer z-30 shadow-lg border border-red-950 transition-transform hover:scale-125 ${
                activeLinkingPin === item.id ? "ring-2 ring-red-400 animate-ping" : ""
              }`}
              style={{
                background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #8B0000 65%, #300000 100%)",
              }}
              title="Click pin to link red yarn"
            />

            {/* Evidence Card Surface */}
            <div
              className={`w-[140px] md:w-[160px] p-2.5 rounded-xs border transition-all ${
                isUVMode && isUVHidden
                  ? "bg-[#180A28] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)] text-purple-200"
                  : isExamined
                  ? "bg-[#FAF7F0] border-[#C8BCA6] text-[#1A1008]"
                  : "bg-[#ECE4D0] border-[#B5A58E] text-[#2B1B10]"
              }`}
            >
              <div className="flex justify-between items-center text-[7px] font-mono font-bold uppercase pb-1 border-b border-black/15">
                <span className={isUVMode && isUVHidden ? "text-purple-400 font-black" : "text-[#8B0000]"}>
                  {item.type}
                </span>
                <span className="text-neutral-500">{item.unlocksInAct.toUpperCase()}</span>
              </div>

              <h4 className="font-serif font-bold text-[10px] md:text-[11px] uppercase mt-1 leading-tight line-clamp-2">
                {item.title || item.label}
              </h4>

              <p className="font-mono text-[7.5px] mt-1 line-clamp-2 opacity-80 leading-relaxed">
                {isUVMode && isUVHidden
                  ? item.hiddenUVDetails || "[365nm UV]: Latent chemical whorl revealed!"
                  : item.summary}
              </p>

              {/* Status Stamp */}
              <div className="mt-2 pt-1 border-t border-black/10 flex justify-between items-center text-[7px] font-mono">
                <span className="font-bold text-[#8A6830]">
                  {item.stampLabel || "SECURED"}
                </span>
                <span className={isExamined ? "text-emerald-700 font-bold" : "text-neutral-400"}>
                  {isExamined ? "EXAMINED" : "UNEXAMINED"}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Forensic Tool Dock (UV blacklight, magnifier, tape recorder) */}
      <div className="absolute bottom-3 left-4 z-20">
        <ForensicToolDock />
      </div>

      {/* ── Evidence Inspection Lightbox Modal ── */}
      <AnimatePresence>
        {inspectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectedItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full bg-[#EDE8D5] text-[#1A1817] p-6 md:p-8 rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-4 border-[#2A1808] cursor-default"
            >
              <div className="flex justify-between items-start border-b-2 border-[#1A1817] pb-3 mb-4">
                <div>
                  <span className="font-mono text-[9px] font-black tracking-widest text-[#8B0000] uppercase">
                    FORENSIC EXAMINATION
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wide text-[#1A1817] mt-0.5">
                    {inspectedItem.data.name || inspectedItem.data.title || inspectedItem.data.label}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="font-mono text-xs font-bold bg-[#2A1808] text-[#EDE8D5] px-2.5 py-1 rounded hover:bg-red-900 transition-colors cursor-pointer"
                >
                  ✕ ESC
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs text-neutral-800 leading-relaxed">
                <div className="p-3 bg-white/70 border border-neutral-300 rounded-sm">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                    Analysis Report:
                  </span>
                  <p>
                    {inspectedItem.data.fullForensicAnalysis ||
                      inspectedItem.data.fullAnalysis ||
                      inspectedItem.data.description ||
                      inspectedItem.data.alibiStatement}
                  </p>
                </div>

                {inspectedItem.data.hiddenUVDetails && (
                  <div className="p-3 bg-purple-100 border border-purple-300 rounded-sm text-purple-950 font-bold">
                    <span className="text-[9px] uppercase tracking-widest block mb-0.5">
                      365nm UV Luminescence Finding:
                    </span>
                    <p>{inspectedItem.data.hiddenUVDetails}</p>
                  </div>
                )}

                {inspectedItem.data.audioTranscript && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-amber-950">
                    <span className="text-[9px] font-bold uppercase tracking-widest block mb-0.5">
                      Switchboard Audio Transcript:
                    </span>
                    <p className="whitespace-pre-wrap italic">{inspectedItem.data.audioTranscript}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#1A1817]/20 flex justify-between items-center text-[9px] font-mono text-neutral-600">
                <span>VERITAS MORTIS CRIME ARCHIVE</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      forensicAudio.playTapeBeep();
                      setInspectedItem(null);
                      setWorkspaceMode("interrogation");
                    }}
                    className="px-3 py-1 bg-[#570B12] hover:bg-[#9D101D] text-white text-[9px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer shadow"
                  >
                    Confront in Interrogation →
                  </button>
                  <button
                    onClick={() => setInspectedItem(null)}
                    className="font-bold text-[#8B0000] hover:underline cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
