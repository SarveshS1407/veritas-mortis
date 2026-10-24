"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaseStore } from "@/lib/useCaseStore";
import { forensicAudio } from "@/lib/forensicAudio";
import { LocationId, LocationHotspot, InvestigationLocation } from "@/types/case";

interface LocationInvestigationViewProps {
  onOpenInterrogation?: (suspectId?: string) => void;
  onOpenBoard?: () => void;
}

export default function LocationInvestigationView({
  onOpenInterrogation,
  onOpenBoard,
}: LocationInvestigationViewProps) {
  const currentCase = useCaseStore((s) => s.currentCase);
  const currentLocationId = useCaseStore((s) => s.currentLocationId);
  const setCurrentLocation = useCaseStore((s) => s.setCurrentLocation);
  const examineHotspot = useCaseStore((s) => s.examineHotspot);
  const activeForensicTool = useCaseStore((s) => s.activeForensicTool);
  const setForensicTool = useCaseStore((s) => s.setForensicTool);
  const setWorkspaceMode = useCaseStore((s) => s.setWorkspaceMode);
  const setActiveEvidence = useCaseStore((s) => s.setActiveEvidence);

  const [selectedHotspot, setSelectedHotspot] = useState<LocationHotspot | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExamining, setIsExamining] = useState<boolean>(false);

  if (!currentCase) return null;

  const locations: InvestigationLocation[] = currentCase.locations || [];
  const currentLocation = locations.find((l) => l.id === currentLocationId) || locations[0] || {
    id: "crime_scene",
    name: currentCase.crimeSceneLocation,
    subtitle: "PRIMARY HOMICIDE SCENE",
    description: "The primary scene where the decedent was discovered.",
    atmosphereTone: "Disturbed, tense silence. Dust drifts across chalk markings.",
    unlockedInAct: "act1_hook",
    hotspots: [],
  };

  const getBackdropImage = (locId: LocationId) => {
    switch (locId) {
      case "crime_scene":
        return "/crimescene.jpg";
      case "victim_residence":
        return "/detective-desk.jpg";
      case "forensic_lab":
        return "/forensic-body.jpg";
      case "police_archive":
        return "/coroner-report.jpg";
      case "interrogation_room":
        return "/mugshot-dark.jpg";
      case "restricted_site":
        return "/evidence-weapon.jpg";
      default:
        return "/crimescene.jpg";
    }
  };

  const handleHotspotClick = (hs: LocationHotspot) => {
    forensicAudio.playPhotoInspect();
    setSelectedHotspot(hs);
    examineHotspot(hs.id);
  };

  const handleInspectFullEvidence = (evId?: string) => {
    if (evId) {
      setActiveEvidence(evId);
      if (onOpenBoard) onOpenBoard();
      else setWorkspaceMode("evidence_board");
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#090909] text-[#C3B69C] overflow-hidden select-none font-mono">
      {/* ── 1. LOCATION DISPATCH TAPE / NAVIGATION RIBBON ── */}
      <nav className="relative z-20 w-full bg-[#151313]/95 border-b border-[#570B12] px-4 py-2 flex items-center justify-between overflow-x-auto text-xs backdrop-blur-md">
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <span className="text-[10px] text-[#9D101D] uppercase font-bold tracking-widest hidden sm:inline">
            DISPATCH SECTORS:
          </span>
          {locations.map((loc) => {
            const isActive = loc.id === currentLocation.id;
            const examinedCount = loc.hotspots.filter((h) => h.isExamined).length;
            const totalCount = loc.hotspots.length;

            return (
              <button
                key={loc.id}
                onClick={() => {
                  forensicAudio.playPaperSlide();
                  setCurrentLocation(loc.id);
                  setSelectedHotspot(null);
                }}
                className={`relative px-3 py-1.5 rounded-sm transition-all duration-200 border text-left flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#570B12]/80 border-[#D21F2B] text-white shadow-[0_0_12px_rgba(210,31,43,0.3)] font-bold"
                    : "bg-[#090909]/70 border-zinc-800 hover:border-zinc-600 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#D21F2B] animate-ping" : "bg-neutral-600"}`} />
                <span className="text-[11px] uppercase tracking-wider truncate max-w-[130px] md:max-w-none">
                  {loc.name}
                </span>
                {totalCount > 0 && (
                  <span className={`text-[9px] px-1 py-0.2 rounded ${isActive ? "bg-black/50 text-[#C3B69C]" : "text-neutral-500"}`}>
                    {examinedCount}/{totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Tool Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-neutral-400">
          <span className="text-zinc-600">ACTIVE DETECTOR:</span>
          <button
            onClick={() => {
              const nextTool = activeForensicTool === "uv_blacklight" ? "none" : "uv_blacklight";
              setForensicTool(nextTool);
              forensicAudio.playTapeBeep();
            }}
            className={`px-2 py-1 rounded-sm border uppercase tracking-wider cursor-pointer transition-colors ${
              activeForensicTool === "uv_blacklight"
                ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-neutral-400"
            }`}
          >
            🔦 365nm UV Blacklight [{activeForensicTool === "uv_blacklight" ? "ON" : "OFF"}]
          </button>
        </div>
      </nav>

      {/* ── 2. LIVING CRIME SCENE VIEWPORT ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
        {/* Background Environment Image with Filter & Atmospheric Grade */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter"
          style={{
            backgroundImage: `url('${getBackdropImage(currentLocation.id)}')`,
            transform: `scale(${zoomLevel})`,
            filter:
              activeForensicTool === "uv_blacklight"
                ? "contrast(180%) brightness(50%) hue-rotate(240deg) saturate(180%)"
                : "contrast(125%) brightness(40%) saturate(60%)",
          }}
        />

        {/* Atmospheric Dust & Lighting Simulation */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-35"
          style={{
            background:
              activeForensicTool === "uv_blacklight"
                ? "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.25) 0%, rgba(5, 0, 15, 0.95) 75%)"
                : "radial-gradient(circle at 45% 40%, rgba(212, 197, 169, 0.12) 0%, rgba(9, 9, 9, 0.94) 80%)",
          }}
        />

        {/* Chiaroscuro Vignette Edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 140px rgba(0, 0, 0, 0.98)" }}
        />

        {/* Sector Information Badge */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none bg-[#151313]/90 border border-[#570B12] px-4 py-3 rounded-sm shadow-xl max-w-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D21F2B]" />
            <span className="text-[10px] text-[#D21F2B] font-bold uppercase tracking-widest">
              {currentLocation.subtitle}
            </span>
          </div>
          <h2 className="text-lg font-serif font-black uppercase text-[#E8E3D9] mt-0.5 tracking-wide">
            {currentLocation.name}
          </h2>
          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
            {currentLocation.description}
          </p>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[9px] text-[#75866A] italic">
            "{currentLocation.atmosphereTone}"
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-[#151313]/90 border border-zinc-800 p-1.5 rounded-sm shadow-xl">
          <button
            onClick={() => {
              forensicAudio.playMagnifierClick();
              setZoomLevel((z) => Math.min(1.4, z + 0.1));
            }}
            className="w-7 h-7 bg-zinc-900 hover:bg-[#570B12] text-neutral-300 hover:text-white rounded-sm text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <span className="text-[10px] px-1 text-neutral-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => {
              forensicAudio.playMagnifierClick();
              setZoomLevel((z) => Math.max(1, z - 0.1));
            }}
            className="w-7 h-7 bg-zinc-900 hover:bg-[#570B12] text-neutral-300 hover:text-white rounded-sm text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
        </div>

        {/* ── 3. INTERACTIVE HOTSPOTS ON CANVASES ── */}
        {currentLocation.hotspots.map((hs) => {
          const isSelected = selectedHotspot?.id === hs.id;
          const isUV = hs.type === "uv_scan";
          const isGlowing = isUV && activeForensicTool === "uv_blacklight";

          return (
            <motion.div
              key={hs.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15 }}
              style={{
                left: `${hs.coordinates.x}%`,
                top: `${hs.coordinates.y}%`,
              }}
              onClick={() => handleHotspotClick(hs)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
            >
              {/* Outer Pulsing Ring */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                  isGlowing
                    ? "bg-purple-900/80 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse"
                    : isSelected
                    ? "bg-[#D21F2B] border-white shadow-[0_0_15px_rgba(210,31,43,0.7)]"
                    : hs.isExamined
                    ? "bg-[#151313]/90 border-[#75866A] text-[#75866A]"
                    : "bg-[#151313]/90 border-[#D21F2B] text-neutral-200 animate-[pulse_2s_infinite]"
                }`}
              >
                <span className="text-sm select-none">{hs.icon}</span>
              </div>

              {/* Ping Ring on Unexamined Artifacts */}
              {!hs.isExamined && (
                <span className="absolute -inset-1 rounded-full border border-[#D21F2B] animate-ping pointer-events-none opacity-60" />
              )}

              {/* Tooltip on Hover */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 min-w-[150px]">
                <div className="bg-[#151313] border border-[#570B12] px-2.5 py-1.5 rounded-sm shadow-2xl text-center">
                  <span className="text-[10px] font-bold text-[#E8E3D9] uppercase tracking-wider block">
                    {hs.label}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-[8px] text-[#74777C] uppercase">[{hs.type}]</span>
                    <span
                      className={`text-[8px] uppercase font-bold ${
                        hs.isExamined ? "text-[#75866A]" : "text-[#D21F2B]"
                      }`}
                    >
                      {hs.isExamined ? "✓ EXAMINED" : "● UNEXAMINED"}
                    </span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-[#151313] border-l border-t border-[#570B12] -mt-1 rotate-45" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 4. DETAILED HOTSPOT EXAMINATION MODAL (LIGHTBOX) ── */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[460px] z-40 bg-[#151313] border-2 border-[#570B12] p-5 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{selectedHotspot.icon}</span>
                  <span className="text-[10px] font-bold text-[#D21F2B] uppercase tracking-widest">
                    FORENSIC ARTIFACT LOG // {selectedHotspot.type}
                  </span>
                </div>
                <h3 className="text-base font-serif font-black uppercase text-[#E8E3D9] mt-1">
                  {selectedHotspot.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-neutral-500 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="py-3 text-xs text-neutral-300 leading-relaxed font-sans">
              {selectedHotspot.description}
            </div>

            {/* Discovery Findings Alert */}
            {selectedHotspot.discoveredClueText && (
              <div className="my-2 p-2.5 bg-[#570B12]/40 border-l-2 border-[#D21F2B] text-xs text-[#E8E3D9]">
                <span className="text-[9px] font-mono text-[#D21F2B] font-bold uppercase block tracking-wider">
                  FORENSIC OBSERVATION:
                </span>
                <p className="mt-0.5 italic font-serif">"{selectedHotspot.discoveredClueText}"</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              {selectedHotspot.unlockedEvidenceId ? (
                <button
                  onClick={() => handleInspectFullEvidence(selectedHotspot.unlockedEvidenceId)}
                  className="px-3.5 py-2 bg-[#570B12] hover:bg-[#9D101D] text-white text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <span>📌 Pin to Evidence Board</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="text-[10px] text-neutral-500 italic">
                  Observation logged to Detective Notebook.
                </div>
              )}

              <button
                onClick={() => {
                  forensicAudio.playTapeBeep();
                  if (onOpenInterrogation) onOpenInterrogation();
                  else setWorkspaceMode("interrogation");
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-neutral-300 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                Interrogate Suspects
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
