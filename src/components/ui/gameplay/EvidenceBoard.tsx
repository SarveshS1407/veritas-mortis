"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import ForensicToolDock from "./ForensicToolDock";

interface DynamicConnection {
  id: string;
  from: string;
  to: string;
  color: "red" | "green";
}

export default function EvidenceBoard() {
  const currentCase = useCaseStore((s) => s.currentCase);
  const activeForensicTool = useCaseStore((s) => s.activeForensicTool);
  const activeSuspectId = useCaseStore((s) => s.activeSuspectId);
  const activeEvidenceId = useCaseStore((s) => s.activeEvidenceId);
  const boardNodePositions = useCaseStore((s) => s.boardNodePositions);
  const currentAct = useCaseStore((s) => s.currentAct);
  const setActiveSuspect = useCaseStore((s) => s.setActiveSuspect);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);
  const examineEvidence = useCaseStore((s) => s.examineEvidence);
  const updateNodePosition = useCaseStore((s) => s.updateNodePosition);

  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 1000, height: 800 });

  // ── Dynamic Connections (Red = Confirmed Suspect, Green = Cleared Alibi) ──
  const [connections, setConnections] = useState<DynamicConnection[]>([
    { id: "c1", from: "suspect-0", to: "ev-0", color: "red" },
    { id: "c2", from: "ev-0", to: "ev-1", color: "red" },
    { id: "c3", from: "suspect-1", to: "ev-2", color: "green" },
    { id: "c4", from: "ev-2", to: "sticky-1", color: "green" },
    { id: "c5", from: "sticky-1", to: "sticky-2", color: "red" },
  ]);

  const [activeLinkingPin, setActiveLinkingPin] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // ── Encrypted Terminal State ──
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "CYBER FORENSICS MAINFRAME v4.19 [SECURE]",
    "TYPE 'HELP' OR ENTER DECRYPTION PASSCODE (e.g. 1978)",
  ]);
  const [isDecryptedNodeUnlocked, setIsDecryptedNodeUnlocked] = useState(false);

  // ── Lightbox Inspection Modal State ──
  const [inspectedItem, setInspectedItem] = useState<{
    type: "suspect" | "blood_report" | "fingerprint" | "notebook" | "sticky" | "decrypted";
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

  const suspects = currentCase.suspects;
  const actOrder = ["act1_hook", "act2_reversal", "act3_climax"];
  const currentActIndex = actOrder.indexOf(currentAct);
  const visibleEvidence = currentCase.evidence.filter((ev) => {
    const evActIndex = actOrder.indexOf(ev.unlocksInAct);
    return evActIndex <= currentActIndex;
  });

  const getNodePos = (nodeId: string, defaultPos: { x: number; y: number }) => {
    return boardNodePositions[nodeId] || defaultPos;
  };

  const getComposureColor = (composure: number) => {
    if (composure > 70) return "bg-green-700";
    if (composure > 40) return "bg-yellow-600";
    return "bg-red-700";
  };

  // Calculate coordinates of pin in board pixel space
  const getNodePixelCoords = (nodeId: string) => {
    let pos = { x: 50, y: 50 };
    const s = suspects.find((sus) => sus.id === nodeId);
    if (s) pos = getNodePos(s.id, s.boardPosition);
    const e = visibleEvidence.find((ev) => ev.id === nodeId);
    if (e) pos = getNodePos(e.id, e.boardPosition);
    if (nodeId === "sticky-1") pos = getNodePos("sticky-1", { x: 78, y: 45 });
    if (nodeId === "sticky-2") pos = getNodePos("sticky-2", { x: 82, y: 72 });
    if (nodeId === "node-decrypted") pos = getNodePos("node-decrypted", { x: 38, y: 58 });

    return {
      x: (pos.x / 100) * boardDimensions.width,
      y: (pos.y / 100) * boardDimensions.height - 30, // top center pushpin offset
    };
  };

  // Draw gravity sag quadratic bezier path
  const createSagCurveD = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const sag = Math.min(50, Math.max(15, dist * 0.12));
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + sag;
    return `M ${p1.x},${p1.y} Q ${midX},${midY} ${p2.x},${p2.y}`;
  };

  // Toggle yarn string between Red and Green
  const toggleStringColor = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color: c.color === "red" ? "green" : "red" } : c))
    );
  };

  // Handle Pin click for interactive string drawing
  const handlePinClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeLinkingPin) {
      setActiveLinkingPin(nodeId);
    } else if (activeLinkingPin === nodeId) {
      setActiveLinkingPin(null);
    } else {
      // Connect activeLinkingPin to nodeId
      const exists = connections.some(
        (c) =>
          (c.from === activeLinkingPin && c.to === nodeId) ||
          (c.from === nodeId && c.to === activeLinkingPin)
      );
      if (!exists) {
        setConnections((prev) => [
          ...prev,
          {
            id: `c-${Date.now()}`,
            from: activeLinkingPin,
            to: nodeId,
            color: "red",
          },
        ]);
      }
      setActiveLinkingPin(null);
    }
  };

  // Handle terminal command execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    setTerminalInput("");
    if (!cmd) return;

    const newLogs = [...terminalLogs, `> ${cmd}`];

    if (cmd === "help") {
      newLogs.push("COMMANDS: STATUS, CLEAR, 1978, VERITAS, DECRYPT");
    } else if (cmd === "status") {
      newLogs.push(`LEADS: ${visibleEvidence.length} | SUSPECTS: ${suspects.length} | STRINGS: ${connections.length}`);
    } else if (cmd === "clear") {
      setTerminalLogs([]);
      return;
    } else if (cmd === "1978" || cmd === "veritas" || cmd === "decrypt") {
      newLogs.push("[AUTH GRANTED] DECRYPTING ENCRYPTED TRANSMISSION...");
      newLogs.push("[SUCCESS] HIDDEN WIRETAP EVIDENCE PINNED TO BOARD.");
      setIsDecryptedNodeUnlocked(true);
      setConnections((prev) => [
        ...prev,
        { id: `c-dec-1`, from: "ev-0", to: "node-decrypted", color: "red" },
        { id: `c-dec-2`, from: "node-decrypted", to: "suspect-0", color: "red" },
      ]);
    } else {
      newLogs.push(`ERR: PASSCODE '${cmd}' INVALID. ACCESS DENIED.`);
    }

    setTerminalLogs(newLogs);
  };

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
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0) 0%, rgba(10,5,2,0.7) 75%, rgba(5,2,1,0.95) 100%),
          url('/image_559261.jpg'),
          radial-gradient(circle at 50% 50%, #7d4e2d 0%, #523118 60%, #2e1a0c 100%)
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "inset 0 0 140px rgba(0,0,0,0.9)",
      }}
    >
      {/* ── AMBIENT OVERHEAD SPOTLIGHT VIGNETTE ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,235,180,0.09) 0%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* ── TOP FORENSIC HEADER ── */}
      <header className="absolute top-3 left-5 z-10 pointer-events-none">
        <h1 className="text-sm md:text-base font-black tracking-widest text-[#e8d7c3] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          CASE #{currentCase.id.slice(0, 8)} • EVIDENCE BOARD
        </h1>
        <p className="text-[9px] md:text-[10px] text-[#9b856f] tracking-widest uppercase">
          DRAG TO REPOSITION • CLICK PIN TO LINK • DBL-CLICK TO INSPECT
        </p>
      </header>

      {/* ── DYNAMIC CURVED YARN STRING OVERLAY (RED & GREEN WITH GRAVITY SAG) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="yarn-fiber-board" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
          </filter>
        </defs>

        {connections.map((conn) => {
          const p1 = getNodePixelCoords(conn.from);
          const p2 = getNodePixelCoords(conn.to);
          if (!p1 || !p2) return null;

          return (
            <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => toggleStringColor(conn.id)}>
              {/* Thick invisible hit area for easy clicking */}
              <path d={createSagCurveD(p1, p2)} stroke="transparent" strokeWidth="16" fill="none" />
              {/* Visible Yarn String */}
              <path
                d={createSagCurveD(p1, p2)}
                stroke={conn.color === "red" ? "#a80c0c" : "#1b8a3e"}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                filter="url(#yarn-fiber-board)"
                style={{
                  filter:
                    conn.color === "red"
                      ? "drop-shadow(0 3px 4px rgba(40,0,0,0.75))"
                      : "drop-shadow(0 3px 4px rgba(0,30,10,0.75))",
                }}
              />
            </g>
          );
        })}

        {/* Live Linking Preview String */}
        {activeLinkingPin && mousePos && (
          <path
            d={createSagCurveD(getNodePixelCoords(activeLinkingPin), mousePos)}
            stroke="#d42222"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
          />
        )}
      </svg>

      {/* ── 1. SUSPECT POLAROID NODES ── */}
      {suspects.map((suspect, idx) => {
        const pos = getNodePos(suspect.id, suspect.boardPosition);
        const rotation = (idx % 2 === 0 ? -1 : 1) * (4 + (idx * 2) % 4);

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
              const x = Math.max(5, Math.min(95, ((info.point.x - rect.left) / rect.width) * 100));
              const y = Math.max(5, Math.min(95, ((info.point.y - rect.top) / rect.height) * 100));
              updateNodePosition(suspect.id, { x, y });
            }}
            onClick={() => setActiveSuspect(suspect.id)}
            onDoubleClick={() => setInspectedItem({ type: "suspect", data: suspect })}
            className={`absolute w-[140px] cursor-grab active:cursor-grabbing z-20 transition-shadow ${
              activeSuspectId === suspect.id ? "ring-2 ring-crimson shadow-[0_0_24px_rgba(180,0,0,0.65)]" : ""
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
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-pointer z-30 shadow-[0_4px_8px_rgba(0,0,0,0.8)] border border-red-950 transition-transform hover:scale-125 ${
                activeLinkingPin === suspect.id ? "ring-2 ring-red-500 animate-ping" : ""
              }`}
              style={{
                background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #b30000 55%, #4a0000 100%)",
              }}
              title="Click pin to link yarn string"
            />

            {/* Vintage Polaroid Card */}
            <div className="bg-[#fdfbf7] p-2 pb-5 rounded-xs shadow-[0_10px_24px_rgba(0,0,0,0.65)] border border-[#e2dacb]">
              <div className="w-full h-24 bg-[#231b17] border border-[#d2c7b5] flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-60 fill-[#d1c2ab]">
                  <circle cx="50" cy="35" r="18" />
                  <path d="M 20 85 C 20 60, 80 60, 80 85 Z" />
                </svg>
                {suspect.isGuilty && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="font-serif font-black text-[12px] text-[#1a1008] leading-tight truncate">
                  {suspect.name}
                </p>
                <p className="font-mono text-[8.5px] text-[#6b5a4b] font-bold uppercase truncate">
                  {suspect.role}
                </p>
              </div>
              {/* Composure meter */}
              <div className="mx-1 mt-2 h-1 bg-zinc-300 rounded-full overflow-hidden border border-zinc-400">
                <div
                  className={`h-full transition-all duration-500 ${getComposureColor(suspect.composure)}`}
                  style={{ width: `${suspect.composure}%` }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ── 2. FORENSIC EVIDENCE ITEMS ── */}
      {visibleEvidence.map((item, idx) => {
        const pos = getNodePos(item.id, item.boardPosition);
        const rotation = (idx % 2 === 0 ? 1 : -1) * (3 + (idx * 3) % 6);
        const isBloodReport = item.category === "autopsy" || item.category === "toxicology";
        const isFingerprint = item.category === "fingerprint";

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
              const x = Math.max(5, Math.min(95, ((info.point.x - rect.left) / rect.width) * 100));
              const y = Math.max(5, Math.min(95, ((info.point.y - rect.top) / rect.height) * 100));
              updateNodePosition(item.id, { x, y });
            }}
            onClick={() => {
              setActiveEvidence(item.id);
              examineEvidence(item.id);
            }}
            onDoubleClick={() =>
              setInspectedItem({
                type: isBloodReport ? "blood_report" : isFingerprint ? "fingerprint" : "notebook",
                data: item,
              })
            }
            className={`absolute cursor-grab active:cursor-grabbing z-20 transition-shadow ${
              activeEvidenceId === item.id ? "ring-2 ring-amber-500 shadow-[0_0_24px_rgba(200,150,50,0.6)]" : ""
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
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-pointer z-30 shadow-[0_4px_8px_rgba(0,0,0,0.8)] border border-red-950 transition-transform hover:scale-125 ${
                activeLinkingPin === item.id ? "ring-2 ring-red-500 animate-ping" : ""
              }`}
              style={{
                background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #b30000 55%, #4a0000 100%)",
              }}
              title="Click pin to link yarn string"
            />

            {/* A. Official Blood Analyst Medical Report Document */}
            {isBloodReport && (
              <div className="w-[180px] bg-[#f4ede1] p-3 border border-[#d4c8b4] rounded-xs shadow-[0_10px_24px_rgba(0,0,0,0.65)] relative overflow-hidden">
                <div className="flex justify-between items-center text-[7.5px] font-mono font-black border-b border-[#2b180d] pb-1 text-[#2b180d]">
                  <span>DIV. 09 PATHOLOGY</span>
                  <span>LAB #B-774</span>
                </div>
                <p className="font-serif font-black text-[10px] text-[#1c120c] uppercase mt-1 leading-tight">
                  {item.title}
                </p>
                <div className="text-[7.5px] font-mono text-[#3d2f24] mt-1 space-y-0.5">
                  <p>STATUS: EXAMINED</p>
                  <p className="line-clamp-2">{item.summary}</p>
                </div>
                {/* Rotated Red CONFIDENTIAL Stamp */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-18 border-2 border-dashed border-[#a00c0c] text-[#a00c0c] font-mono font-black text-[10px] tracking-widest px-2 py-0.5 pointer-events-none opacity-85"
                  style={{ mixBlendMode: "multiply" }}
                >
                  CONFIDENTIAL
                </div>
              </div>
            )}

            {/* B. Acetate Fingerprint Scan */}
            {isFingerprint && (
              <div className="w-[150px] bg-white/45 backdrop-blur-[3px] p-3 border border-white/75 rounded-xs shadow-[0_10px_24px_rgba(0,0,0,0.5)] flex flex-col items-center">
                <span className="text-[7.5px] font-mono font-black tracking-widest text-[#1a1209] uppercase">
                  LATENT PRINT LIFT
                </span>
                <svg className="w-16 h-18 my-1 opacity-85 mix-blend-multiply" viewBox="0 0 100 120">
                  <g fill="none" stroke="#2b1408" strokeWidth="2" strokeLinecap="round">
                    <ellipse cx="50" cy="60" rx="8" ry="12" />
                    <ellipse cx="50" cy="60" rx="16" ry="24" strokeDasharray="45 5" />
                    <ellipse cx="50" cy="60" rx="24" ry="36" strokeDasharray="70 8" />
                    <ellipse cx="50" cy="60" rx="32" ry="46" strokeDasharray="90 12" />
                  </g>
                </svg>
                <p className="font-mono text-[8px] font-bold text-[#1a1209] text-center truncate w-full">
                  {item.title}
                </p>
              </div>
            )}

            {/* C. Default Tag / Torn Notebook Document */}
            {!isBloodReport && !isFingerprint && (
              <div className="w-[160px] bg-[#fffcee] p-3 rounded-xs shadow-[0_8px_20px_rgba(0,0,0,0.6)] border-l-4 border-amber-800">
                <span className="font-mono text-[7px] font-black uppercase text-amber-900 bg-amber-100 px-1 py-0.5 rounded">
                  {item.category}
                </span>
                <h4 className="font-serif font-black text-[11px] text-[#1a1008] uppercase mt-1 leading-tight">
                  {item.title}
                </h4>
                <p className="font-mono text-[8px] text-[#4a3b2c] mt-1 line-clamp-2">
                  {item.summary}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* ── 3. NEON STICKY NOTES ── */}
      {/* Yellow Sticky */}
      <motion.div
        drag
        dragConstraints={boardRef}
        dragElastic={0.08}
        dragMomentum={false}
        className="absolute w-[120px] h-[120px] bg-[#fff44f] p-3 rounded-xs shadow-[0_8px_20px_rgba(0,0,0,0.6)] z-20 cursor-grab active:cursor-grabbing rotate-6 flex flex-col justify-center items-center text-center"
        style={{ left: "76%", top: "42%" }}
      >
        <div
          onClick={(e) => handlePinClick("sticky-1", e)}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full cursor-pointer z-30 shadow-md"
          style={{ background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #900 100%)" }}
        />
        <p className="font-handwriting text-xs text-[#2e2600] font-black leading-tight">
          ALIBI SHATTERED!<br />Train #4 departed 22:15!
        </p>
      </motion.div>

      {/* Coral Sticky */}
      <motion.div
        drag
        dragConstraints={boardRef}
        dragElastic={0.08}
        dragMomentum={false}
        className="absolute w-[120px] h-[120px] bg-[#ff5e62] p-3 rounded-xs shadow-[0_8px_20px_rgba(0,0,0,0.6)] z-20 cursor-grab active:cursor-grabbing -rotate-8 flex flex-col justify-center items-center text-center"
        style={{ left: "80%", top: "70%" }}
      >
        <div
          onClick={(e) => handlePinClick("sticky-2", e)}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full cursor-pointer z-30 shadow-md"
          style={{ background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #900 100%)" }}
        />
        <p className="font-handwriting text-xs text-[#2b0204] font-black leading-tight">
          MOTIVE:<br />Missing 1978 Ledger!
        </p>
      </motion.div>

      {/* ── 4. HIDDEN ENCRYPTED EVIDENCE (Unlocked via Terminal) ── */}
      <AnimatePresence>
        {isDecryptedNodeUnlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 15 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            drag
            dragConstraints={boardRef}
            dragElastic={0.08}
            className="absolute w-[190px] bg-[#e8dfcf] p-3 rounded-xs border-2 border-red-900 shadow-[0_12px_28px_rgba(0,0,0,0.85)] z-25 cursor-grab active:cursor-grabbing"
            style={{ left: "38%", top: "58%" }}
            onDoubleClick={() =>
              setInspectedItem({
                type: "decrypted",
                data: {
                  title: "DECRYPTED WIRETAP INTERCEPT",
                  description:
                    "Transcript recorded at 23:42 from Phone Booth 09: 'The package is secured in the 4th floor incinerator. Eliminate the coroner.'",
                },
              })
            }
          >
            <div
              onClick={(e) => handlePinClick("node-decrypted", e)}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-pointer z-30 shadow-md"
              style={{ background: "radial-gradient(circle at 35% 35%, #ff4d4d 0%, #900 100%)" }}
            />
            <div className="flex justify-between items-center text-[8px] font-mono font-black text-red-950 border-b border-red-900/60 pb-1">
              <span>[DECRYPTED INTEL]</span>
              <span>WIRETAP #9</span>
            </div>
            <p className="font-mono text-[9px] font-black text-red-950 mt-1.5 leading-snug">
              "Eliminate the coroner before dawn."
            </p>
            <div className="mt-2 text-right">
              <span className="border border-green-800 text-green-800 font-mono font-black text-[8px] px-1.5 py-0.5 uppercase">
                VERIFIED AUDIO
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. ENCRYPTED TERMINAL BOX (Bottom Right CRT Window) ── */}
      <div className="absolute bottom-16 right-4 w-[280px] md:w-[320px] h-[190px] bg-[#080a08] border border-[#224422] rounded-xs shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_12px_rgba(34,187,34,0.15)] z-30 flex flex-col overflow-hidden font-mono">
        <div className="bg-[#112211] px-2.5 py-1 text-[10px] text-[#44dd44] flex justify-between items-center border-b border-[#224422]">
          <span>FORENSIC_TERMINAL v4.19</span>
          <span className="animate-pulse">● ONLINE</span>
        </div>
        <div className="flex-1 p-2 text-[#33ff33] text-[10.5px] overflow-y-auto flex flex-col justify-end space-y-1">
          {terminalLogs.slice(-4).map((log, i) => (
            <div key={i} className="leading-tight break-all">
              {log}
            </div>
          ))}
          <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 pt-1 border-t border-[#1a331a]">
            <span className="text-[#44dd44] font-black">&gt;</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Enter passcode (try: 1978)"
              className="w-full bg-transparent text-[#33ff33] text-[11px] outline-none placeholder-[#225522] caret-[#33ff33]"
            />
          </form>
        </div>
      </div>

      {/* Forensic Tool Dock at bottom */}
      <div className="absolute bottom-3 left-4 z-20">
        <ForensicToolDock />
      </div>

      {/* ── 6. INSPECTION MODE (LIGHTBOX ZOOM MODAL) ── */}
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
              initial={{ scale: 0.75, rotate: -2 }}
              animate={{ scale: 1.3, rotate: 0 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full bg-[#EDE8D5] text-[#1A1817] p-6 rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-4 border-[#2A1808] cursor-default"
            >
              <div className="flex justify-between items-start border-b-2 border-[#1A1817] pb-2 mb-3">
                <div>
                  <span className="font-mono text-[9px] font-black tracking-widest text-[#7A0C0C] bg-red-100 px-2 py-0.5 border border-red-300 uppercase">
                    FORENSIC ARCHIVE INSPECTION
                  </span>
                  <h3 className="font-serif text-xl font-black mt-1 uppercase tracking-wide text-[#1A1817]">
                    {inspectedItem.data.name || inspectedItem.data.title}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="font-mono text-[10px] font-black bg-[#2A1808] text-[#EDE8D5] px-2 py-0.5 rounded hover:bg-red-900 transition-colors"
                >
                  ✕ ESC
                </button>
              </div>
              <p className="font-mono text-xs text-[#2b180d] leading-relaxed">
                {inspectedItem.data.description || inspectedItem.data.motive || inspectedItem.data.alibi}
              </p>
              <div className="mt-4 pt-2 border-t border-[#1A1817]/30 flex justify-between items-center text-[8.5px] font-mono text-neutral-600 font-bold">
                <span>VERITAS MORTIS LAB ARCHIVE</span>
                <span>CLICK OUTSIDE TO CLOSE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
